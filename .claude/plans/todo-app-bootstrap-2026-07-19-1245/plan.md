Ініціалізація проєкту "todo-app-viyar" (bootstrap: монорепо, NestJS+React scaffold, Docker+Postgres, Prisma, health-check, приведення AI-хуків до ладу, git/GitHub) + налаштування CLAUDE.md для подальшої роботи з AI.
status: done

# План: Ініціалізація проєкту "todo-app-viyar" + налаштування AI-workflow

## Контекст

Це тестове завдання для співбесіди в компанію Viyar: web-застосунок "To-Do List" (створення задач, зміна статусів, шеринг списку по email). Вимоги: мобільна адаптивність, тести, шеринг по email, демонстрація на співбесіді; бажано — деплой і акуратний frontend. Компанія очікує активного і продемонстрованого використання AI-асистентів на всіх етапах.

Директорія `C:\TestTasks\todo-app-viyar` зараз практично порожня: немає git-репозиторію, немає жодного коду чи конфігів стеку (package.json, docker-compose, prisma/schema.prisma тощо). Є лише `.claude/settings.json` і 5 hook-скриптів — залишки **Expo/React Native**-шаблону (плагіни `expo@claude-plugins-official`, `skills@swmansion`; хук `eslint-fix.js` викликає `npx expo lint --fix`; хук `warn-fetch-in-ui.js` шукає fetch/axios у Expo-структурі папок `app/`, `components/`). Це несумісно з реальним стеком (NestJS + Vite/React + Prisma + Docker) і потребує переробки, а не лише перекладу.

Цей план покриває тільки **bootstrap/ініціалізацію**: CLAUDE.md, монорепо, скафолдинг backend/frontend, Docker+Postgres, Prisma, health-check, приведення AI-хуків до ладу, git/GitHub. Реалізація самих фіч to-do (моделі, auth, шеринг по email, верстка) — окремий наступний custom-flow план, який стартує лише після завершення цього. Але стек і функціональні вимоги фіксуються вже зараз (нижче) і саме вони підуть у CLAUDE.md на Stage 2, щоб scaffolding-рішення (структура папок, залежності) одразу під них закладались.

## Функціональні вимоги продукту

**Обов'язкові:**
1. Сторінка логіну (email + пароль) для автентифікації — без сторінки саморєестрації, користувачі лише через seed (`prisma/seed.ts`).
2. Користувач створює задачі: `title`, `description`, `priority` (ціле число 1-5), `tags`, `dueDate`.
3. Користувач змінює статус задачі (напр. todo / in progress / done — конкретний набір статусів фіксується в CLAUDE.md на Stage 2 разом із доменною моделлю).
4. Користувач редагує і видаляє власні задачі (стандартний CRUD).
5. Фільтрація задач за статусом.
6. Сортування за `priority`, `dueDate`, `createdAt`, з можливістю обрати напрямок (ascending/descending).
7. Мінімальне перемикання теми (light/dark) на основі shadcn/ui.
8. Шеринг списку задач іншому користувачу по email — read-only live-посилання за випадковим токеном (`ShareToken`, прив'язаний до `ownerId`, без потреби акаунту в одержувача); детально узгоджено в обговоренні, коротко зафіксувати підхід у CLAUDE.md на Stage 2/10, повна реалізація — у наступному фічовому плані.
9. Мобільна адаптивність інтерфейсу.
10. Тести — backend і frontend.

**Бажані (bonus):**
11. Задеплоєний застосунок за посиланням (Stage 11 готує до цього — CI/деплой сам по собі поза скоупом bootstrap-плану).
12. Акуратний, візуально приємний frontend.
13. Продемонстроване й пояснюване використання AI-асистентів на кожному етапі (забезпечується самим custom-flow процесом і документується в CLAUDE.md).

**Явно поза скоупом цього bootstrap-плану** (переносяться у наступний, фічовий план): доменні моделі User/Task/ShareToken, JWT-автентифікація, самі CRUD/фільтр/сортування-ендпоінти, реалізація email-провайдера (Nodemailer + SMTP для dev — узгоджено), UI-екрани й верстка фіч, деплой.

## Технологічний стек
під
| Шар | Технології |
|---|---|
| Backend | NestJS, Prisma ORM, PostgreSQL, JWT auth (Passport-JWT, argon2, глобальний Guard), REST API, Swagger/OpenAPI (`@nestjs/swagger`, мінімальний), Nodemailer + SMTP (Mailtrap/Ethereal для dev — шеринг по email), `helmet`, глобальний `HttpExceptionFilter` + `ValidationPipe` (class-validator + class-transformer), CORS, Jest |
| Frontend | React + TypeScript, Vite, React Router (`react-router-dom`), TanStack Query, axios (HTTP-клієнт, обгорнутий у `api/`/`queries/`), Tailwind CSS, shadcn/ui (+ light/dark тема), React Hook Form, Zod, Vitest |
| Інфраструктура | Docker + docker-compose (Postgres), pnpm workspaces (монорепо, `apps/backend` + `apps/frontend`), git + GitHub (публічний репозиторій) |
| AI-workflow | Claude Code: CLAUDE.md, custom-flow процес, `.claude/hooks` (перевірка типів, eslint, блокування `.env`/`git push`, попередження про прямі fetch-виклики в UI) |

## Архітектурні рішення (узгоджені з користувачем)

- **Монорепо:** чистий pnpm workspaces, без Turborepo/Nx — для 2 пакетів (backend, frontend) це зайвий overhead.
- **Без окремого `packages/shared`:** Zod-схеми/типи визначаються окремо в backend і frontend (усвідомлений trade-off для невеликого тестового проєкту; можна винести пізніше, якщо кодова база зросте).
- **Frontend-тести:** Vitest (нативний для Vite). Глобальний CLAUDE.md користувача оновлено (2026-07-19): Vitest — дефолтний test runner для Vite-проєктів, Jest лише коли проєкт не на Vite. Backend лишається на Jest (дефолт NestJS).
- **GitHub-репозиторій:** створюється зараз, публічний. Локальний `git init` + створення remote + `git remote add origin` — на Stage 1 (без push). Сам перший push — на фінальному Stage 11, після gitignore-аудиту.
- **Plugins `expo@claude-plugins-official` і `skills@swmansion`** вимикаються в `.claude/settings.json` — обидва суто Expo/React Native, підтверджено вмістом (скіли `expo-dev-client`, `react-native-best-practices` тощо), активно шкідливі для реального стеку.
- **CLAUDE.md пишеться у 2 проходи:** v1 (Stage 2, до скафолдингу — вимоги, стек, структура папок) і фінальний прохід (Stage 10 — living doc після стабілізації реальної структури).
- **Prisma-конфігурація (версія 7, зафіксовано на Stage 7):** `prisma.config.ts` в `apps/backend/` обов'язковий (CLI-конфіг: `schema`, `migrations.path`, `datasource.url` через `dotenv`+`env()`); `@prisma/adapter-pg` (+ `pg`) обов'язковий — `PrismaClient` у рантаймі завжди створюється з driver adapter, `schema.prisma`-datasource без `url`. Generator: `provider = "prisma-client"`, `output = "../generated/prisma"` (поруч із `src/`, ігнорується git), `moduleFormat = "commonjs"` (бекенд — CommonJS, дефолтний вивід Prisma 7 — ESM). `PrismaService`/`PrismaModule` — у `common/prisma/` (як інші cross-cutting сервіси), `@Global()`, `ConfigService.getOrThrow('DATABASE_URL')` в конструкторі.
- **Шеринг по email:** read-only live-посилання за криптографічно випадковим `ShareToken` (прив'язаний до `ownerId`, без email-прив'язки), без акаунту в одержувача. Email — Nodemailer + SMTP (Mailtrap/Ethereal для dev), заміна на прод-провайдер (напр. Resend) тривіальна. Реалізація — у наступному фічовому плані, тут лише зафіксовано підхід для CLAUDE.md.
- **UI-тема:** shadcn/ui поверх Tailwind, мінімальний light/dark перемикач (CSS variables/`class` strategy) — базова ініціалізація вже на Stage 5, самі теми/перемикач як UI — у фічовому плані.
- **Auth (JWT):** access token (короткий, ~15 хв) + refresh token (довгий, httpOnly cookie, ~7-30 днів) через Passport-JWT стратегії (`JwtStrategy` + `RefreshTokenStrategy`), пароль хешується `argon2` (argon2id). **Без сторінки саморєестрації** — користувачі створюються лише через `prisma/seed.ts` (2-3 демо-акаунти з відомими email/паролем). Причина: швидший повторний логін під час демонстрації (пароль, а не email round-trip через magic-link) і email лишається потрібним лише для шерингу, а не для критичного шляху входу. `AuthModule`: `AuthController`, `AuthService`, `JwtStrategy`, `RefreshTokenStrategy`, `JwtAuthGuard` на захищених контролерах (`TasksController` тощо). Пароль ніколи не повертається в DTO/response (`class-transformer` `@Exclude()`). Реалізація — у наступному фічовому плані; тут лише зафіксовано підхід для CLAUDE.md.
- **Swagger (мінімальний):** `@nestjs/swagger` підключається одразу на Stage 4 (базовий scaffold), `SwaggerModule.setup` у `main.ts`, доступний за `/api` (чи `/docs`). "Мінімальний" означає лише базове підключення без детальних `@ApiProperty`/`@ApiResponse` декораторів на кожен DTO — самі ендпоінти й DTO з'являться в наступному фічовому плані, там і буде повноцінна документація.
- **Роутинг (frontend):** `react-router-dom`, 3 базові маршрути — `/login` (публічний), `/tasks` (захищений, головний список, `ProtectedRoute`-обгортка редіректить на `/login` без валідного JWT), `/shared/:token` (публічний, read-only перегляд чужого списку). Базова структура роутів і порожні placeholder-сторінки закладаються на Stage 5, самі екрани — у наступному фічовому плані.
- **Безпека і обробка помилок (backend):**
  - **Guards:** `JwtAuthGuard` реєструється глобально через `APP_GUARD`, доступ за замовчуванням закритий; публічні ендпоінти (`/auth/login`, `/shared/:token`, `/health`) відмічаються кастомним декоратором `@Public()`, що читається в guard. Повне підключення — у фічовому плані (потребує готового `AuthModule`), але сам патерн (`@Public()` + global guard) фіксується вже зараз.
  - **Обробка помилок:** `HttpExceptionFilter` (`implements ExceptionFilter`, реєструється через `app.useGlobalFilters()` у `common/setup/app.setup.ts`) — єдиний формат помилки `{ statusCode, message, errors? }` (без поля `error`/назви класу — фронт розгалужується по `statusCode`; `errors` — мапа по полях лише для validation-помилок). Непередбачені винятки логуються через `Logger` (стек + `method`/`url`) і повертають generic 500 без витоку деталей.
  - **HTTP-логування:** `LoggerMiddleware` (`common/middlewares/`) — логує кожен запит (`method url statusCode contentLength - userAgent ip`) через вбудований `Logger`.
  - **Валідація:** стандартний NestJS `ValidationPipe` (class-validator + class-transformer, конфіг у `common/configs/validation.config.ts`: `whitelist`, `forbidNonWhitelisted`, `transform`), реєструється через `app.useGlobalPipes()` у `setupApp`. **Свідомий відхід від "schema-first Zod"** з глобального CLAUDE.md користувача (2026-07-19, рішення користувача): форма даних описується двічі — Zod-схема на frontend (RHF-резолвери), class-validator DTO на backend, без єдиного джерела правди. Прийнято як усвідомлений trade-off, а не забуте узгодження.
  - **CORS:** `common/configs/cors.config.ts` (`origin` з env, фолбек на дефолтний Vite dev-порт; `credentials: true` під майбутній httpOnly refresh-token) — налаштовується вже на Stage 4, а не Stage 8.
  - **Базові security-заголовки:** `helmet` middleware в `setupApp`.
  - Каркас (`HttpExceptionFilter`, `ValidationPipe`, CORS, `helmet`, `LoggerMiddleware`) підіймається вже на Stage 4 (не залежить від доменних моделей); `@Public()`-декоратор і реальний `JwtAuthGuard` — у фічовому плані разом з `AuthModule`.

---

## Master plan

### Stage 1 — Git init, GitHub-репозиторій, базова гігієна AI-workflow
**Acceptance criteria:**
- `git init` виконано; `.gitignore` v1 (щонайменше: `.history/`, `node_modules/`, `.env*` крім `.env.example`, `dist/`, `build/`, `.claude/plans/`).
- Публічний GitHub-репозиторій створено, `origin` підключено (без push — push на Stage 11).
- `.claude/settings.json`: `enabledPlugins` очищено від `expo@claude-plugins-official` і `skills@swmansion`.
- `block-env-files.js` і `block-git-push.js` перекладено на англійську (логіка стек-агностична, не змінюється).
- Вручну перевірено: блокування читання/запису `.env`, `ask`-підтвердження на `git push` — обидва повідомлення англійською.

**Тести:** ні
**Статус:** [x] done

### Stage 2 — CLAUDE.md v1 (архітектурний драфт)
**Acceptance criteria:**
- Позначка "Living document" на початку файлу — фінальний прохід на Stage 10.
- Product overview: опис продукту і повний перелік функціональних вимог (обов'язкові + бажані).
- Технологічний стек — таблиця Backend/Frontend/Інфраструктура/AI-workflow, синхронізована з мастер-планом.
- Структура монорепо (дерево `apps/backend`, `apps/frontend`, корінь з `docker-compose.yml`) + пояснення рішення "без shared-пакета".
- Naming conventions (компоненти, hooks, розташування Zod-схем окремо в кожному пакеті, API-виклики лише в `api/`/`queries/`, не в компонентах).
- Testing conventions: явно зафіксовано "Vitest для frontend / Jest для backend".
- Git workflow, посилання на custom-flow.
- Архітектурні рішення перенесені коротким описом: шеринг (`ShareToken`), auth (JWT access+refresh, argon2, seed-users, без саморєестрації), UI-тема (shadcn/ui), роутинг (`react-router-dom`, 3 маршрути), безпека (Guards, `HttpExceptionFilter`, `ValidationPipe`/class-validator, CORS, helmet), Swagger (мінімальний) — щоб наступний фічовий план міг спиратись на них без повторного узгодження.
- Domain model (placeholder): очікувані поля `Task`.
- Розділ "AI workflow" з посиланням на custom-flow.

**Тести:** ні
**Статус:** [x] done

### Stage 3 — Скелет монорепо (pnpm workspaces)
**Acceptance criteria:**
- Root `package.json` (private) + `pnpm-workspace.yaml` (`apps/*`).
- Пінована версія Node (`.nvmrc` або `engines`).
- Root-скрипти: `dev`, `dev:backend`, `dev:frontend`, `typecheck`, `lint`, `test` (усі через `pnpm -r`/`--filter`).
- `pnpm install` з кореня відпрацьовує без помилок.

**Тести:** ні
**Статус:** [x] done

### Stage 4 — Backend scaffold (NestJS)
**Acceptance criteria:**
- `apps/backend` створено через Nest CLI (`--package-manager pnpm --skip-git`, запущено всередині порожньої папки).
- Вкладений `.gitignore` злито з кореневим.
- Мінімальний `main.ts` (лише bootstrap + `setupApp` + `listen`), уся конфігурація — в `common/setup/app.setup.ts`.
- `pnpm --filter @todo-app/backend run start:dev` піднімає сервер (напр. порт 3001).
- CORS підключено (`common/configs/cors.config.ts`, `app.enableCors()`).
- `@nestjs/swagger` підключено, мінімальний `SwaggerModule.setup`, Swagger UI відкривається (напр. на `/api`) без помилок.
- `helmet` підключено в `setupApp`.
- `HttpExceptionFilter` (`app.useGlobalFilters()`) підключено — уніфікований формат помилки перевірено вручну (напр. запит на неіснуючий роут повертає `{ statusCode, message }`, без поля `error`).
- `LoggerMiddleware` підключено (`AppModule implements NestModule`, `configure()`) — HTTP-запити логуються.
- `ValidationPipe` (class-validator, `app.useGlobalPipes()`) підключено з базовим конфігом (`whitelist`, `forbidNonWhitelisted`, `transform`) — сама валідація перевіряється вже на реальних DTO у фічовому плані.
- Дефолтний Jest-тест (`app.controller.spec.ts`) проходить.
- `package.json` name узгоджено з workspace (`@todo-app/backend`).

**Тести:** ні
**Статус:** [x] done

### Stage 5 — Frontend scaffold (Vite + React + TS + Tailwind + shadcn/ui + Vitest)
**Acceptance criteria:**
- `apps/frontend` створено через `pnpm create vite@latest . -- --template react-ts`.
- Tailwind підключено (перевірити актуальний спосіб setup для обраної версії в документації).
- shadcn/ui ініціалізовано (`shadcn init`), базові CSS-variables для light/dark теми налаштовані (сам UI-перемикач теми — вже фічовий план, тут лише інфраструктура).
- Встановлено: `@tanstack/react-query`, `react-router-dom`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`.
- Базовий роутинг налаштовано: `/login`, `/tasks` (обгорнутий заглушкою `ProtectedRoute`), `/shared/:token` — порожні placeholder-сторінки, без реальної логіки автентифікації (вона в наступному фічовому плані).
- `pnpm --filter frontend run dev` піднімає dev-сервер.
- Базовий viewport meta-tag + responsive Tailwind-класи на дефолтній сторінці.
- Vitest підключено, тривіальний smoke-тест проходить.

**Тести:** ні
**Статус:** [x] done

### Stage 6 — Docker + PostgreSQL
**Acceptance criteria:**
- `docker-compose.yml` у корені: сервіс `postgres` (пінована версія образу), named volume, `POSTGRES_*` через `.env`.
- `.env.example` у корені без реальних значень.
- `docker compose up -d` → контейнер healthy.
- Підключення до бази перевірено вручну (psql/DB-клієнт).

**Тести:** ні
**Статус:** [x] done

### Stage 7 — Підключення Prisma ORM
**Acceptance criteria:**
- Prisma встановлено в `apps/backend`, `schema.prisma` з datasource на Postgres з Stage 6.
- Перевірено в актуальній документації Prisma (версія з `package.json`): чи потрібен `prisma.config.ts`, його розташування, чи потрібен `@prisma/adapter-pg` — висновок задокументовано в CLAUDE.md.
- Перша (мінімальна) міграція виконана (`prisma migrate dev`), `_prisma_migrations` з'явилась у базі.
- `prisma generate` без помилок, Prisma Client імпортується в Nest-сервіс.
- Доменні моделі (User/Task/Share) НЕ проєктуються тут — лише інфраструктурне підключення.

**Тести:** ні
**Статус:** [x] done

### Stage 8 — Health-check: наскрізна перевірка backend ↔ DB ↔ frontend
**Acceptance criteria:**
- Backend: `GET /health` (напр. `@nestjs/terminus`) — перевіряє процес і raw-запит до Postgres через Prisma.
- CORS (готовий з Stage 4) — `origin` уточнено під реальний Vite dev-сервер, перевірено наскрізним запитом.
- Frontend: компонент з `useQuery` (TanStack Query) показує статус health-check.
- `pnpm dev` з кореня + Docker Postgres → health-check зелений у браузері.
- Базовий Jest-тест на backend health-контролер і базовий Vitest-тест на frontend health-компонент — довести, що обидві test-інфраструктури реально працюють.

**Тести:** так (мета stage — довести робочу test-інфраструктуру Jest і Vitest)
**Статус:** [x] done

### Stage 9 — Rework AI-хуків під реальний стек
**Acceptance criteria:**
- `typecheck.js`: скоупить перевірку на конкретний workspace-пакет (`pnpm --filter <pkg> run typecheck`) замість глобального `tsc --noEmit` з кореня.
- `eslint-fix.js`: `npx expo lint --fix` замінено на `pnpm --filter <pkg> exec eslint --fix <file>`, з no-op фолбеком поза `apps/`.
- `warn-fetch-in-ui.js`: Expo-директорії (`app/`, `components/`) замінені на реальні (`apps/frontend/src/components/`, `apps/frontend/src/pages/`), скоуп лише на frontend, повідомлення посилається на реальний `apps/frontend/src/api/`.
- Усі 5 хуків — англійською.
- Кожен хук вручну перевірений (коректне і хибне спрацювання).

**Тести:** ні (ручна перевірка — acceptance criteria)
**Статус:** [x] done

### Stage 10 — CLAUDE.md: фінальний прохід (living doc)
**Acceptance criteria:**
- Синхронізовано з фактичною реалізацією (порти, скрипти, фактичне рішення по Prisma config).
- Розділ "AI workflow" (посилання на custom-flow, .env/git-push хуки, no-duplicate-types).
- Розділ "Testing conventions" (де лежать тести, команди запуску).
- Прибрано TODO/draft-позначки з v1.

**Тести:** ні
**Статус:** [x] done

### Stage 11 — Фінальний аудит `.gitignore` + перший push
**Acceptance criteria:**
- `.gitignore` покриває: `node_modules/`, `dist/`, `build/`, `.env*` (крім `.env.example`), `.history/`, `.claude/plans/`, `coverage/`, IDE-файли за потреби.
- `git status` перед комітом чистий (без секретів, без `node_modules`/`.history`).
- Перший `git push` у вже створений на Stage 1 репозиторій — тут природно спрацьовує `block-git-push.js` (перевірка хука в реальному сценарії).
- Занотовано (не обов'язково для проходження stage) можливий наступний крок: базовий CI (lint+typecheck+test) перед деплоєм.

**Тести:** ні
**Статус:** [x] done

---

## Примітка щодо подальших кроків (поза цим планом)
Домоделювання (User/Task/Share, JWT auth), сама фіча шерингу по email, мобільна верстка фіч, деплой — окремий наступний custom-flow план "feature implementation", що стартує після `[x] done` цього плану.

Можливий (не обов'язковий) наступний крок: базовий CI (GitHub Actions) — lint+typecheck+test по обох пакетах на кожен PR, перед тим як братись за деплой.

## Critical files
- `C:\TestTasks\todo-app-viyar\.claude\settings.json`
- `C:\TestTasks\todo-app-viyar\.claude\hooks\eslint-fix.js`
- `C:\TestTasks\todo-app-viyar\.claude\hooks\warn-fetch-in-ui.js`
- `C:\TestTasks\todo-app-viyar\.claude\hooks\typecheck.js`
- `C:\TestTasks\todo-app-viyar\.claude\hooks\block-env-files.js`
- `C:\TestTasks\todo-app-viyar\.claude\hooks\block-git-push.js`
- `C:\TestTasks\todo-app-viyar\CLAUDE.md` (буде створено на Stage 2)

## Верифікація
- Кожен stage перевіряється вручну командами, зазначеними в acceptance criteria (pnpm install, docker compose up, prisma migrate dev, curl/браузер на /health тощо).
- Stage 8 — єдиний з автотестами: `pnpm --filter backend test` і `pnpm --filter frontend test` мають пройти.
- Фінальна перевірка всього bootstrap: `pnpm dev` з кореня піднімає backend+frontend, Docker Postgres живий, health-check зелений, git push проходить у публічний GitHub-репозиторій.
