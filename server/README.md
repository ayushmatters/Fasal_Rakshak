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
- The `scan/process` endpoint uses a small simulated processor which updates the Scan document after a short delay. Replace that logic with your ML model integration.
- Uploads are stored in `server/uploads` and served statically at `/uploads`.
