# EVE Health+ Local Setup Guide

## Prerequisites
- Node.js >= 20.x
- npm >= 9.x
- Docker & Docker Compose
- Python 3.11+ (for AI Service)

## Step-by-Step Installation

### 1. Install Dependencies
```bash
# Run at root workspace
cmd /c npm install
```

### 2. Environment Variables Setup
Create `.env` inside `apps/backend/`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/eve_health?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecretjwtkey_for_development_only
REFRESH_SECRET=supersecretrefreshkey_for_development_only
PORT=4000
```

### 3. Database Generation & Seeding
```bash
# Generate Prisma Client
cmd /c npm run db:generate --workspace=apps/backend

# Push Schema to PostgreSQL
cmd /c npm run db:push --workspace=apps/backend

# Seed Demo Centers, Tests, and Users
cmd /c npm run db:seed --workspace=apps/backend
```

### 4. Start Development Servers
```bash
# Start Frontend SPA (Vite)
cmd /c npm run dev --workspace=apps/frontend

# Start Backend API Gateway
cmd /c npm run dev --workspace=apps/backend

# Start FastAPI AI Service
cd apps/ai-service
python main.py
```
