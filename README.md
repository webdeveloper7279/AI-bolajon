# AI Bolajon — Full-Stack EdTech App

Production-ready AI-powered children's education platform with real auth, real-time updates, and dynamic data.

## Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, Socket.io-client  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Helmet, rate limiting, Zod  
**AI:** OpenAI API (age-filtered chat, token limits per child)

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, OPENAI_API_KEY (optional), FRONTEND_URL
npm install
npm run seed    # optional: seed lessons + videos
npm run dev     # http://localhost:4000
```

### 2. Frontend

```bash
# from project root
cp .env.local.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev     # http://localhost:3000
```

### 3. MongoDB

Have MongoDB running locally (`mongodb://localhost:27017`) or set `MONGODB_URI` in `backend/.env`.

## Features (all working, no mock data)

- **Auth:** Register parent, Login, JWT (stored in localStorage + Zustand), Logout, protected routes
- **Child profiles:** Create / Edit / Delete child, age and interests in DB
- **Lessons:** Stored in MongoDB; complete lesson → save score, update progress %, add XP, unlock next; progress and XP in real time
- **Progress:** Per-child progress %, XP, level (auto-calculated), achievements; real-time via Socket.io
- **Videos:** List from DB, track watch time, save completion %, analytics
- **Games:** Logic puzzle + Math mini-game, score saved in DB, leaderboard
- **Leaderboard:** Real data, sorted by XP, live updates with Socket.io
- **Parent dashboard:** Real analytics (weekly progress, study time, XP growth, completed lessons)
- **AI Chat:** History saved, context-based, age-filtered prompts, token limit per child per day

## API (all under `/api`)

- `POST /auth/register`, `POST /auth/login`
- `GET/POST/PATCH/DELETE /children`, `GET /children/:id`
- `GET /lessons`, `GET /lessons/:id`, `POST /lessons/complete` (body: childId, lessonId, score, timeSpentSeconds)
- `GET /progress/child/:id`
- `GET /lesson-progress/child/:id`
- `GET /videos`, `POST /videos/progress` (body: childId, videoId, watchedSeconds, completed), `GET /videos/progress/:childId`
- `POST /games/submit` (body: childId, gameType: logic|math, score, maxScore)
- `POST /chat/message`, `GET /chat/history/:childId`
- `GET /leaderboard?limit=20`
- `GET /dashboard/analytics/:id`

## Real-time (Socket.io)

- Connect with `auth: { token }`. Then `emit('subscribe_child', childId)`.
- Events: `xp_updated` (totalXp, xpEarned, level), `achievement_unlocked` (achievement object).

## Environment

**Backend (.env):**  
`PORT`, `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY` (optional), `FRONTEND_URL`

**Frontend (.env.local):**  
`NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000/api`)

## Scripts

- **Root:** `npm run dev` (Next.js), `npm run build`, `npm run start`
- **Backend:** `npm run dev`, `npm run start`, `npm run seed`
