<div align="center">

<img src="public/favicon.svg" alt="IntellMeet Logo" width="80" height="80" />

# IntellMeet

### AI-powered meeting platform with real-time video, chat, transcription, and automatic action item extraction

[![MIT License](https://img.shields.io/badge/License-MIT-7C3AED.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)

[**Live Demo**]· [**API Health**]· [**Report Bug**] · [**Request Feature**]

</div>

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🎥 | **Real-time Video Meetings** | Peer-to-peer video & audio via WebRTC (simple-peer) |
| 💬 | **Live Chat** | Real-time messaging with typing indicators |
| 👥 | **Participant Presence** | Live join/leave tracking with online status badges |
| 🤖 | **AI Transcription** | Automatic transcription powered by OpenAI Whisper |
| 📝 | **AI Meeting Summaries** | GPT-3.5-turbo generates concise post-meeting summaries |
| ✅ | **Action Item Extraction** | AI automatically surfaces tasks and owners from transcripts |
| 📋 | **Kanban Task Board** | Drag-ready task board with `todo → in progress → done` workflow |
| 📊 | **Analytics Dashboard** | Meeting stats, participation trends, and productivity insights |
| 🔐 | **JWT Authentication** | Secure access + refresh token flow with rate limiting |
| ⚙️ | **User Settings** | Profile, notifications, theme, password change, and account deletion |

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, Socket.io 4 |
| **AI** | OpenAI GPT-3.5-turbo (summaries + action items) |
| **Database** | MongoDB Atlas + Mongoose |
| **Real-time** | Socket.io + simple-peer (WebRTC) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Deployment** | Vercel (frontend) · Render (backend) · MongoDB Atlas |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│                     https://your-app.vercel.app                 │
└──────────────────┬───────────────────────┬──────────────────────┘
                   │                       │
          REST (HTTPS)            WebSocket (WSS)
          axios / api.ts          socket.io-client
                   │                       │
┌──────────────────▼───────────────────────▼──────────────────────┐
│               BACKEND  (Express + Socket.io)                     │
│              https://your-backend.onrender.com                   │
│                                                                   │
│   ┌─────────────────┐        ┌──────────────────────────────┐   │
│   │  REST API        │        │  Socket.io Server            │   │
│   │  /api/auth       │        │  join-room                   │   │
│   │  /api/meetings   │        │  send-message / receive-msg  │   │
│   │  /api/tasks      │        │  webrtc-offer / answer / ICE │   │
│   │  /api/ai         │        │  typing-start / typing-stop  │   │
│   └────────┬────────┘        │  participant-presence         │   │
│            │                 └──────────────────────────────┘   │
└────────────┼──────────────────────────────────────────────────────┘
             │
    ┌────────┴──────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌────────────────┐                ┌──────────────────┐
│  MongoDB Atlas │                │   OpenAI API     │
│  Users         │                │   GPT-3.5-turbo  │
│  Meetings      │                │   (summaries +   │
│  Tasks         │                │    action items) │
└────────────────┘                └──────────────────┘
```

---

## 🚀 Live Demo

| | URL |
|--|-----|
| 🌐 Frontend | https://your-app.vercel.app |
| 🔌 Backend API | https://your-backend.onrender.com |
| ❤️ Health Check | https://your-backend.onrender.com/health |

> **Note:** The Render free tier spins down after 15 minutes of inactivity. The first request after a cold start may take ~30 seconds.

---

## 🖥 Screenshots

| Dashboard | Meeting Room |
|-----------|-------------|
| ![Dashboard](https://placehold.co/600x380/0D1117/7C3AED?text=Dashboard) | ![Meeting](https://placehold.co/600x380/0D1117/06B6D4?text=Meeting+Room) |

| Post-Meeting AI Summary | Task Board |
|------------------------|------------|
| ![Summary](https://placehold.co/600x380/0D1117/10B981?text=AI+Summary) | ![Tasks](https://placehold.co/600x380/0D1117/F59E0B?text=Task+Board) |

| Settings |
|----------|
| ![Settings](https://placehold.co/600x380/0D1117/EF4444?text=Settings) |

---

## 📦 Local Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local) **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- An [GeMINI API key](https://platform.openai.com/api-keys) (optional — AI features degrade gracefully without it)

### 1. Clone the repository

```bash
git clone 
cd IntellMeet
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# → Edit .env and fill in MONGODB_URI, JWT_SECRET, etc.

# Start dev server (port 5000)
npm run dev
```

### 3. Frontend setup

```bash
# From the project root
npm install

# (Optional) Configure environment — no .env needed for local dev
cp .env.example .env
# → Set VITE_BACKEND_URL only if your backend runs on a different port

# Start Vite dev server (port 5173)
npm run dev
```

Open **http://localhost:5173** — the app connects to the backend at `localhost:5000` automatically.

---

## 🔑 Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens |
| `CLIENT_URL` | ✅ (prod) | Vercel deployment URL — drives Socket.io & Express CORS |
| `OPENAI_API_KEY` | ⚡ | OpenAI key — required for AI features |
| `PORT` | — | Defaults to `5000`; Render sets this automatically |
| `NODE_ENV` | — | `development` or `production` |

> Copy `backend/.env.example` as a starting point.

### Frontend — `.env` (project root)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | ✅ (prod) | Render backend URL — used for both REST API calls and Socket.io |

> `localhost:5000` is the automatic fallback — no `.env` needed for local development.

---

## 📡 API Reference

All REST endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | — | Register a new user |
| `POST` | `/login` | — | Login and receive access + refresh tokens |
| `POST` | `/refresh` | — | Exchange a refresh token for a new access token |
| `POST` | `/logout` | — | Invalidate the refresh token |

### 📅 Meetings — `/api/meetings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | Get all meetings for the authenticated user |
| `POST` | `/` | ✅ | Create a new meeting |
| `GET` | `/:id` | ✅ | Get a single meeting by ID |
| `PUT` | `/:id` | ✅ | Update meeting details |
| `PUT` | `/:id/summary` | ✅ | Save AI-generated summary, transcript, and action items |
| `DELETE` | `/:id` | ✅ | Delete a meeting |

### ✅ Tasks — `/api/tasks`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | Get all tasks for the authenticated user |
| `POST` | `/` | ✅ | Create a task (manual or linked to a meeting) |
| `PUT` | `/:id` | ✅ | Update task title, status (`todo`/`inprogress`/`done`), priority, or deadline |
| `DELETE` | `/:id` | ✅ | Delete a task |

### 🤖 AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/summarize` | ✅ | Generate a meeting summary from a transcript |
| `POST` | `/action-items` | ✅ | Extract action items from a transcript |
| `POST` | `/analyze` | ✅ | Run summary + action items in parallel (combined endpoint) |

---

## ⚡ Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, userId, userName }` | Join a meeting room |
| `send-message` | `{ roomId, message: { text } }` | Send a chat message to the room |
| `webrtc-offer` | `{ to, offer }` | Route a WebRTC offer to a specific peer |
| `webrtc-answer` | `{ to, answer }` | Route a WebRTC answer back to the initiator |
| `ice-candidate` | `{ to, candidate }` | Exchange trickle ICE candidates |
| `typing-start` | `{ roomId }` | Notify room that this user started typing |
| `typing-stop` | `{ roomId }` | Notify room that this user stopped typing |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-participants` | `Participant[]` | Existing participants on initial join (used to initiate WebRTC offers) |
| `user-connected` | `{ socketId, userId, userName }` | A new peer joined the room |
| `user-disconnected` | `{ socketId, userId, userName }` | A peer left the room |
| `participant-presence` | `Participant[]` | Full updated participant list after any join/leave |
| `receive-message` | `{ id, senderName, text, time }` | Incoming chat message |
| `typing-start` | `{ socketId, userName }` | A peer started typing |
| `typing-stop` | `{ socketId }` | A peer stopped typing |
| `webrtc-offer` | `{ from, offer }` | Incoming WebRTC offer from a peer |
| `webrtc-answer` | `{ from, answer }` | Incoming WebRTC answer from a peer |
| `ice-candidate` | `{ from, candidate }` | Incoming ICE candidate from a peer |

---

## 📁 Project Structure

```
IntellMeet/
├── public/                     # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/                        # Frontend source (React + TypeScript)
│   ├── assets/
│   ├── components/
│   │   ├── ProtectedRoute.tsx   # Auth guard for protected routes
│   │   └── Sidebar.tsx
│   ├── config/
│   │   ├── api.ts               # Axios instance (uses VITE_BACKEND_URL)
│   │   └── socket.ts            # Socket.io singleton client
│   ├── hooks/
│   │   ├── useSocket.ts         # Socket connection lifecycle hook
│   │   └── useWebRTC.ts         # WebRTC peer management hook (simple-peer)
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MeetingPage.tsx      # Live meeting (Socket.io + WebRTC)
│   │   ├── PostMeetingPage.tsx  # AI summary & action items review
│   │   ├── ScheduleMeetingPage.tsx
│   │   ├── TasksPage.tsx        # Kanban task board
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── App.tsx                  # Router + route definitions
│   ├── main.tsx
│   └── index.css
├── backend/                    # Backend source (Node.js + Express)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── meetingController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── rateLimiter.js      # express-rate-limit for auth routes
│   ├── models/
│   │   ├── User.js
│   │   ├── Meeting.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── meetings.js
│   │   ├── tasks.js
│   │   └── ai.js
│   ├── services/
│   │   └── aiService.js        # OpenAI API calls (summarize + action items)
│   ├── socket/
│   │   └── socketHandler.js    # All Socket.io event handlers + room state
│   ├── server.js               # Entry point (Express + Socket.io + MongoDB)
│   ├── .env.example
│   └── package.json
├── .env.example                # Frontend env template
├── DEPLOYMENT.md               # Full deployment guide
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚢 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the complete step-by-step guide covering:

- Render (backend) — environment variables, build settings, WebSocket support
- Vercel (frontend) — environment variables, build settings
- How to redeploy after changing env vars
- Troubleshooting CORS and Socket.io cross-domain issues

**Quick reference — the two variables that matter most:**

| Platform | Variable | Value |
|----------|----------|-------|
| Render | `CLIENT_URL` | `https://your-app.vercel.app` |
| Vercel | `VITE_BACKEND_URL` | `https://your-backend.onrender.com` |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add your feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and make sure `npm run build` passes before submitting.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with ❤️ by 

⭐ Star this repo if you found it useful!

</div>
