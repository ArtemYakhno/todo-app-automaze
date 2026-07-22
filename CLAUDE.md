> **Language policy.** The project's code language is **English**: all backend and frontend code (UI strings, comments, identifiers, messages) is written in English. This document itself now follows that policy too. The only place Ukrainian remains is conversation with the AI assistant and plan files (`.claude/plans/`).

> **Living document.** The frontend is functionally complete for the automaze spec: task list, create/edit/delete, status changes, search, filter (all/done/undone), and priority sort — all wired to the real backend, with filter/sort/search synced to the URL. Remaining work is mobile-responsiveness polish (Stage 8 of the frontend plan) and final cleanup.

## Product overview

To-Do List — a web app built as a take-home test task for an automaze interview. A single shared task list, no login: the user views tasks, adds and deletes them, searches by text, marks them done, filters (all/done/undone), and sorts by priority.

**Functional requirements (mandatory, per the spec):**
1. List of all tasks.
2. Add a new task, delete a task.
3. Search tasks (by title/description).
4. Mark a task as done.
5. Filter by status: all / done / undone.
6. Task priority (1-10).
7. Sort by priority, asc/desc.

**Nice-to-haves (bonus, per the spec):** a real database instead of in-memory storage (done — PostgreSQL); a component library for a polished UI (done — shadcn/ui); clean code structure and reusable React components; extra features like deadlines/categories (done — `dueDate`/`tags`, implemented on the backend as a bonus beyond the spec's minimum); deployment to Vercel/Render/Railway (a separate future step).

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | NestJS, Prisma ORM 7, PostgreSQL, Swagger, `@nestjs/terminus`, `helmet`, `class-validator`/`class-transformer`, CORS, Jest |
| Frontend | React + TypeScript, Next.js (App Router), Tailwind CSS, TanStack Query, native `fetch`, shadcn/ui, React Hook Form + Zod, ESLint (`eslint-config-next`) |
| Infrastructure | Docker + docker-compose (Postgres, isolated container), pnpm workspaces (`apps/backend` + `apps/frontend`), git + GitHub |
| AI workflow | Claude Code, the `custom-flow` process, `.claude/hooks` |

## Monorepo structure

```
todo-app-automaze/
├── apps/
│   ├── backend/     # NestJS — common/ (cross-cutting: setup, configs, filters, middlewares, prisma, validators), health/, tasks/, prisma/, prisma.config.ts
│   └── frontend/    # Next.js App Router
│       └── src/
│           ├── app/         # routable App Router segments (layout, page, providers)
│           ├── features/    # feature UI, one folder per domain feature (e.g. tasks/)
│           │   └── tasks/
│           │       ├── blocks/       # components/, dialogs/, forms/ — feature-local building blocks
│           │       ├── constants/    # feature-local constants (status, filter, sort labels)
│           │       └── hooks/        # feature-local hooks (e.g. useTaskFilters)
│           ├── components/ui/  # shadcn/ui primitives only — no feature logic here
│           ├── schemas/     # Zod schemas (*.schema.ts) — runtime validation, RHF resolvers
│           ├── types/       # types inferred from Zod schemas via z.infer
│           ├── api/         # domain API calls (fetch-based)
│           ├── queries/     # TanStack Query hooks, grouped by domain
│           ├── lib/         # apiClient, queryClient, searchParams, format, utils
│           └── hooks/       # cross-feature hooks (e.g. useDebouncedValue)
├── docker-compose.yml
├── .env.example
└── .claude/
```

No separate `packages/shared`: types are defined independently in backend and frontend — a deliberate trade-off for a small project.

## Running locally

`docker compose up -d` (Postgres on `:5433`, isolated container `todo-app-automaze-postgres`, doesn't conflict with a parallel todo-app-viyar) → `pnpm install` → `pnpm dev` (backend on `:3001`, frontend on `:3000`; root `.env` based on `.env.example` — Next.js reads env only from its own root, via `dotenv` in `next.config.ts`, so there's no separate `apps/frontend/.env.local`). `pnpm typecheck`/`lint`/`test` run across all packages, or with `--filter @todo-app/backend|frontend` for a single one. Swagger — `/api`, health check — `/health`.

## Naming conventions

- React components: PascalCase, one component per file. Custom hooks: `useX.ts`.
- Feature UI lives in `src/features/<feature>/`, not in `components/`; `components/ui/` is shadcn primitives only. Inside a feature, reusable building blocks are grouped under `blocks/` (`blocks/components/`, `blocks/dialogs/`, `blocks/forms/`), with feature-local `constants/` and `hooks/` alongside.
- Zod schemas: `*.schema.ts`, only in `apps/frontend/src/schemas/` (runtime validation + RHF resolvers). Inferred types (`z.infer`) live in `apps/frontend/src/types/*.ts`, imported from there by consumers — no manual `interface`/`type`. The backend validates via class-validator DTOs (`*.dto.ts`) — a separate shape definition.
- API calls only in `api/`/`queries/` — never directly in `components/`, `app/` (enforced by `warn-fetch-in-ui.js`). Transport layer (`fetch` wrapper) — `lib/apiClient.ts`; domain calls — `api/*.ts`; TanStack Query hooks — `queries/<domain>/` with a centralized key map `<domain>Keys.ts`.

## Testing conventions

- Backend: **Jest**, `*.spec.ts` next to the file it tests (NestJS default).
- Frontend: no tests yet — planned as a separate step.
- Run: `pnpm --filter @todo-app/backend run test`.

## Git workflow

Commit at the end of each stage. Process — `custom-flow`: a separate plan per stage, explicit user confirmation before implementation.

## Architectural decisions

- **No auth/no sharing:** a deliberate departure from the original (viyar) project — automaze doesn't require login, per-user lists, or email sharing. Tasks are a single shared resource, no `ownerId`, no global guard.
- **Status filter:** `Task.status` stays three-valued (`todo`/`in_progress`/`done`) — more granular than the spec's minimum, and already covered by tests. The spec's "all/done/undone" requirement is implemented as a separate `filter` query parameter on `GET /tasks` (`done` → `status: 'done'`, `undone` → `status IN (todo, in_progress)`, `all`/absent → no filter); `status` remains as a more granular alternative, `filter` takes precedence when both are supplied.
- **UI theme:** shadcn/ui + Tailwind — no light/dark toggle; out of scope for this project.
- **Security/errors (backend):** `HttpExceptionFilter` → a unified `{ statusCode, message, errors? }` shape. `ValidationPipe` (class-validator, `whitelist`+`forbidNonWhitelisted`+`transform`, a custom `exceptionFactory` groups errors by field). CORS + `helmet` + `LoggerMiddleware`. All configuration lives in `common/setup/app.setup.ts`; `main.ts` is bootstrap only.
- **Env:** only through `ConfigService`, never `process.env` directly on the backend. **Deliberate departure from "schema-first Zod"** (the user's global CLAUDE.md) — the backend uses class-validator DTOs, not Zod.
- **Prisma 7:** `prisma.config.ts` and the driver adapter (`@prisma/adapter-pg`) are required at runtime (`schema.prisma` has no `url`); generator `output` is outside `src/`, `moduleFormat = "commonjs"` (otherwise an ESM conflict with the CommonJS backend). `PrismaService`/`PrismaModule` — `common/prisma/`, `@Global()`.
- **Health check:** `GET /health` (Terminus + a custom `PrismaHealthIndicator`, `$queryRaw SELECT 1`), public (no guard to bypass — there isn't one).
- **Frontend API layer:** `lib/apiClient.ts` — a single `fetch` wrapper (no axios; interceptors aren't needed — there's no auth), base URL from `process.env.NEXT_PUBLIC_API_URL`, throws a typed `ApiError`. Domain calls — `api/tasks.ts`/`api/health.ts`, TanStack Query hooks — `queries/tasks/` with a centralized key map `taskKeys.ts`. `lib/queryClient.ts` — a shared `QueryClient` (`retry: false`, `staleTime: 60s`, `gcTime: 5min`). The root `.env` is loaded in `next.config.ts` via `dotenv` (Next.js reads env only from its own root by default, so there's no separate `apps/frontend/.env.local`).
- **URL-synced filters:** filter/sort/search state lives in the URL (`useSearchParams`/`router.replace`), not local `useState` — shareable links, survives reload. `lib/searchParams.ts` normalizes params against defaults so default values never appear in the URL. Reading is lenient: `taskQuerySchema` uses `.catch(undefined)` per field, so garbage in the URL (e.g. `?sortBy=xxx`) falls back to defaults instead of breaking the page.
- **Dialog/grid width overflow:** `components/ui/dialog.tsx`'s `DialogContent` is a CSS grid; a `[&>*]:min-w-0` utility on its direct children, plus `min-w-0 wrap-break-word` on `Textarea`, prevents a single unbroken long word (no spaces) from forcing the grid track — and the whole dialog — wider than the viewport.

## Domain model

- `Task`: `title` (max 30 characters), `description?` (max 200 characters), `priority` (1-10), `tags` (`string[]`, max 5), `dueDate?` (not earlier than today — a custom `@IsNotPastDate()` validator, because class-validator's built-in `@MinDate()` fixes "today" at module load time rather than on each request), `status` (`todo`/`in_progress`/`done`).

## Implemented endpoints

| Method | Path | Access |
|---|---|---|
| `POST` | `/tasks` | public |
| `GET` | `/tasks` | public, `?filter`/`?status`/`?sortBy`/`?sortOrder`/`?query` |
| `GET` | `/tasks/:id` | public |
| `PATCH` | `/tasks/:id` | public |
| `PATCH` | `/tasks/:id/status` | public |
| `DELETE` | `/tasks/:id` | public |
| `GET` | `/health` | public |

Swagger — `/api`.

## AI workflow

Process — `custom-flow`: a separate plan per stage, explicit confirmation before implementation.

Hooks (`.claude/hooks/`): `block-env-files.js` (blocks reading/writing `.env`), `block-git-push.js` (confirmation before `git push`), `typecheck.js` (`tsc --noEmit` for the changed file's package), `eslint-fix.js` (`eslint --fix` for the changed file's package — both packages run on ESLint now), `warn-fetch-in-ui.js` (warns about `fetch`/`axios` outside `api/`/`queries/`, also covers `app/` for Next.js App Router files).
