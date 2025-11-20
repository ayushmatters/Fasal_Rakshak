# Fasal Rakshak — Backend API

This folder contains a minimal Express + MongoDB backend used by the frontend app. It provides auth, file upload (multer), scan processing (demo), and simple product/community endpoints.

Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies and run in dev mode:

```powershell
cd server
npm install
npm run dev
```

3. API endpoints:
- `POST /api/auth/signup` — register (body: name,email,password)
- `POST /api/auth/login` — login (body: email,password)
- `GET /api/auth/me` — current user (Bearer token)
- `POST /api/scan/upload` — upload file (multipart form, field `image`) (protected)
- `POST /api/scan/process/:id` — demo processing endpoint (protected)
- `GET /api/scan/:id` — get scan
- `GET /api/products` — list products
- `POST /api/products` — create product (protected)
- `GET /api/community` — list posts
- `POST /api/community` — create post (protected)

Notes
## OTP Email verification (signup)

The backend implements an email OTP flow for signup. Key points:

- OTPs are 6-digit codes, expire after `OTP_EXPIRE_MINUTES` (default 10).
- OTP values are hashed with bcrypt before saving; plaintext OTPs are never stored.
- Resend is limited to 3 times per user; attempts to brute-force are limited to 5 attempts.
- For production, move in-memory rate limits and IP counters to Redis.

Environment variables (see `.env.example`): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `JWT_SECRET`, `OTP_EXPIRE_MINUTES`, `FRONTEND_URL`.

Quick curl examples:

1) Signup (creates user, sends OTP):

```bash
curl -X POST "$VITE_API_URL/api/auth/signup" -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

Response: `{ "message": "OTP sent to email", "userId": "..." }`

2) Verify OTP:

```bash
curl -X POST "$VITE_API_URL/api/auth/verify-otp" -H "Content-Type: application/json" -d '{"email":"alice@example.com","otp":"123456"}'
```

Response: `{ "token": "...", "user": { ... } }`

3) Resend OTP:

```bash
curl -X POST "$VITE_API_URL/api/auth/resend-otp" -H "Content-Type: application/json" -d '{"email":"alice@example.com"}'
```

Development email notes:
- If SMTP is not configured, the code uses a simple JSON transport for nodemailer (convenient for dev). Use Ethereal or Mailtrap for testing in dev.
- The template is in `server/templates/otpEmail.html`.
- The `scan/process` endpoint uses a small simulated processor which updates the Scan document after a short delay. Replace that logic with your ML model integration.
- Uploads are stored in `server/uploads` and served statically at `/uploads`.
