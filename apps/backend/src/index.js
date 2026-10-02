const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const Redis = require("ioredis");
const { connectMongoDB } = require("./models");

dotenv.config();

const prisma = new PrismaClient();

// ─── Redis: graceful fallback to in-memory cache ─────────────────────────────
const memoryCache = new Map();
let rawRedisClient = null;
let isRedisConnected = false;

try {
  rawRedisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) return null;
      return 1000;
    },
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  rawRedisClient.on("error", (err) => {
    if (err.code === "ECONNREFUSED") isRedisConnected = false;
  });

  rawRedisClient.connect().then(() => {
    isRedisConnected = true;
    console.log("⚡ Redis Cache & Concurrency Lock connected");
  }).catch(() => {
    isRedisConnected = false;
    console.log("ℹ️  Redis offline — using In-Memory Cache & Lock engine");
  });
} catch (e) {
  isRedisConnected = false;
  console.log("ℹ️  Running In-Memory Cache & Lock engine");
}

/**
 * Resilient Redis proxy.
 * Delegates to live Redis when available, falls back to memoryCache transparently.
 */
const redis = {
  async get(key) {
    if (isRedisConnected && rawRedisClient && rawRedisClient.status === "ready") {
      try { return await rawRedisClient.get(key); } catch (e) {}
    }
    const item = memoryCache.get(key);
    if (item && item.expiresAt && item.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item ? item.value : null;
  },

  async set(key, value, ...args) {
    if (isRedisConnected && rawRedisClient && rawRedisClient.status === "ready") {
      try { return await rawRedisClient.set(key, value, ...args); } catch (e) {}
    }
    let ttlMs = 30_000;
    const exIdx = args.indexOf("EX");
    if (exIdx !== -1 && args[exIdx + 1]) ttlMs = parseInt(args[exIdx + 1], 10) * 1000;

    const nxIdx = args.indexOf("NX");
    if (nxIdx !== -1 && memoryCache.has(key)) {
      const existing = memoryCache.get(key);
      if (!existing.expiresAt || existing.expiresAt > Date.now()) return null;
    }

    memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return "OK";
  },

  async del(key) {
    if (isRedisConnected && rawRedisClient && rawRedisClient.status === "ready") {
      try { return await rawRedisClient.del(key); } catch (e) {}
    }
    memoryCache.delete(key);
    return 1;
  },

  on(...args) {
    if (rawRedisClient) rawRedisClient.on(...args);
  },
};

// ─── Database connection ──────────────────────────────────────────────────────
connectMongoDB();

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// HTTP request logging (Apache combined format in production, colorised dev format locally)
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP. Please try again after 15 minutes." },
});

// ─── Export singletons before routes to avoid circular dependency issues ──────
module.exports = { prisma, redis };

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes = require("./routes");

app.use("/api/v1/auth", authLimiter);   // Apply rate limiter to auth namespace
app.use("/api/v1", routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: "mongodb",
    redis: isRedisConnected ? "connected" : "in-memory-fallback",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 EVE Health+ Backend Gateway running on port ${PORT}`);
});
