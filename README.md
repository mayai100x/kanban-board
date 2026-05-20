# 🎯 Kanban Board

A full-stack Kanban board for task management.

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Express + TypeScript API
- **Persistence:** Markdown file (simple, human-readable)

## Quick Start

```bash
# Backend
cd backend
npm install
npm run dev    # → http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev    # → http://localhost:5173
```

The frontend proxies `/api` requests to the backend, so just open `http://localhost:5173`.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/board` | Full board state |
| POST | `/api/tasks` | Add task to backlog |
| PATCH | `/api/tasks/:id` | Update/move task |
| DELETE | `/api/tasks/:id` | Delete task |

## Tech

- **React 19** — latest stable
- **TypeScript** — strict mode
- **Tailwind v4** — CSS-first config, `@theme` customization
- **Vite 6** — fast dev server with HMR
- **Express 5** — lightweight API
- **tsx** — run TypeScript directly (no build step)
- **Zero runtime deps** — no state library, no ORM, just files and fetch
