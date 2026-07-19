> **Living document.** Це v1-драфт, написаний перед скафолдингом (Stage 2 bootstrap-плану). Фінальний прохід — Stage 10, коли реальна структура вже стабілізується.

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
| Backend | NestJS, Prisma ORM, PostgreSQL, JWT auth (Passport-JWT, argon2, глобальний Guard), REST API, Swagger/OpenAPI (`@nestjs/swagger`, мінімальний), Nodemailer + SMTP (Mailtrap/Ethereal для dev), `helmet`, глобальний `HttpExceptionFilter` + `ZodValidationPipe`, Jest |
| Frontend | React + TypeScript, Vite, React Router (`react-router-dom`), TanStack Query, axios (обгорнутий у `api/`/`queries/`), Tailwind CSS, shadcn/ui (+ light/dark тема), React Hook Form, Zod, Vitest |
| Інфраструктура | Docker + docker-compose (Postgres), pnpm workspaces (монорепо, `apps/backend` + `apps/frontend`), git + GitHub |
| AI-workflow | Claude Code, custom-flow процес, `.claude/hooks` |

## Структура монорепо

```
todo-app-viyar/
├── apps/
│   ├── backend/     # NestJS
│   └── frontend/    # Vite + React
├── docker-compose.yml
├── .claude/
└── pnpm-workspace.yaml
```

Без окремого `packages/shared`: Zod-схеми й типи визначаються окремо в backend і frontend. Свідомий trade-off для невеликого тестового проєкту (дублювання мінімальне); можна винести спільний пакет пізніше, якщо кодова база зросте.

## Naming conventions

- React-компоненти: PascalCase, один компонент на файл.
- Custom hooks: `useX.ts`.
- Zod-схеми: `*.schema.ts`, окремо в кожному пакеті (`apps/backend/src/**/schemas/`, `apps/frontend/src/**/schemas/`).
- API-виклики лише в `apps/frontend/src/api/` або `.../queries/` — ніколи напряму в компонентах. Це саме те, що контролює хук `warn-fetch-in-ui.js` (після переробки на Stage 9).

## Testing conventions

- Backend: **Jest**, `*.spec.ts` поруч з файлом, що тестується (дефолт NestJS).
- Frontend: **Vitest**, `*.test.tsx` поруч з файлом — нативний для Vite-проєкту (спільний конфіг, jsdom, швидкість), відповідно до глобального CLAUDE.md користувача.

## Git workflow

Коміт по завершенню кожного stage bootstrap/фічового плану. Процес роботи — `custom-flow`: кожен stage отримує окремий детальний план, який користувач явно затверджує, і лише після цього — реалізація.

## Архітектурні рішення

- **Шеринг по email:** read-only live-посилання за криптографічно випадковим `ShareToken` (прив'язаний до `ownerId`, без email-прив'язки одержувача, без потреби акаунту в одержувача). Email — Nodemailer + SMTP.
- **Auth (JWT):** access token (~15 хв) + refresh token (httpOnly cookie, ~7-30 днів) через Passport-JWT стратегії, пароль хешується `argon2` (argon2id). **Без сторінки саморєестрації** — користувачі лише через `prisma/seed.ts` (2-3 демо-акаунти). Причина: швидший повторний логін під час демонстрації (пароль, а не email round-trip через magic-link), email лишається потрібним лише для шерингу.
- **UI-тема:** shadcn/ui поверх Tailwind, мінімальний light/dark перемикач (CSS variables/`class` strategy).
- **Роутинг (frontend):** `react-router-dom`, 3 маршрути — `/login` (публічний), `/tasks` (захищений, `ProtectedRoute`-обгортка редіректить на `/login` без валідного JWT), `/shared/:token` (публічний, read-only).
- **Безпека і обробка помилок (backend):** `JwtAuthGuard` глобально через `APP_GUARD`, публічні ендпоінти відмічаються `@Public()`; глобальний `HttpExceptionFilter` (`APP_FILTER`, уніфікований формат помилки); `ZodValidationPipe` (`APP_PIPE`) замість class-validator — валідація за тими самими Zod-схемами, що йдуть у `z.infer`-типи, без дублювання правил; `helmet` для базових security-заголовків.
- **Swagger:** мінімальне підключення (`SwaggerModule.setup` у `main.ts`, доступний на `/api`) — без детальних `@ApiProperty`/`@ApiResponse` декораторів у v1.

## Domain model (placeholder)

`Task`: `title`, `description`, `priority` (1-5), `tags`, `dueDate`, `status`. Повна Prisma-схема (включно з `User`, `ShareToken`) проєктується в наступному фічовому плані — тут лише фіксація очікуваних полів, щоб scaffolding не суперечив майбутній моделі.

## AI workflow

Процес роботи над проєктом — `custom-flow`.

