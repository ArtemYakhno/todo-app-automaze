# To-Do App — automaze test task

A single-page to-do list built as a take-home test task for an **automaze** interview. No login, no accounts — one shared task list that anyone with the link can view and manage.

## Features

- **Task list** — all tasks fetched from a real PostgreSQL database, with loading, empty, and error states (with retry).
- **Create / edit / delete** — a full task form (React Hook Form + Zod) covering title, description, priority, due date, and tags; edit reuses the same form pre-filled with the task's data.
- **Status tracking** — three states (`todo` / `in_progress` / `done`), changeable inline from the task card.
- **Search** — full-text search across title and description, debounced so it doesn't fire a request on every keystroke.
- **Filter** — `all` / `done` / `undone`, per the spec.
- **Sort** — by priority, due date, or creation date, ascending or descending.
- **Shareable, refresh-safe state** — filter, sort, and search are synced to the URL query string (not local state), so a link can be shared and a page reload keeps the same view.
- **Priority (1-10)** and **due date** with overdue highlighting.
- **Tags** (up to 5 per task) — a bonus feature beyond the spec's minimum.

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | [NestJS](https://nestjs.com/), [Prisma ORM 7](https://www.prisma.io/), PostgreSQL, Swagger, `@nestjs/terminus` (health checks), `helmet`, `class-validator`/`class-transformer`, Jest |
| Frontend | React 19 + TypeScript, [Next.js 16](https://nextjs.org/) (App Router), Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com/), [TanStack Query v5](https://tanstack.com/query), React Hook Form + Zod |
| Infrastructure | Docker Compose (isolated PostgreSQL container), pnpm workspaces monorepo |

No `packages/shared`: types are defined independently on each side — a deliberate trade-off for a project this size.

## Getting started

**Prerequisites:** Node.js ≥ 24, [pnpm](https://pnpm.io/) 11, Docker (for PostgreSQL).

```bash
# 1. Start PostgreSQL in an isolated Docker container
docker compose up -d

# 2. Copy the env file and adjust it if needed
cp .env.example .env

# 3. Install dependencies for both apps
pnpm install

# 4. Apply Prisma migrations
pnpm --filter @todo-app/backend exec prisma migrate deploy

# 5. Run both apps in dev mode
pnpm dev
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:3001**
- Swagger docs: **http://localhost:3001/api**
- Health check: **http://localhost:3001/health**

> Next.js only reads environment variables from its own directory root, so the root `.env` is loaded into `apps/frontend` via `dotenv` in `next.config.ts` — no separate `apps/frontend/.env.local` needed.

### Other useful commands

```bash
pnpm dev:backend      # run only the backend
pnpm dev:frontend     # run only the frontend
pnpm typecheck        # tsc --noEmit across all packages
pnpm lint             # eslint across all packages
pnpm test             # backend Jest test suite

# Scope any command to one package:
pnpm --filter @todo-app/backend run <script>
pnpm --filter @todo-app/frontend run <script>
```

## Project structure

```
todo-app-automaze/
├── apps/
│   ├── backend/            # NestJS API
│   │   └── src/
│   │       ├── common/     # cross-cutting: setup, configs, filters, middlewares, prisma, validators
│   │       ├── health/     # GET /health (Terminus + a custom Prisma indicator)
│   │       └── tasks/      # the Task domain: controller, service, DTOs
│   └── frontend/           # Next.js App Router
│       └── src/
│           ├── app/            # routes (layout, page, providers)
│           ├── features/tasks/ # task UI: list, forms, dialogs, filters
│           ├── components/ui/  # shadcn/ui primitives only
│           ├── schemas/        # Zod schemas (single source of truth for validation)
│           ├── types/          # types inferred from Zod via z.infer
│           ├── api/            # fetch-based domain API calls
│           ├── queries/        # TanStack Query hooks
│           └── lib/            # apiClient, queryClient, searchParams, utils
├── docker-compose.yml
└── .env.example
```

## API overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks` | List tasks; supports `?filter=all\|done\|undone`, `?status`, `?sortBy=priority\|dueDate\|createdAt`, `?sortOrder=asc\|desc`, `?query=<search text>` |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks/:id` | Get a single task |
| `PATCH` | `/tasks/:id` | Update task fields |
| `PATCH` | `/tasks/:id/status` | Update task status |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/health` | Health check (DB connectivity) |

Full interactive docs at `/api` (Swagger) once the backend is running.

## Working with AI: the `custom-flow` process

This project was built together with [Claude Code](https://claude.com/claude-code) using a structured process called `custom-flow`, instead of just prompting for the whole feature at once. The idea: break the work into stages small enough to actually review, and never let the AI move to the next one without an explicit go-ahead.

For each feature, the flow looks like this:

1. **Master plan** — the work is broken into stages up front, each with its own acceptance criteria and a status marker (`todo` → `in progress` → `done`). The plan is written to `.claude/plans/<task>-<date>/plan.md` before any code is touched.
2. **Approval** — the human reviews and confirms the master plan before implementation starts.
3. **Stage plan** — a detailed implementation plan for *just* the current stage.
4. **Implement + self-check** — the AI implements the stage, then runs typecheck/lint hooks, reviews its own diff against the plan and the project's conventions, and reports back.
5. **Review** — the human decides if the stage is actually done. Feedback sends it back to step 4; approval marks it `done` and moves to the next stage.
6. **Wrap-up** — once every stage is done, a context summary is written for the plan, so a future session (or a different conversation) can pick up the "why" behind decisions without re-deriving them.

In practice this kept each change reviewable (one stage = one focused diff), caught issues early instead of after a large sweep, and left a paper trail of *why* things were built the way they were — visible in `.claude/plans/`. A few `.claude/hooks/` scripts back this up automatically: blocking edits to `.env` files, requiring confirmation before `git push`, and running typecheck/lint/`fetch`-outside-`api/`-layer checks on every relevant file change.
