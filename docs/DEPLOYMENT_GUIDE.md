# EVE Health+ Production Deployment Guide

## Overview

EVE Health+ can be deployed to any Docker environment or Kubernetes cluster.

## Single Command Docker Compose Deployment

```bash
docker-compose up -d --build
```

This launches:
1. `eve_postgres` (PostgreSQL 15 on port 5432)
2. `eve_redis` (Redis 7 on port 6379)
3. `eve_backend` (Node.js API Gateway on port 4000)
4. `eve_ai_service` (FastAPI AI Engine on port 8000)
5. `eve_frontend` (Nginx + Vite SPA on port 3000)

## Service Health Check Ports
- **Frontend SPA**: `http://localhost:3000`
- **Backend API Health**: `http://localhost:4000/health`
- **AI Service Health**: `http://localhost:8000/health`
- **OpenAPI Swagger Docs**: `http://localhost:8000/docs`
