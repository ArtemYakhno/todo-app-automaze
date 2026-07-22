## What was built

Повна бекенд-частина to-do застосунку: доменні моделі (`User`, `Task`, `ShareToken`), JWT-автентифікація без саморєестрації (access+refresh, server-side revoke через `tokenVersion`), CRUD задач із фільтрацією/сортуванням/текстовим пошуком і ownership-перевіркою (404 vs 403), шеринг списку задач по email (крипто-токен, upsert-семантика, Nodemailer), Swagger-документація на всіх ендпоінтах. 47 unit-тестів, `typecheck`/`lint`/`test` проходять чисто по всьому пакету.

## Key modules & functions

- `apps/backend/prisma/schema.prisma` — `User` (email, passwordHash, name?, tokenVersion), `Task` (title, description?, priority 1-5, tags[], dueDate?, status, ownerId), `ShareToken` (token@unique, ownerId@unique, expiresAt); enum `TaskStatus`.
- `apps/backend/prisma/seed.ts` — 3 демо-юзери (upsert по email, ідемпотентно), standalone-скрипт (adapter+client напряму, поза Nest DI).
- `apps/backend/src/common/hash/hash.service.ts`, `common/mailer/mailer.service.ts` — `@Global() CommonModule`.
- `apps/backend/src/common/decorators/public.decorator.ts` — `@Public()` + `IS_PUBLIC_KEY`.
- `apps/backend/src/common/decorators/current-user.decorator.ts` — `@CurrentUser()`, витягує `request.user.userId` через `createParamDecorator`; замінив `@Req() req: AuthenticatedRequest` + `req.user.userId` у `tasks`/`sharing`/`auth`-контролерах.
- `apps/backend/src/auth/` — `AuthService` (`login`, `refreshTokens`, `logout`), `JwtAccessStrategy`/`JwtRefreshStrategy` (обидві звіряють `tokenVersion` через `PrismaService`), `JwtAuthGuard` (глобальний, `APP_GUARD`, `Reflector`-перевірка `@Public()`), `JwtRefreshGuard`, `AuthController` (`POST /auth/login|refresh|logout`, параметри через `@CurrentUser()`).
- `apps/backend/src/tasks/` — `TasksService` (`create`, `findAll` з `status`/`sortBy`/`sortOrder`/текстовим `query`-пошуком по `title`+`description`, `findOne`, `update`, `updateStatus`, `remove`, приватний `findOwnedOrThrow` з 404/403), `TasksController`, DTO (`CreateTaskDto` з кастомним `IsNotPastDate()`-валідатором і `ArrayMaxSize(5)`, `UpdateTaskDto = PartialType`, `UpdateTaskStatusDto`, `TaskQueryDto` з опціональним `query?: string`).
- `apps/backend/src/sharing/` — `SharingService` (`share`/`revoke`/`getSharedTasks`), `ShareController` (`POST/DELETE /tasks/share`), `SharedController` (`GET /shared/:token`, `@Public()`).
- `apps/backend/src/health/health.controller.ts` — `GET /health`, `@Public()`, Swagger-документований.
- `.env.example` — усі нові env (`JWT_*`, `SHARE_TOKEN_TTL`, `SMTP_*`, `NODE_ENV`) синхронізовані з кодом.

## Architectural decisions

- **`tokenVersion` звіряється в обох Passport-стратегіях** (access і refresh), не лише в refresh — логаут миттєво інвалідовує обидва типи токенів ціною одного DB-запиту на кожен захищений роут. Рішення прийнято під час порівняння з референс-проєктом користувача (`verify`).
- **Ownership-помилки: 404 (нема) vs 403 (чуже)** — свідомо розділені, не єдиний 404 для обох випадків, за explicit рішенням користувача (демонстрація REST-розуміння для співбесіди).
- **`ShareToken`** — один на юзера (`ownerId @unique`), стабільний токен; кожен `POST /tasks/share` оновлює `expiresAt = now + SHARE_TOKEN_TTL` незалежно від поточного стану ("Варіант B" — простіше за "жорсткий TTL від створення"). `DELETE /tasks/share` — ідемпотентний (`deleteMany`, не `delete`).
- **Контролер/сервіс:** бізнес-orchestration (напр. `validateUser`+`issueTokens` → єдиний `AuthService.login()`) — у сервісі; HTTP-response-shaping (`res.cookie()`) — у контролері, щоб сервіс лишався тестованим без Express-моків.
- **`/tasks/share` (не `/share-token`) і окремий top-level `/shared/:token`** — свідомо лишено після REST-обговорення: `/tasks/share` прийнятний action-style паттерн (як GitHub/Stripe), а `/shared/:token` навмисно НЕ вкладено під `/tasks/`, щоб не змішувати публічну й захищену зони під одним префіксом.
- **DTO `dueDate`:** кастомний `@IsNotPastDate()`-валідатор замість вбудованого `@MinDate()` — останній обчислює "сьогодні" один раз при завантаженні модуля (server-boot time), не на кожен запит; кастомний валідатор рахує UTC-межу дня наживо.
- **Seed — standalone-скрипт** з ручним `PrismaPg`-adapter, не через `NestFactory.createApplicationContext` — свідомий вибір користувача (простіше, без підняття Nest-контексту заради 3 upsert-викликів).
- **`GET /tasks?query=`** — текстовий пошук, регістронезалежний `contains` (Prisma `mode: 'insensitive'`) по `title` **і** `description` одночасно (`OR`), комбінується з `status`-фільтром і сортуванням. Рішення користувача: шукати по обох полях, не лише по `title`.
- **`@CurrentUser()`-декоратор** (`common/decorators/current-user.decorator.ts`) — за зразком користувача з попереднього проєкту, але спрощений під фактичну форму `request.user` (`{ userId: string }`, без інших полів): повертає `userId`-рядок напряму, без `keyof User`-параметра, щоб не over-engineer-ити під поле, якого нема. Замінив `@Req() req: AuthenticatedRequest` + `req.user.userId` у `tasks`/`sharing`/`auth`-контролерах.

## Open items / next steps

- Frontend (сторінки логіну/задач/шерингу, форми, тема, мобільна адаптивність) — окремий наступний фічовий план, як і зазначено в майстер-плані.
- Реальна відправка email не перевірялась наживо — потребує справжніх SMTP-креденшалів у локальному `.env` (заблокований для редагування хуком `block-env-files.js`); можна взяти безкоштовний Ethereal/Mailtrap.
- Деплой, CI — поза скоупом обох планів (bootstrap і цього).
- Немає e2e-тестів (лише unit) — `test/jest-e2e.json` існує в скелеті, але не використовувався.
