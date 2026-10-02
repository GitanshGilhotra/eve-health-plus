# 🔑 EVE Health+ Complete APIs & MongoDB Setup Guide

Yeh guide aapko batayegi ki **EVE Health+** project ko chalane ke liye kaun-kaun si APIs aur services chahiye, unhe **free me kaha se lena hai**, aur **MongoDB setup kaise karna hai**.

*(Note: Is project me ab **sirf Google Gemini** AI engine use ho raha hai, OpenAI ki koi zaroorat nahi hai!)*

---

## 📋 1. Sabhi Required APIs & Credentials ki List

| Service / API | Kaha use hoti hai | Free Tier Available? | Official Website Link |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | Primary Database (NoSQL) | ✅ 100% Free Forever (512MB M0) | [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register) |
| **Google Gemini API** | Clinical AI Symptom Triage, OCR & RAG | ✅ 100% Free Generous Limits | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Razorpay API** | Payments, Checkout & Webhooks | ✅ Free Test Mode (Unlimited) | [dashboard.razorpay.com](https://dashboard.razorpay.com/) |
| **Upstash Redis** | Concurrency Slot Locking & Caching | ✅ Free Tier (10,000 requests/day) | [upstash.com](https://upstash.com/) |
| **AWS S3 / Cloudinary** | HIPAA PDF Lab Reports Storage | ✅ Free Tier (S3 5GB / Cloudinary 25GB) | [cloudinary.com](https://cloudinary.com/) |
| **JWT Secrets** | User Login & Authentication Token | ✅ Free (Terminal se generate hoti hai) | Built-in Node.js Crypto |

---

## 🍃 2. MongoDB Setup Guide (Poora Project MongoDB Me Converted Hai)

Aapke project ko **PostgreSQL se MongoDB me completely migrate** kar diya gaya hai:
- `prisma/schema.prisma` ab **MongoDB provider** use karta hai:
  - Saare models ke pass native `_id @db.ObjectId` mappings hain.
  - Saare relations MongoDB references me convert ho chuke hain.
- `mongoose` ODM aur direct models `apps/backend/src/models/` me add kar diye gaye hain.
- `docker-compose.yml` me PostgreSQL ko **MongoDB 6.0 Replica Set** se replace kar diya gaya hai.

### Option A: MongoDB Atlas Cloud (Sabse Aasan & Recommended - 100% Free)
1. **Website par jayein**: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. **Account banayein** aur **"M0 Free Cluster"** select karein (Cloud: AWS, Region: Mumbai `ap-south-1` ya closest).
3. **Database Access** me jakar ek username aur strong password create karein (jaise: `eve_admin` / `MyPassword123`).
4. **Network Access** me jakar **"Add IP Address"** -> **"Allow Access from Anywhere (0.0.0.0/0)"** select karein.
5. **Database -> Connect -> Drivers (Node.js)** par click karein.
6. Aapko aisi connection string milegi:
   ```env
   mongodb+srv://eve_admin:<password>@cluster0.xxxxx.mongodb.net/eve_health?retryWrites=true&w=majority
   ```
7. Is URI ko `apps/backend/.env` me paste kar dein:
   ```env
   DATABASE_URL="mongodb+srv://eve_admin:<password>@cluster0.xxxxx.mongodb.net/eve_health?retryWrites=true&w=majority"
   MONGODB_URI="mongodb+srv://eve_admin:<password>@cluster0.xxxxx.mongodb.net/eve_health?retryWrites=true&w=majority"
   ```
8. Terminal me seed run karein:
   ```bash
   cd apps/backend
   npx prisma db push
   node prisma/seed.js
   ```

### Option B: Local MongoDB (Docker ya Local Installed)
- **Docker ke sath**:
  ```bash
  docker-compose up -d mongodb
  ```
- **Local URI**:
  ```env
  DATABASE_URL="mongodb://localhost:27017/eve_health?replicaSet=rs0&directConnection=true"
  MONGODB_URI="mongodb://localhost:27017/eve_health"
  ```

---

## 🤖 3. Google Gemini API Key (100% Free & Unlimited Power)

Project me ab **exclusive Google Gemini 1.5 Flash / Pro** use ho raha hai:
1. **Link par jayein**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Apne Google account se sign in karein.
3. **"Create API key"** par click karein -> **Create API key in new project**.
4. Key copy karein (`AIzaSy...`).
5. Files me daalein:
   - `apps/ai-service/.env`:
     ```env
     GEMINI_API_KEY="AIzaSy..."
     GOOGLE_API_KEY="AIzaSy..."
     ```
   - `apps/frontend/.env`:
     ```env
     VITE_GEMINI_API_KEY="AIzaSy..."
     ```

---

## 💳 4. Razorpay API Keys Kaise Nikalein (Payments & Webhooks)

1. **Website**: [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/) par free sign up karein.
2. Dashboard ke top-bar par **"Test Mode"** switch on karein (Yellow badge dikhega).
3. Left menu me **Account & Settings** -> **API Keys** par click karein.
4. **"Generate Key"** par click karein.
5. Aapko 2 cheezein milengi:
   - **Key Id**: `rzp_test_xxxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxxxx`
6. `apps/backend/.env` aur `apps/frontend/.env` me daalein:
   ```env
   RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxxx"
   RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
   ```
7. **Webhook Secret**:
   - Razorpay Dashboard -> **Settings** -> **Webhooks** -> **Add New Webhook**.
   - URL: `http://localhost:4000/api/v1/payments/webhook`
   - Secret me apna custom secret likhein jaise `whsec_evehealth_test_secret`.
   - Events select karein: `payment.captured`, `payment.failed`, `refund.processed`.

---

## ⚡ 5. Redis Setup (Upstash Free Cloud)

Concurrency slot lock ke liye Redis chahiye:
1. **Website**: [https://upstash.com/](https://upstash.com/) (Free account banayein).
2. **"Create Database"** -> Name: `eve-redis` -> Region: India/closest select karein.
3. Details page par **"Redis Connect"** se standard URL copy karein:
   ```env
   REDIS_URL="rediss://default:xxxxxxxxx@xxxx.upstash.io:6379"
   ```
4. `apps/backend/.env` me update karein.

---

## 🔒 6. JWT Security Secrets Kaise Generate Karein

Iske liye koi website nahi chahiye, terminal me ye command chalayein:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Do alag-alag keys generate karke daalein:
```env
JWT_SECRET="c8e79b9101f34d7f87bf4c03b1de956b9c97b6928e08d13e01bc6c1f2081d604"
REFRESH_SECRET="58e1c66f7f32997b653c0bf11a011de3efbb2cb80173b22cfdcbb55e71e7d23a"
```
