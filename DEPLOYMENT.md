# IntellMeet — Deployment Guide

## Architecture

| Layer | Platform | Repo path |
|-------|----------|-----------|
| Frontend (React + Vite) | **Vercel** | `/` (root) |
| Backend (Express + Socket.io) | **Render** | `/backend` |
| Database | MongoDB Atlas | — |

---

## 1. Backend — Render

### Service type
**Web Service** (not Static Site).

### Build & start commands
| Field | Value |
|-------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |

### Required environment variables

Set these in **Render → Environment → Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Render sets this automatically — do **not** set manually | — |
| `NODE_ENV` | Runtime mode | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/intellmeet` |
| `JWT_SECRET` | Secret for signing access tokens | any long random string |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | any long random string |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| **`CLIENT_URL`** | **Your Vercel deployment URL** (no trailing slash) | `https://intell-meet-ten.vercel.app` |

> [!IMPORTANT]
> `CLIENT_URL` is the key variable that unlocks cross-domain Socket.io + CORS.
> It must match the exact origin Vercel serves your app from (check the Vercel dashboard).

### Health check
After deploying, visit `https://your-backend.onrender.com/health` — you should see:
```json
{ "status": "healthy", "socketConnections": 0, "allowedOrigins": ["https://your-app.vercel.app", ...] }
```

---

## 2. Frontend — Vercel

### Framework preset
Select **Vite** (Vercel auto-detects it).

### Build settings (usually auto-detected)
| Field | Value |
|-------|-------|
| Root directory | `.` (project root) |
| Build command | `npm run build` |
| Output directory | `dist` |

### Required environment variables

Set these in **Vercel → Settings → Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| **`VITE_BACKEND_URL`** | Your Render backend URL (no trailing slash) | `https://intellmeet-59wr.onrender.com` |

> [!IMPORTANT]
> Variables prefixed with `VITE_` are the only ones Vite exposes to the browser bundle.
> Do **not** put secrets (JWT keys, DB URIs) here.

---

## 3. Redeploy after changing env vars

### Render
1. Go to **Render → your service → Environment**
2. Add / update the variable
3. Click **"Save Changes"** — Render will **automatically redeploy**

### Vercel
1. Go to **Vercel → your project → Settings → Environment Variables**
2. Add / update the variable
3. Go to **Deployments → ⋯ → Redeploy** (env changes do not auto-trigger a rebuild)
   - Or push a new commit — any push triggers a fresh build with the latest env vars

---

## 4. Local development (no .env needed)

The code defaults to `localhost` when env vars are absent:

| Config | Local fallback |
|--------|---------------|
| `VITE_BACKEND_URL` | `http://localhost:5000` |
| `CLIENT_URL` | `http://localhost:5173` (hardcoded in `allowedOrigins`) |

So you can run locally with zero configuration:
```bash
# Terminal 1 — backend
cd backend && npm run dev    # :5000

# Terminal 2 — frontend
npm run dev                  # :5173
```

---

## 5. Socket.io across domains (how it works)

```
Browser (Vercel)  ──── WSS ────▶  Render backend
  VITE_BACKEND_URL               CLIENT_URL in allowedOrigins
```

Both transports are enabled (`websocket` then `polling` fallback) so it works even behind Render's reverse proxy. Render supports WebSocket upgrades natively on Web Services.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Socket disconnects immediately | `CLIENT_URL` not set / wrong on Render | Check Render env vars |
| `403 CORS` on REST calls | `VITE_BACKEND_URL` wrong on Vercel | Verify Vercel env vars |
| Blank page on Vercel | Missing `base: '/'` in `vite.config.ts` | Already set ✓ |
| WebRTC no video | Browser blocks camera on non-HTTPS | Ensure both Vercel & Render use HTTPS |
| Render sleeps (free tier) | Free Render services sleep after 15 min inactivity | Upgrade to paid, or use an uptime monitor |
