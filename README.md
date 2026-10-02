# EVE Health+ — Diagnostic Booking Platform

> SDE Intern Assignment | Backend Engineering | EVE Healthcare

A production-ready backend service for diagnostic test bookings with mock payment processing, built on **Node.js / Express**, **MongoDB (Prisma ODM)**, and **Redis**.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  React Frontend │────▶│  Express Backend  │────▶│  MongoDB (Prisma)│
│  (Port 3000)    │     │  (Port 4000)      │     │  (Port 27017)    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │  Redis Cache │
                         │  + Slot Lock │
                         │  (Port 6379) │
                         └──────────────┘
```

**Key design decisions:**
- All DB mutations are wrapped in **Prisma transactions** for atomicity
- Slot double-booking is prevented by a **Redis distributed lock** (NX flag) — falls back to in-memory lock if Redis is unavailable
- Webhook idempotency is enforced via a **deduplicated `WebhookEvent` table** + Redis concurrency lock
- Passwords are hashed with **Argon2id** (memory-hard, resistant to GPU attacks)
- JWTs use **short-lived access tokens (15 min)** + **rotating refresh tokens (7 days)**

---

## Quick Start

### Option A — Docker Compose (Recommended)

```bash
docker compose up -d
```

This starts MongoDB, Redis, Backend, and Frontend in one command.

### Option B — Local Development

**Prerequisites:** Node.js 18+, MongoDB running locally with `--replSet rs0`, Redis

```bash
# Backend
cd apps/backend
cp .env.example .env      # Fill in your DATABASE_URL, JWT_SECRET, etc.
npm install
npm run db:generate        # Generates Prisma client
npm run db:push            # Pushes schema to MongoDB
npm run db:seed            # Seeds sample centers, tests, and users
npm run dev                # Starts with nodemon
```

**Default seeded users:**

| Role | Email | Password |
|------|-------|----------|
| PATIENT | `patient@evehealth.com` | `Patient@123` |
| CENTER_ADMIN | `admin@evehealth.com` | `Admin@123` |
| PLATFORM_ADMIN | `devops@evehealth.com` | `Admin@123` |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret for signing access tokens | ✅ |
| `REFRESH_SECRET` | Secret for signing refresh tokens | ✅ |
| `REDIS_URL` | Redis connection string | Optional (falls back to in-memory) |
| `PORT` | Server port (default: 4000) | Optional |
| `RAZORPAY_KEY_ID` | Razorpay key ID (mock value for dev) | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (mock value for dev) | Optional |

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Authentication

All protected routes require:
```
Authorization: Bearer <access_token>
```

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "firstName": "Aryan",
  "lastName": "Sharma",
  "role": "PATIENT"
}
```

**Validation Rules:**
- `password`: min 8 chars, must contain uppercase + number
- `role`: one of `PATIENT | CENTER_ADMIN | PLATFORM_ADMIN` (defaults to `PATIENT`)

**Response `201`:**
```json
{
  "message": "Account registered successfully",
  "user": { "id": "...", "email": "...", "role": "PATIENT" }
}
```

---

#### POST `/auth/login`
Authenticate and receive JWT tokens.

**Request Body:**
```json
{ "email": "user@example.com", "password": "Password@123" }
```

**Response `200`:**
```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>",
  "user": { "id": "...", "email": "...", "role": "PATIENT" }
}
```

> Account is locked after **5 consecutive failed attempts** (HTTP 423).

---

#### POST `/auth/refresh-token`
Exchange a refresh token for a new token pair (rotation strategy).

**Request Body:**
```json
{ "refreshToken": "<JWT>" }
```

---

#### GET `/auth/me` 🔒
Returns the authenticated user profile.

---

### Diagnostic Centers & Tests

#### GET `/centers`
Returns all active diagnostic centers with their test catalog.
Results are **cached in Redis for 5 minutes**.

#### GET `/centers/:id`
Returns a specific center with its tests.

#### POST `/centers` 🔒 (CENTER_ADMIN, PLATFORM_ADMIN)
Create a new diagnostic center.

**Request Body:**
```json
{
  "name": "Apollo Diagnostics",
  "location": "Connaught Place, New Delhi",
  "contactEmail": "info@apollo.com",
  "contactPhone": "+91-11-12345678"
}
```

#### POST `/centers/:centerId/tests` 🔒 (CENTER_ADMIN, PLATFORM_ADMIN)
Add a diagnostic test to a center.

**Request Body:**
```json
{
  "name": "Complete Blood Count (CBC)",
  "description": "Measures red/white blood cells and platelets",
  "category": "Haematology",
  "price": 450.00,
  "durationMin": 15,
  "prepInstructions": "Fasting for 8 hours required"
}
```

---

### Bookings

#### POST `/bookings` 🔒
Create a new diagnostic booking.

**Request Body:**
```json
{
  "testId": "<DiagnosticTest ID>",
  "centerId": "<DiagnosticCenter ID>",
  "appointmentDate": "2026-11-15T10:30:00.000Z"
}
```

**Edge cases handled:**
- Appointment must be a **future** datetime
- Slot conflict checked atomically via **Redis lock + DB query**
- Returns `409` if the slot is already booked or actively being reserved

**Response `201`:**
```json
{
  "id": "...",
  "status": "PENDING",
  "amount": 450.00,
  "payment": { "id": "...", "gatewayOrderId": "order_EVE_XXXXXXXX" }
}
```

---

#### GET `/bookings` 🔒
- **PATIENT**: Returns only their own bookings
- **CENTER_ADMIN / PLATFORM_ADMIN**: Returns all bookings

#### GET `/bookings/:id` 🔒
Returns full booking details including payment events.
Patients cannot access other users' bookings (403).

#### PATCH `/bookings/:id/reschedule` 🔒
**Request Body:** `{ "newDate": "2026-11-20T14:00:00.000Z" }`

Rules:
- Cannot reschedule `CANCELLED`, `COMPLETED`, or `FAILED` bookings
- New date must be in the future

#### PATCH `/bookings/:id/cancel` 🔒
Cancels a booking. Rules:
- Cannot cancel an already `CANCELLED` booking
- Cannot cancel a `COMPLETED` booking

#### PATCH `/bookings/:id/status` 🔒 (CENTER_ADMIN, PLATFORM_ADMIN)
Admin-only status override.
**Request Body:** `{ "status": "CONFIRMED" }`
Valid statuses: `PENDING | CONFIRMED | FAILED | CANCELLED | RESCHEDULED | COMPLETED`

---

### Payments (Mock / Simulated)

#### POST `/payments/create-order` 🔒
Creates a payment order for a booking.
**Request Body:** `{ "bookingId": "..." }`

**Response:**
```json
{
  "orderId": "order_EVE_ABCD1234",
  "amount": 450.00,
  "currency": "INR",
  "keyId": "rzp_test_evehealth_key"
}
```

#### POST `/payments/simulate` 🔒
Simulates a payment outcome. **Use this for testing.**

**Request Body:**
```json
{ "bookingId": "...", "outcome": "SUCCESS" }
```

- `outcome: "SUCCESS"` → payment status `SUCCESS`, booking → `CONFIRMED`
- `outcome: "FAILED"` → payment status `FAILED`, booking → `FAILED`

#### POST `/payments/verify` 🔒
Verifies Razorpay HMAC signature and confirms payment.

**Request Body:**
```json
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "...",
  "bookingId": "..."
}
```

#### POST `/payments/refund` 🔒 (CENTER_ADMIN, PLATFORM_ADMIN)
Processes a refund for a successful payment.
**Request Body:** `{ "bookingId": "..." }`

---

### Webhook (Idempotent)

#### POST `/payments/webhook`
Receives payment gateway webhook events. **No authentication required.**

**Request Body:**
```json
{
  "eventId": "evt_unique_id_123",
  "eventType": "payment.captured",
  "paymentId": "<Payment ID>",
  "status": "SUCCESS"
}
```

**Idempotency strategy:**
1. Checks `WebhookEvent` table for `eventId` — if already `PROCESSED`, returns 200 immediately without re-processing
2. Acquires a **Redis distributed lock** on `eventId` to prevent concurrent processing of the same event
3. All DB updates run inside a single transaction
4. Marks the event `PROCESSED` atomically

---

### Admin (PLATFORM_ADMIN only)

| Endpoint | Description |
|----------|-------------|
| `GET /admin/analytics` | System-wide metrics (users, revenue, booking stats) |
| `GET /admin/webhooks` | Last 20 webhook events |
| `POST /admin/webhooks/:id/retry` | Mark a failed webhook as retried |
| `GET /admin/users` | All registered users |
| `PATCH /admin/users/:id/toggle-lock` | Lock/unlock a user account |
| `GET /admin/audit-logs` | Last 30 audit log entries |

---

## Error Handling

All errors follow a consistent JSON format:

```json
{ "error": "Human-readable error message" }
```

For validation errors (422):
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / business rule violation |
| 401 | Not authenticated |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate booking / slot lock) |
| 422 | Validation error (field-level details provided) |
| 423 | Account locked |
| 429 | Rate limit exceeded (20 auth requests / 15 min per IP) |
| 500 | Internal server error |

---

## Bonus Features Implemented

| Feature | Implementation |
|---------|---------------|
| ✅ Redis caching | Centers list cached for 5 min, invalidated on create/update |
| ✅ Redis distributed lock | Slot booking uses `SET NX EX` atomic lock |
| ✅ Docker Compose | Full stack: MongoDB + Redis + Backend + Frontend |
| ✅ Structured logging | Winston logger (JSON in prod, colorized in dev) |
| ✅ Morgan HTTP logs | Request/response logging with method, path, status, latency |
| ✅ Rate limiting | 20 requests / 15 min per IP on all `/auth/*` routes |
| ✅ Account lockout | Locked after 5 consecutive failed login attempts |
| ✅ Refresh token rotation | Old token revoked on each refresh |
| ✅ Zod validation | Schema-validated inputs on all mutation endpoints |
| ✅ Audit logs | Every booking create/cancel/status change is logged |

---

## Data Models

```
User            DiagnosticCenter    DiagnosticTest
  id              id                  id
  email           name                centerId (→ Center)
  passwordHash    location            name
  role            contactEmail        category
  isLocked        isActive            price
  failedLogins                        durationMin

Booking         Payment             WebhookEvent
  id              id                  id
  userId          bookingId (unique)  eventId (unique)
  testId          amount              eventType
  centerId        currency            processingState
  appointmentDate gatewayOrderId      retryCount
  amount          gatewayPaymentId
  status          status
                  events (PaymentEvent[])
```

---

## Project Structure

```
eve-health-plus/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/     # Business logic (auth, booking, payment, webhook, admin, patient, centers)
│   │   │   ├── middlewares/     # authenticate, requireRole, validate (Zod)
│   │   │   ├── models/          # Mongoose schemas (MongoDB)
│   │   │   ├── utils/           # Winston logger
│   │   │   ├── routes.js        # All API route definitions
│   │   │   └── index.js         # App bootstrap, Redis setup, middleware chain
│   │   └── prisma/
│   │       ├── schema.prisma    # Data models + enums
│   │       └── seed.js          # Sample data seeder
│   └── frontend/                # React + Tailwind dashboard
├── docker-compose.yml
└── README.md
```
