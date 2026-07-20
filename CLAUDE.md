> **Living document.** Bootstrap-план завершено (Stage 10 з 11). Домен-моделі, автентифікація, CRUD-ендпоінти, шеринг по email — окремий наступний фічовий план.

## Product overview

To-Do List — web-застосунок, тестове завдання для співбесіди в Viyar. Користувач логіниться, створює задачі, змінює їхній статус, фільтрує й сортує список, і може поділитись своїм списком задач по email з іншим користувачем.

**Функціональні вимоги (обов'язкові):**
1. Сторінка логіну (email + пароль) — без саморєестрації, користувачі лише через seed.
2. Створення задач: `title`, `description`, `priority` (1-5), `tags`, `dueDate`.
3. Зміна статусу задачі (todo / in progress / done).
4. Редагування і видалення власних задач (CRUD).
5. Фільтрація за статусом.
6. Сортування за `priority`, `dueDate`, `createdAt`, з напрямком asc/desc.
7. Перемикання теми (light/dark) на shadcn/ui.
8. Шеринг списку задач по email (read-only live-посилання).
9. Мобільна адаптивність.
10. Тести — backend і frontend.

**Бажані (bonus):** задеплоєний застосунок за посиланням; акуратний, візуально приємний frontend; продемонстроване й пояснюване використання AI-асистентів на кожному етапі.

## Технологічний стек

| Шар | Технології |
|---|---|
| Backend | NestJS, Prisma ORM 7, PostgreSQL, JWT auth (Passport-JWT + argon2), Swagger, `@nestjs/terminus`, Nodemailer, `helmet`, `class-validator`/`class-transformer`, CORS, Jest |
| Frontend | React + TypeScript, Vite, React Router, TanStack Query, axios, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Vitest |
| Інфраструктура | Docker + docker-compose (Postgres), pnpm workspaces (`apps/backend` + `apps/frontend`), git + GitHub |
| AI-workflow | Claude Code, custom-flow процес, `.claude/hooks` |

## Структура монорепо

```
todo-app-viyar/
├── apps/
│   ├── backend/     # NestJS — common/ (cross-cutting: setup, configs, filters, middlewares, prisma), health/, prisma/, prisma.config.ts
│   └── frontend/    # Vite + React — api/, queries/, features/, components/ (+ ui/ shadcn), pages/, lib/
├── docker-compose.yml
├── .env.example
└── .claude/
```

Без окремого `packages/shared`: Zod-схеми й типи визначаються окремо в backend і frontend — свідомий trade-off для невеликого проєкту.

## Локальний запуск

`docker compose up -d` (Postgres `:5432`) → `pnpm install` → `pnpm dev` (backend `:3001`, frontend `:5173`, `.env` у корені за зразком `.env.example`). `pnpm typecheck`/`lint`/`test` — по всіх пакетах, або з `--filter @todo-app/backend|frontend` для одного. Swagger — `/api`, health-check — `/health`.

## Naming conventions

- React-компоненти: PascalCase, один компонент на файл. Custom hooks: `useX.ts`.
- Zod-схеми: `*.schema.ts`, лише у `apps/frontend/src/**/schemas/` (RHF-резолвери). Backend валідує через class-validator DTO (`*.dto.ts`) — окреме визначення форми, див. "Архітектурні рішення".
- API-виклики лише в `api/`/`queries/` — ніколи напряму в `components/`, `pages/`, `features/` (контролює `warn-fetch-in-ui.js`).

## Testing conventions

- Backend: **Jest**, `*.spec.ts` поруч з файлом (дефолт NestJS).
- Frontend: **Vitest**, `*.test.tsx` поруч з файлом (нативний для Vite).
- Запуск: `pnpm --filter @todo-app/backend|frontend run test`.

## Git workflow

Коміт по завершенню кожного stage. Процес — `custom-flow`: окремий план на кожен stage, явне підтвердження користувача до реалізації.

## Архітектурні рішення

- **Шеринг по email:** read-only лінк за криптовипадковим `ShareToken` (прив'язаний до `ownerId`, без email-верифікації одержувача, без акаунту в одержувача). Email — Nodemailer + SMTP.
- **Auth (JWT):** access (~15хв) + refresh (httpOnly cookie, ~7-30д), `argon2`. Без саморєестрації — юзери лише через `prisma/seed.ts` (швидший демо-логін, email лишається потрібним тільки для шерингу).
- **UI-тема:** shadcn/ui + Tailwind, CSS-variables light/dark.
- **Роутинг:** `/login` (публічний), `/tasks` (за `ProtectedRoute`), `/shared/:token` (публічний read-only).
- **Безпека/помилки (backend):** глобальний `JwtAuthGuard` + `@Public()`-винятки. `HttpExceptionFilter` → уніфікований `{ statusCode, message, errors? }` (без поля `error`). `ValidationPipe` (class-validator, `whitelist`+`forbidNonWhitelisted`+`transform`, кастомний `exceptionFactory` групує помилки по полях). CORS + `helmet` + `LoggerMiddleware`. Уся конфігурація — в `common/setup/app.setup.ts`, `main.ts` лише bootstrap.
- **Env:** тільки через `ConfigService`, ніколи `process.env` напряму. **Свідомий відхід від "schema-first Zod"** (global CLAUDE.md користувача) — backend на class-validator DTO, а не Zod; рішення користувача від 2026-07-19, не забуте узгодження.
- **`@Global() CommonModule`-патерн:** для сервісів, потрібних кільком модулям (напр. майбутній `HashService`) — окремий `@Global()`-модуль замість дублювання імпортів. Застосувати в фічовому плані за потреби.
- **Prisma 7:** `prisma.config.ts` і driver adapter (`@prisma/adapter-pg`) обов'язкові в рантаймі (`schema.prisma` без `url`); generator `output` — поза `src/`, `moduleFormat = "commonjs"` (інакше ESM-конфлікт з CommonJS-бекендом). `PrismaService`/`PrismaModule` — `common/prisma/`, `@Global()`.
- **Health-check:** `GET /health` (Terminus + кастомний `PrismaHealthIndicator`, `$queryRaw SELECT 1`). `health/` — перший "фічовий" модуль, взірець для `TasksModule`/`AuthModule`. Поки без `@Public()` (гварда ще нема).
- **Frontend API-шар:** `api/client.ts` — єдиний axios-інстанс (`withCredentials: true`, наперед під refresh-cookie). `lib/queryClient.ts` — спільний `QueryClient` (`retry: false`). Vite читає кореневий `.env` (`envDir`), не окремий `apps/frontend/.env`.

## Domain model

`Task`: `title`, `description`, `priority` (1-5), `tags`, `dueDate`, `status`. Повна Prisma-схема (включно з `User`, `ShareToken`) — у наступному фічовому плані.

## AI workflow

Процес — `custom-flow`: окремий план на кожен stage, явне підтвердження до реалізації.

Хуки (`.claude/hooks/`): `block-env-files.js` (блокує читання/запис `.env`), `block-git-push.js` (підтвердження перед `git push`), `typecheck.js` (`tsc --noEmit` по пакету зміненого файлу), `eslint-fix.js` (`eslint`/`oxlint --fix` по пакету), `warn-fetch-in-ui.js` (попереджає про `fetch`/`axios` поза `api/`/`queries/`).

**No duplicate types:** типи не дублюються вручну — frontend виводить з Zod (`z.infer`), backend — DTO-класи; спільного пакета типів свідомо нема, дублювання між шарами мінімальне й усвідомлене.
