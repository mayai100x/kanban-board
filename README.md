# 🎯 Kanban Board

A full-stack Kanban board for task management — monorepo powered by Bun.

```
kanban-board/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   ├── backend/         # Express API (Bun + TypeScript)
│   └── frontend/        # React 19 + Tailwind v4 + Vite
├── package.json         # Bun workspaces root
└── README.md
```

## Prerequisites

- [Bun](https://bun.sh/) 1.3+

## Quick Start

```bash
# Install all dependencies (workspaces)
bun install

# Start both backend + frontend
bun run dev

# Or individually:
bun run dev:backend   # → http://localhost:3001
bun run dev:frontend  # → http://localhost:5173
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

- **Bun** — runtime, package manager, workspace orchestration
- **React 19** — latest stable
- **TypeScript** — strict mode (shared types in `@kanban/shared`)
- **Tailwind v4** — CSS-first config, `@theme` customization
- **Vite 6** — fast dev server with HMR
- **Express 5** — lightweight API
- **Zero runtime deps** — no state library, no ORM, just files and fetch
