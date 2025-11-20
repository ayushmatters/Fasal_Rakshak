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

## OTP Email Verification (Signup)

The backend implements a reliable email OTP flow for signup with guaranteed delivery. Key points:

- **OTP Generation & Storage**: 6-digit codes expire after `OTP_EXPIRE_MINUTES` (default 10). Values are hashed with bcrypt before saving; plaintext OTPs are never persisted.
- **Email Delivery Guarantee**: All email send operations are **awaited synchronously**. Frontend only receives `{ ok: true }` after the email has been successfully dispatched by the SMTP transporter.
- **Rate Limiting**: Resend is limited to 3 times per user; brute-force attempts are limited to 5 OTP tries; signup attempts are rate-limited per IP (10 per hour).
- **Request Correlation**: All email operations generate a `requestId` for troubleshooting and logging.
- **Error Handling**: On email send failure, the endpoint returns HTTP 502 with `{ ok: false, message, reason, requestId }` so the frontend can display the error and users can report the `requestId` for support.

### Environment Variables

```bash
# SMTP Configuration (required for production; Ethereal test account auto-generated for dev)
SMTP_HOST=your-smtp-server.com          # Leave empty to auto-generate Ethereal account in dev
SMTP_PORT=587                           # Default 587 (TLS)
SMTP_USER=your-smtp-user                # Leave empty for dev/Ethereal
SMTP_PASS=your-smtp-password            # Leave empty for dev/Ethereal
SMTP_SECURE=false                       # Set true for port 465 (SSL)

# Email & OTP
EMAIL_FROM=noreply@fasal-rakshak.local
OTP_EXPIRE_MINUTES=10
FRONTEND_URL=http://localhost:5173

# Other
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://localhost:27017/fasal_rakshak
```

### Email Delivery Testing & Debugging

#### 1. Test Email Endpoint

Send a test email to verify your transporter configuration:

```bash
curl "http://localhost:5000/api/debug/test-email?to=your-email@example.com"
```

**Response** (success with Ethereal):
```json
{
  "ok": true,
  "message": "Test email sent successfully",
  "messageId": "<msg-id@example.com>",
  "previewUrl": "https://ethereal.email/message/...",
  "requestId": "6y7n2-a1b2c",
  "transporter": { "ethereal": true, "verified": true }
}
```

#### 2. Check Transporter Status

```bash
curl "http://localhost:5000/api/debug/transporter-status"
```

#### 3. View Email Logs

```bash
curl "http://localhost:5000/api/debug/email-logs?limit=20"
```

#### 4. Signup Flow (Full Example)

```bash
# Step 1: Signup (creates user and sends OTP email)
curl -X POST "http://localhost:5000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'

# Response: { "ok": true, "message": "OTP sent to email", "userId": "...", "requestId": "..." }
# or on error: { "ok": false, "message": "Failed to send OTP email", "reason": "...", "requestId": "..." }

# Step 2: Check email logs to find OTP (if using Ethereal, check previewUrl)
curl "http://localhost:5000/api/debug/email-logs"

# Step 3: Verify OTP
curl -X POST "http://localhost:5000/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","otp":"123456"}'

# Response: { "ok": true, "token": "...", "user": { ... } }
```

### Development Workflow

1. **Without SMTP Config (Recommended for local dev)**:
   - Leave `SMTP_HOST` blank in `.env`
   - The backend automatically creates an **Ethereal test account** at startup
   - Ethereal credentials are logged to console on startup
   - Email preview URLs are included in API responses for easy testing in the browser

2. **With Real SMTP or Ethereal**:
   - Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env`
   - Test with `GET /api/debug/test-email?to=your@email.com`

3. **Production**:
   - Use SendGrid, AWS SES, or your own SMTP server
   - Set real `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in env
   - Disable debug endpoints (they're only mounted in non-production)
   - Remove the dev-only section from `server/templates/otpEmail.html`

### Local Demo File Link

For development/testing, emails include a link to the demo recording:
```
file:///mnt/data/Recording 2025-11-19 203905.mp4
```

**Remove this section before deploying to production.** See `server/templates/otpEmail.html`.

---

## Other Notes

The `scan/process` endpoint uses a small simulated processor which updates the Scan document after a short delay. Replace that logic with your ML model integration.

Uploads are stored in `server/uploads` and served statically at `/uploads`.

For production, move in-memory rate limits and IP counters to Redis or a similar store.
