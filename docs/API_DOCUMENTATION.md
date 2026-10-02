# EVE Health+ API Documentation

All REST API endpoints are versioned under `/api/v1`.

## Auth Endpoints

### 1. Register User
`POST /api/v1/auth/register`
```json
{
  "email": "patient@evehealth.com",
  "password": "Password123!",
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "role": "PATIENT"
}
```

### 2. Login User
`POST /api/v1/auth/login`
```json
{
  "email": "patient@evehealth.com",
  "password": "Password123!"
}
```
**Response**: Returns `accessToken` (15 min expiry) and sets `refreshToken` HttpOnly cookie.

---

## Diagnostic Centers & Tests

### 1. Get All Diagnostic Centers
`GET /api/v1/centers`  
*Cached in Redis for 300 seconds.*

### 2. Get Center Details
`GET /api/v1/centers/:id`

---

## Booking Engine

### 1. Create Slot Booking
`POST /api/v1/bookings`  
*Protected by JWT Auth & Redis Distributed Slot Lock.*
```json
{
  "centerId": "center_1",
  "testId": "test_cbc_1",
  "appointmentDate": "2026-10-02T09:30:00Z"
}
```

### 2. Reschedule Booking
`PATCH /api/v1/bookings/:id/reschedule`
```json
{
  "newDate": "2026-10-05T11:00:00Z"
}
```

---

## Webhooks & Payments

### 1. Payment Webhook (Idempotent)
`POST /api/v1/payments/webhook`
```json
{
  "eventId": "evt_rzp_991823012",
  "eventType": "payment.captured",
  "paymentId": "pay_EVE_99210481",
  "status": "SUCCESS"
}
```

### 2. Simulate Payment Endpoint
`POST /api/v1/payments/simulate`
```json
{
  "bookingId": "bk_1002",
  "outcome": "SUCCESS"
}
```

---

## AI Service Endpoints

### 1. Symptom Analyzer
`POST /api/v1/ai/symptom-analyzer` (Port 8000)
```json
{
  "symptoms": "Feeling tired, cold intolerance, weight gain"
}
```

### 2. RAG Medical Vector Search
`POST /api/v1/ai/rag/query` (Port 8000)
```json
{
  "query": "Fasting rules for thyroid vs lipid test"
}
```
