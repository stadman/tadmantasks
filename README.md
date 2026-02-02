# TadmanTasks

Visual kanban board for managing TASKS.md - full CRUD task management for the OpenClaw workspace.

## Features

- ✅ Create new tasks with all fields (title, description, status, category, project, blocker)
- ✅ Edit existing tasks
- ✅ Delete tasks with confirmation
- ✅ Drag-and-drop between status columns
- ✅ Category filtering (Konsensys, TadmanHome, Admin, McFly)
- ✅ Real-time updates
- ✅ Reads/writes directly to `~/.openclaw/workspace/TASKS.md`

## Running Locally

**Development mode:**
```bash
cd tadmantasks
npm run dev
```

Access at: **http://localhost:3001**

**Production mode:**
```bash
cd tadmantasks
npm run build
npm start
```

## Ports

- **TadmanTasks:** http://localhost:3001
- **TadmanHome:** http://localhost:3000 (separate app)

## Tech Stack

- Next.js 16 (Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- @dnd-kit for drag-and-drop
- Server-side TASKS.md parsing

## How It Works

1. **Server-side:** Parses `~/.openclaw/workspace/TASKS.md` via API routes
2. **Client-side:** React UI with drag-drop, forms, filtering
3. **Write-back:** Updates are written back to TASKS.md in proper markdown format

## Deployment

This app requires local filesystem access to read/write TASKS.md, so it runs on the Mac Mini rather than serverless (Vercel).

## GitHub

https://github.com/stadman/tadmantasks
