Реалізація всієї бекенд-частини функціональних вимог to-do застосунку: доменні моделі, JWT-автентифікація без саморєестрації, CRUD задач з фільтрацією/сортуванням, шеринг списку задач по email.
status: done

## Контекст

Продовження після bootstrap-плану (`.claude/plans/todo-app-bootstrap-2026-07-19-1245/`, `status: done`). На старті цього плану бекенд має: голий Nest-скелет, `common/` (setup, filters, configs, middlewares, prisma), `health/`-модуль як взірець структури. Доменних моделей (`User`, `Task`, `ShareToken`), auth, CRUD, шерингу — нема. `.env.example` без `JWT_*`/SMTP-змінних. `prisma.config.ts` без `migrate.seed`.

Референс — функціональні вимоги в `CLAUDE.md` (розділ "Product overview" і "Архітектурні рішення"). Frontend-частина (сторінки, форми, тема) — поза скоупом цього плану, окремий наступний фічовий план.

## Stages

### Stage 1 — Доменна Prisma-схема
- [x] done
- Acceptance criteria:
  - `schema.prisma`: моделі `User` (email унікальний, passwordHash, опційне `name`, `tokenVersion` int дефолт 0 — server-side revoke refresh-токенів), `Task` (title, description, priority 1-5, tags, dueDate, status-enum `todo`/`in_progress`/`done`, ownerId → User), `ShareToken` (крипто-випадковий токен, `ownerId @unique` — один лінк на юзера, `expiresAt`, без прив'язки до email одержувача).
  - Enum `TaskStatus` у схемі.
  - Міграція застосована (`prisma migrate dev`), `prisma generate` відповідає схемі.
  - Зв'язки й `onDelete`-поведінка продумані (задачі/токени каскадно видаляються з юзером).
- Tests: not required (тільки схема й міграція).

### Stage 2 — HashService і seed демо-юзерів
- [x] done
- Acceptance criteria:
  - `HashService` (`argon2.hash`/`argon2.verify`) у `@Global() CommonModule`-патерні (за архітектурним рішенням з `CLAUDE.md`), доступний для `AuthModule` і `seed.ts`.
  - `prisma/seed.ts` створює кілька демо-юзерів із захешованими паролями; `prisma.config.ts` доповнено `migrate.seed`.
  - `pnpm --filter @todo-app/backend exec prisma db seed` (або еквівалент) успішно наповнює БД.
- Tests: required (unit-тест на `HashService`: hash → verify true/false).

### Stage 3 — AuthModule (JWT access + refresh)
- [x] done
- Acceptance criteria:
  - `POST /auth/login` (email+пароль, без саморєестрації) — перевірка через `HashService`, видає access-токен (~15хв, у тілі відповіді) + refresh-токен (~7-30д, httpOnly cookie); у payload **обох** токенів — поточний `user.tokenVersion`.
  - `POST /auth/refresh` і **`JwtAccessStrategy`** (при кожному захищеному запиті) звіряють `tokenVersion` з payload з актуальним значенням у БД (незбіг → 401). Логаут інвалідовує **обидва** типи токенів миттєво, не лише refresh.
  - `POST /auth/refresh` видає нову пару токенів з refresh-cookie.
  - `POST /auth/logout` — інкрементує `user.tokenVersion` у БД (server-side revoke) і чистить refresh-cookie.
  - Passport-JWT стратегії (access + refresh) окремо, обидві звіряють `tokenVersion` через `PrismaService`. `ConfigService` для секретів/TTL (нові env: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, TTL), оновлено `.env.example`.
  - Формат помилок автентифікації узгоджений з `HttpExceptionFilter` (`{ statusCode, message, errors? }`).
- Tests: required (unit-тести `AuthService`/контролера: успішний логін, невірний пароль, refresh-флоу; `jwt-refresh.strategy` і `jwt-access.strategy` — обидва: юзера нема → 401, `tokenVersion` не збігається (після логауту) → 401, збігається → ОК).

### Stage 4 — Глобальний JwtAuthGuard + `@Public()`
- [x] done
- Acceptance criteria:
  - Глобальний `JwtAuthGuard` (access-токен) підключено через `APP_GUARD` у `AuthModule`.
  - `@Public()`-декоратор + перевірка в guard через `Reflector`.
  - `@Public()` застосовано до `/health`, `/auth/login`, `/auth/refresh`, **`/auth/logout`** (логаут авторизується через refresh-cookie/`JwtRefreshGuard`, не через access-токен — без `@Public()` глобальний guard вимагав би ще й дійсний access-токен, а логаут типово викликають саме після його спливання).
  - Захищені ендпоінти без токена → 401 у стандартному форматі помилок.
  - Невикористаний boilerplate `AppController`/`AppService` видалено.
- Tests: required (unit-тест на guard: пропускає `@Public()`, блокує без токена, пропускає з валідним).

### Stage 5 — TasksModule: CRUD
- [x] done
- Acceptance criteria:
  - `POST /tasks`, `GET /tasks/:id`, `GET /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`.
  - DTO на class-validator (`title`, `description`, `priority` 1-5, `tags`, `dueDate`) з валідацією.
  - Окремий ендпоінт/полегшений PATCH для зміни статусу (todo/in progress/done).
  - Ownership-перевірка: юзер працює лише зі своїми задачами — **404** (задачі нема) розрізнено від **403** (задача чужа).
  - Swagger-документація ендпоінтів.
- Tests: required (unit-тести `TasksService`: створення, own-vs-foreign доступ, зміна статусу, видалення).

### Stage 6 — Фільтрація і сортування задач
- [x] done
- Acceptance criteria:
  - `GET /tasks` приймає query-параметри: фільтр за `status`, сортування за `priority`/`dueDate`/`createdAt` з напрямком `asc`/`desc`.
  - Query DTO з валідацією допустимих значень (class-validator, `@IsIn` або enum).
  - Некоректні query-параметри → 400 у стандартному форматі помилок.
- Tests: required (unit-тести на комбінації фільтр+сортування, дефолтна поведінка без параметрів).

### Stage 7 — Шеринг списку задач по email
- [x] done
- Acceptance criteria:
  - `MailerService` (Nodemailer, SMTP) у спільному модулі; нові env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SHARE_TOKEN_TTL` дефолт 7д) додано в `.env.example`.
  - `POST /tasks/share` (захищений) — upsert `ShareToken` власника: нема токена → новий крипто-токен; є → той самий рядок (стабільний лінк). У будь-якому разі `expiresAt = now + SHARE_TOKEN_TTL` (кожен Share = свіже вікно; лінк живе максимум TTL від останнього Share). Надсилає лист-посилання на вказаний email одержувача.
  - `GET /shared/:token` (`@Public()`, read-only) — повертає список задач власника токена без можливості редагування; 404, якщо токен не знайдено або `expiresAt < now`.
  - `DELETE /tasks/share` (захищений) — миттєвий ручний revoke (видалення рядка токена власника).
  - Невалідний/відсутній/протермінований токен → 404 у стандартному форматі помилок.
- Tests: required (unit-тести: upsert-генерація токена, повторний Share оновлює `expiresAt` без зміни токена, публічний ендпоінт повертає read-only дані, невалідний/протермінований токен → 404, `DELETE` revoke; мокати відправку email).

### Stage 8 — Фінальний прохід: конфіг, документація, узгодженість
- [x] done
- Acceptance criteria:
  - Swagger: усі нові ендпоінти мають теги/описи/`@ApiResponse`.
  - `.env.example` і `CLAUDE.md` синхронізовані з фактичним станом (нові env, доменна модель, реалізовані ендпоінти); заголовок CLAUDE.md ("Bootstrap-план завершено...") оновлено під фічовий план.
  - Наскрізна перевірка формату помилок і `@Public()`-меж на всіх нових ендпоінтах.
  - `pnpm typecheck`/`lint`/`test --filter @todo-app/backend` проходять по всьому пакету.
- Tests: not required as new tests (лише прогін наявного набору по всьому пакету).

## Поза скоупом цього плану
- Frontend-реалізація (сторінки логіну/задач/шерингу, форми, тема, мобільна адаптивність) — окремий наступний фічовий план.
- Деплой, CI.
