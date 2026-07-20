## What was built

Bootstrap і налаштування AI-workflow для "todo-app-viyar" (тестове завдання, Viyar): pnpm-монорепо (NestJS-бекенд + Vite/React-фронтенд), Docker+PostgreSQL, Prisma ORM 7 з driver adapter, наскрізний health-check (backend↔DB↔frontend), 5 AI-хуків переведено з Expo-заготовки під реальний стек, `CLAUDE.md` синхронізовано з фактичною реалізацією, перший push у публічний GitHub-репозиторій (`ArtemYakhno/todo-app-viyar`). Усі 11 stages майстер-плану — `[x] done`. Доменні моделі, автентифікація, самі CRUD/шеринг-ендпоінти й верстка — свідомо поза скоупом, окремий наступний фічовий план.

## Key modules & functions

- `apps/backend/src/main.ts` — мінімальний bootstrap, уся конфігурація в `common/setup/app.setup.ts`.
- `apps/backend/src/common/setup/app.setup.ts` — збирає CORS, `helmet`, `HttpExceptionFilter`, `ValidationPipe`, Swagger.
- `apps/backend/src/common/filters/http-exception.filter.ts` — `HttpExceptionFilter`, уніфікований формат `{ statusCode, message, errors? }`.
- `apps/backend/src/common/configs/validation.config.ts` — `ValidationPipe`-конфіг + `exceptionFactory` (групує помилки по полях).
- `apps/backend/src/common/configs/cors.config.ts` — `getCorsConfig(configService)`.
- `apps/backend/src/common/middlewares/logger.middleware.ts` — логування кожного HTTP-запиту.
- `apps/backend/src/common/prisma/{prisma.service,prisma.module}.ts` — `PrismaService extends PrismaClient` (driver adapter, `ConfigService.getOrThrow`), `@Global() PrismaModule`.
- `apps/backend/prisma.config.ts`, `apps/backend/prisma/schema.prisma` — CLI-конфіг Prisma 7 і схема (без доменних моделей).
- `apps/backend/src/health/{health.controller,health.module,prisma.health-indicator}.ts` — `GET /health` (Terminus + кастомний `PrismaHealthIndicator`, `$queryRaw SELECT 1`); перший "фічовий" модуль-взірець.
- `apps/frontend/src/App.tsx` — роутинг (`/login`, `/tasks`, `/shared/:token`) + `QueryClientProvider`.
- `apps/frontend/src/api/client.ts` — єдиний axios-інстанс (`withCredentials: true`).
- `apps/frontend/src/api/health.ts`, `queries/useHealthQuery.ts`, `features/health/HealthStatus.tsx` — health-check UI (TanStack Query).
- `apps/frontend/src/lib/queryClient.ts` — спільний `QueryClient` (`retry: false`).
- `docker-compose.yml` — сервіс `postgres:18-alpine`, healthcheck, named volume.
- `.claude/hooks/{typecheck,eslint-fix,warn-fetch-in-ui}.js` — переписані під pnpm-workspace (пер-пакетний `tsc`/лінтер, реальні frontend-директорії).
- `CLAUDE.md` — фінальний прохід, синхронізовано з кодом, скорочено вдвічі.

## Architectural decisions

- **Монорепо без `packages/shared`** — Zod (frontend) і DTO-класи (backend) дублюються свідомо, окремий пакет типів — за потреби пізніше.
- **Backend-валідація на class-validator, не Zod** — свідомий відхід від "schema-first Zod" з глобального CLAUDE.md користувача, рішення користувача від 2026-07-19.
- **Формат помилок** `{ statusCode, message, errors? }` — без поля `error`/назви класу винятку, фронт розгалужується по `statusCode`.
- **Auth (заплановано, не реалізовано):** JWT access+refresh (httpOnly cookie), `argon2`, без саморєестрації — юзери лише через `prisma/seed.ts`.
- **Шеринг (заплановано):** read-only лінк за криптовипадковим `ShareToken`, без email-верифікації одержувача.
- **Prisma 7:** `prisma.config.ts` і driver adapter (`@prisma/adapter-pg`) обов'язкові в рантаймі; `schema.prisma` без `url`; generator `output` поза `src/`, `moduleFormat = "commonjs"` (інакше ESM-конфлікт із CommonJS-бекендом). Все це з'ясовано дослідженням актуальної документації під час Stage 7 (Prisma 7 значно новіша за "стандартну" пам'ять моделі).
- **`health/`-модуль** — свідомо винесений за межі `common/`, як взірець структури для майбутніх `TasksModule`/`AuthModule`. Поки без `@Public()` — глобального guard'а ще нема.
- **Frontend API-шар:** `withCredentials: true` наперед під майбутній refresh-cookie; `QueryClient` з `retry: false` — миттєвий фідбек замість 3 ретраїв; Vite читає кореневий `.env` (`envDir`), не окремий `apps/frontend/.env`.
- **Хуки:** пер-пакетне визначення лінтера (`eslint` для backend, `oxlint` для frontend — frontend ніколи не мав ESLint).
- **`.claude/plans/` не гітігнорений** — свідомо розгітігнорено вже під час review, щоб майстер-план (демонстрація AI-workflow) був видимий у публічному репо; детальні поетапні плани з `ExitPlanMode` існували лише в тимчасовому глобальному scratch-файлі поза проєктом і не збереглись окремими файлами.

## Open items / next steps

- Доменні моделі (`User`, `Task`, `ShareToken`) — повна Prisma-схема не спроєктована.
- JWT-автентифікація (Passport-JWT, `argon2`, глобальний guard, `@Public()`) не реалізована; `/health` поки без guard'а — додати `@Public()` разом з `AuthModule`.
- `prisma/seed.ts` не існує — демо-акаунти для логіну ще не створені.
- CRUD/фільтрація/сортування задач — не реалізовані.
- Шеринг по email (Nodemailer/`@nestjs-modules/mailer`, `ShareToken`) — не реалізований.
- Frontend: `LoginPage`/`TasksPage`/`SharedListPage` — порожні заглушки; `ProtectedRoute` — pass-through-стаб без реальної JWT-перевірки; Zod-схем/форм ще нема; light/dark-перемикач теми не зроблений (лише CSS-variable інфраструктура з shadcn init).
- Мобільна адаптивність — не опрацьована за межами базового Tailwind-скафолдингу.
- Тестів для майбутньої фіча-логіки нема — лише два smoke/health-тести (backend + frontend).
- Опційно занотовано (не реалізовано): базовий CI (lint+typecheck+test) перед деплоєм.
- Деплой — не починався.
