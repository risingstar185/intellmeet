# IntellMeet — Project Brain Context

This file serves as the core system and architectural context for IntellMeet, designed to be fed into LLM prompts to save context tokens and provide quick alignment.

---

## 📌 Project Overview
- **Name:** IntellMeet — AI-powered video meeting platform
- **Repository:** `https://github.com/priyansh-rai109/IntellMeet.git` (branch: `main`)
- **Frontend URL:** `https://intell-meet-ten.vercel.app` (Vercel)
- **Backend URL:** `https://intellmeet-59wr.onrender.com` (Render)

---

## 🛠 Tech Stack
### Frontend:
- React 19 + TypeScript + Vite + Tailwind CSS
- State Management: Zustand
- Video & Signaling: WebRTC + Socket.io-client
- Routing: React Router v6
- Icons: `lucide-react`

### Backend:
- Runtime: Node.js + Express
- Database: MongoDB + Mongoose
- Security & Auth: JWT + `bcryptjs` + `google-auth-library` + `cors` + `helmet` + `express-rate-limit`
- AI Integration: OpenAI API (`gpt-3.5-turbo` ONLY)
- HTTP Client: `axios`

---

## 🎨 Design System & Guidelines
- **Core Background:** `#0a0f1a` (deep dark navy)
- **Card Background:** `rgba(255, 255, 255, 0.04)` with `border-white/8` and `backdrop-blur-md`
- **Primary Accent:** `#3b82f6` (Electric Blue) — **⚠️ NO purple anywhere!**
- **Typography:** Headings in `white`, body/subtext in `gray-400`
- **Buttons:** `bg-blue-600` hover `bg-blue-500` with `rounded-xl`
- **Hover Glow Effects:** `box-shadow: 0 0 20px rgba(59, 130, 246, 0.4)`
- **Layout Panels:** `rounded-2xl p-6 glassmorphism`

---

## 📂 Codebase Structure & Key Files

### Frontend (`src/`)
- `src/pages/`
  - `LandingPage.tsx` ✅ (Dark theme, 3D effects)
  - `LoginPage.tsx` ✅ (Dark theme, Google OAuth, badges removed)
  - `RegisterPage.tsx` ✅ (Dark theme, badges removed)
  - `DashboardPage.tsx` ✅ (Dark theme, glass cards)
  - `PostMeetingPage.tsx` ✅ (PDF export, share button)
  - `TasksPage.tsx` ✅ (Dark kanban board)
  - `SettingsPage.tsx` ✅ (Dark theme)
  - `MeetingPage.tsx` ✅ (WebRTC/Socket controls, **fully mobile responsive**)
  - `ScheduleMeetingPage.tsx` ✅ (Dark theme)
  - `AnalyticsPage.tsx` ✅ (Dark theme)
- `src/components/`
  - `Sidebar.tsx` ✅ (Blue active states, no purple)
  - `ProtectedRoute.tsx` (Auth gatekeeper)

### Backend (`backend/`)
- `controllers/`
  - `authController.js`
  - `googleAuthController.js` ✅ (Google OAuth processing)
  - `meetingController.js`
  - `taskController.js`
- `routes/`
  - `auth.js` (Endpoints: `/login`, `/register`, `/google`, `/refresh`, `/logout`)
  - `meetings.js`
  - `tasks.js`
  - `ai.js`
  - `webrtc.js`
- `services/`
  - `aiService.js` (`gpt-3.5-turbo` with built-in retry logic)
- `models/`
  - `User.js` (Fields: `name`, `email`, `passwordHash`, `googleId`, `avatar`, `role`, `refreshToken`)
- `middleware/`
  - `rateLimiter.js`

---

## 🔒 Authentication Flow
1. **Email/Password:** Traditional login returning JWT access and refresh tokens, stored in `localStorage`.
2. **Google OAuth:** Frontend fetches ID token via Google One Tap/GSI → `POST /api/auth/google` → backend validates and issues application JWTs.
3. **Protected Routes:** Handled via `ProtectedRoute.tsx` inspecting active JWT.

---

## ⚙️ Environment Variables

### Frontend (`.env`)
```ini
VITE_GOOGLE_CLIENT_ID=148263829969-3ateb5amsdd2d3don5djlqjalkp14k8o.apps.googleusercontent.com
```

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=intellmeet_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=intellmeet_refresh_secret_key_2026
CLIENT_URL=https://intell-meet-ten.vercel.app
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLIENT_ID=148263829969-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

---

## 🚀 Status & Features

### Completed Features:
- Unified dark navy theme across pages.
- Email/password and Google OAuth workflows.
- WebRTC + Socket.io multi-user video meetings.
- Quick copy room invite links.
- AI meeting summarization (`gpt-3.5-turbo`).
- Interactive Kanban Board (Tasks).
- Meeting analytics dashboard.
- Meeting scheduling and PDF summary export.
- UptimeRobot setup pings backend `/health` every 5 mins to prevent Render cold starts.

### Pending/In-Progress:
- [ ] Screen share (`getDisplayMedia`) logic integration
- [ ] Account picker configuration for Google OAuth

---

## ⚠️ Known Issues / Details
- **OpenAI Limit:** The platform has access to `gpt-3.5-turbo` only. Do not upgrade API prompts to GPT-4.
- **Google Sign-In script:** Loaded in `index.html` without async/defer causing strict timing dependency on window events.
- **Vercel Env:** `VITE_GOOGLE_CLIENT_ID` must not contain trailing newlines in the dashboard variables.

---

## 📜 Development Rules
1. **Preserve Logic:** Keep WebRTC, sockets, APIs, state hooks, and handlers intact during UI refactors.
2. **Styling Priority:** 
   - Use Tailwind responsive classes for structure and standard layout.
   - Use inline styles specifically for complex `backdrop-filter`, 3D transforms, and glow animations.
3. **Icons:** Use `lucide-react` imports only.
4. **API Requests:** Perform via the custom `api` axios instance.
5. **No Purple:** Respect the accent colors; everything must lead back to the blue color palette.
