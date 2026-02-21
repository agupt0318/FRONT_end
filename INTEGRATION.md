# PostureTrack — Full-Stack Integration Guide

## Architecture

```
Frontend (Vite + React)          Backend (FastAPI)           Database
        │                               │                    (Supabase)
        │  HTTP + JWT Bearer            │                        │
        ├──────────────────────────────►│                        │
        │   /api/auth/login             │  supabase-py           │
        │   /api/sessions/              │◄──────────────────────►│
        │   /api/leaderboard/           │                        │
        │   /api/users/me               │                        │
```

---

## 1 — Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `backend/schema.sql`
3. From **Project Settings → API**, copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`  *(keep this secret!)*

---

## 2 — Backend Setup

```bash
cd backend
cp .env.example .env          # fill in your values
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Swagger UI available at: http://localhost:8000/docs

### Environment variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (server-only) |
| `JWT_SECRET` | Random secret for signing JWTs (`openssl rand -hex 32`) |
| `FRONTEND_URL` | Frontend origin for CORS (prod only) |

---

## 3 — Frontend Setup

```bash
# In the project root
cp .env.local.example .env.local   # set VITE_API_URL if backend isn't on port 8000
npm install
npm run dev
```

---

## File Map

### New backend files
```
backend/
├── main.py          # FastAPI app + CORS + router mounting
├── database.py      # Supabase client singleton
├── schemas.py       # Pydantic models (mirrors TS interfaces)
├── auth_utils.py    # JWT + bcrypt helpers
├── schema.sql       # Supabase table definitions
├── requirements.txt
├── .env.example
└── routers/
    ├── auth.py          # POST /api/auth/login|register|token  GET /api/auth/me
    ├── sessions.py      # GET|POST /api/sessions/  GET|DELETE /api/sessions/{id}
    ├── users.py         # GET|PATCH /api/users/me
    └── leaderboard.py   # GET /api/leaderboard/
```

### New / modified frontend files
```
src/app/
├── api/
│   └── client.ts        # Typed fetch wrapper + token storage
├── hooks/
│   └── useApi.ts        # useSessions, useLeaderboard, useWeeklyData, …
├── context/
│   └── AuthContext.tsx  # Now calls real API (was simulated)
└── pages/
    ├── Dashboard.tsx    # Uses useSessions + useWeeklyData
    └── Leaderboard.tsx  # Uses useLeaderboard
```

---

## API Reference

### Auth
| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password}` | — |
| POST | `/api/auth/login` | `{email, password}` | — |
| GET | `/api/auth/me` | — | ✅ |

### Sessions
| Method | Path | Notes |
|---|---|---|
| GET | `/api/sessions/?limit=7` | Current user's sessions |
| POST | `/api/sessions/` | Create + update user stats |
| GET | `/api/sessions/{id}` | Single session |
| DELETE | `/api/sessions/{id}` | Delete |

### Users
| Method | Path | Notes |
|---|---|---|
| GET | `/api/users/me` | Full profile |
| PATCH | `/api/users/me` | Update name / leaderboard opt-in |

### Leaderboard
| Method | Path | Notes |
|---|---|---|
| GET | `/api/leaderboard/?limit=20` | Opt-in users sorted by score |

---

## Remaining integrations (not yet wired)

- **Tracker page** — call `sessionsApi.create()` when a session ends
- **Settings page** — call `usersApi.update()` for profile/privacy changes
- **Login page** — already calls `authApi.login()` via `AuthContext`
- **Streak calculation** — currently simplified; add proper consecutive-day logic in `sessions.py → _update_user_stats`
