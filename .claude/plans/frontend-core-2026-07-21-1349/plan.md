Майстер-план: реалізація ключових функцій фронтенду todo-app-automaze (список, CRUD, пошук, фільтр, сортування).
status: active

## Підтверджені рішення

- **Без оптимістичних оновлень** — після мутації просто інвалідовуємо/перезапитуємо список через TanStack Query.
- **Без перемикання теми** — жодного light/dark toggle.
- **Пошук — з debounce** (окремий `useDebouncedValue` хук, ~300-400мс).
- **`fetch` замість axios** — auth немає (interceptors не потрібні), TanStack Query сам керує retry/cancel через нативний `AbortSignal`, код ближчий до ідіоматичного Next.js.
- **shadcn/ui — обов'язково** (Button, Input, Textarea, Checkbox, Select, Badge).
- **Форма створення задачі — усі поля бекенду**: title, priority, description, dueDate, tags.
- **Статус задачі в UI — усі 3 стани** (todo / in_progress / done), не тільки бінарний done-чекбокс.
- **Фільтр/сортування/пошук — синхронізовані з URL** (query-параметри), не локальний `useState`.
- **Schema-first** — типи виводяться через `z.infer` з Zod-схем (жодного ручного `interface`/`type`). Zod-схеми (рантайм-обʼєкти) — у `src/schemas/*.schema.ts`; виведені типи ре-експортуються з `src/types/*.ts` (напр. `types/task.ts`), звідки їх і імпортують споживачі. Розділення: `schemas/` = валідація, `types/` = типи.

## Стадії

### Stage 1 — Zod-схеми, API-шар (fetch, TanStack Query hooks)  `[x] done`
- `src/schemas/task.schema.ts` — лише Zod-схеми (рантайм): `taskSchema` (повна сутність), `createTaskSchema` (title required, priority 1-10, description/tags/dueDate опційні), `updateTaskSchema` (= `createTaskSchema.partial()`, дзеркалить backend `UpdateTaskDto = PartialType(CreateTaskDto)`), `taskStatusSchema`, `taskFilterSchema`, `taskSortBySchema`, `taskSortOrderSchema`, `taskQuerySchema`.
- `src/types/task.ts` — виведені типи через `z.infer` зі схем (`Task`, `TaskStatus`, `TaskFilter`, `TaskSortBy`, `TaskSortOrder`, `CreateTaskInput`, `UpdateTaskInput`, `TaskQueryParams`); споживачі імпортують типи звідси, схеми — з `schemas/`.
- `src/lib/apiClient.ts` — `fetch`-обгортка (без axios), транспортний шар поряд із `queryClient.ts`: базовий URL, JSON headers, `res.ok`-перевірка, типізований парсинг помилок (`{ statusCode, message, errors? }` з `HttpExceptionFilter`). Доменні виклики (`api/tasks.ts`, `api/health.ts`) імпортують `api` звідси.
- `src/lib/queryClient.ts` — глобальні дефолти: `retry: false`, `staleTime: 60_000` (прибирає зайві рефетчі на remount/focus), `gcTime: 5*60_000` (v5-назва колишнього `cacheTime`). Мутації через `invalidateQueries(taskKeys.all)` рефетчать список незалежно від `staleTime`.
- `src/api/tasks.ts` — `getTasks(params)`, `createTask(dto)`, `updateTask(id, dto)`, `deleteTask(id)`, `updateTaskStatus(id, status)` — типізовані через схеми з `schemas/task.schema.ts`.
- `src/queries/tasks/` — усі task-хуки в окремій підпапці: `taskKeys.ts` (централізована мапа query-ключів), `useTasksQuery.ts`, `useCreateTaskMutation.ts`, `useUpdateTaskMutation.ts`, `useDeleteTaskMutation.ts`, `useUpdateTaskStatusMutation.ts`. Мутації інвалідують `taskKeys.all`.
- **Критерії успіху:** жодного вручну продубльованого типу — усе виводиться з Zod-схем; схеми збігаються з backend DTO (priority 1-10, filter all/done/undone, status todo/in_progress/done, partial update); хуки викликаються з тестової сторінки й повертають реальні дані з бекенду; typecheck/lint чисті.
- Тести: ні.

### Stage 2 — UI-фундамент (shadcn/ui, layout сторінки задач)  `[x] done`
- `pnpm dlx shadcn@latest init`, додати компоненти: Button, Input, Textarea, Checkbox, Select, Badge.
- Базовий layout `/tasks`-сторінки, контейнер, заголовок.
- **Критерії успіху:** shadcn-компоненти рендеряться, стилі Tailwind застосовані, сторінка адаптивна вже на цьому етапі (базовий контейнер).
- Тести: ні.

### Stage 3 — Список задач  `[x] done`
- `TaskList` (fetch через `useTasksQuery`) — **три розмежовані стани**:
  - `loading` — скелетон/спінер;
  - `empty` — успішний запит, 0 задач → «Немає задач»;
  - `error` — жорстка помилка (бек лежить / 500 / мережа) → «Не вдалося завантажити» + кнопка retry (`refetch`). Не зливається з empty.
- `TaskItem` — title, description, priority (бейдж), tags (бейджі), dueDate, статус.
- **Критерії успіху:** реальні задачі з БД відображаються; empty і error — різні виглядки, жодного "білого екрана"; retry в error-стані повторно тягне список.
- Тести: ні.

### Stage 4 — Додавання задачі  `[x] done`
- Форма (React Hook Form), резолвер — та сама `createTaskSchema` з `schemas/task.schema.ts` (Stage 1), а не окрема валідація; усі поля бекенду (priority 1-10, title required, tags max 5, dueDate не в минулому).
- `useCreateTaskMutation`, після успіху — інвалідація списку, очищення форми.
- **Критерії успіху:** невалідні дані підсвічуються помилками без запиту на бекенд; валідна відправка додає задачу і вона з'являється у списку без перезавантаження сторінки.
- Тести: ні.

### Stage 5 — Видалення задачі  `[x] done`
- Кнопка видалення + просте підтвердження (window.confirm або невеликий inline-підтверджувач — вирішимо на етапі).
- `useDeleteTaskMutation`, інвалідація списку.
- **Критерії успіху:** видалена задача зникає зі списку; випадкове видалення неможливе без підтвердження.
- Тести: ні.

### Stage 6 — Редагування задачі + зміна статусу  `[x] done`
- **Зміна статусу:** контрол на `TaskItem` з усіма трьома станами (shadcn `Select` або сегментований перемикач — визначимось на етапі), виклик `PATCH /tasks/:id/status` (`useUpdateTaskStatusMutation`).
- **Редагування полів:** перевикористати форму зі Stage 4 в edit-режимі (title/description/priority/tags/dueDate), резолвер — `updateTaskSchema` (partial), виклик `PATCH /tasks/:id` (`useUpdateTaskMutation`). UI редагування — модалка/inline (визначимось на етапі).
- Без optimistic update — контроли у стані "pending" (disabled) під час запиту, оновлюються після відповіді.
- **Критерії успіху:** зміна статусу між усіма трьома станами коректно відображається після round-trip; редагування будь-якого поля зберігається й одразу видно в списку; видно, який статус активний зараз.
- Тести: ні.

### Stage 7 — Фільтр, сортування, пошук (синхронізовані з URL)  `[~] in progress`
- Контроли: filter (all/done/undone), sort (priority asc/desc), search input.
- **URL-шар — `lib/searchParams.ts`** (утиліти, портовані з verify-проєкту, framework-agnostic, окремо від типізованого API-шару):
  - `getSearchWith(currentParams, paramsToUpdate)` — імутабельно оновлює підмножину параметрів, повертає новий querystring (для `router.replace`).
  - `normalizeParam(value, defaultValue?)` — дефолт/порожнє → `null` (видалити з URL), інакше → рядок. Забезпечує **чисті URL**: обраний дефолтний параметр у рядку не показується.
  - `removeEmptyParams`, `searchParamsToObject` — допоміжні.
- **Читання (URL → запит):** `useSearchParams()` → `searchParamsToObject` → `taskQuerySchema.safeParse` → типізований `TaskQueryParams` → `useTasksQuery(params)` → `getTasks(params)`. Схема тут валідує **вхід із URL** (хтось міг вписати `?sortBy=белеберда`).
- **Запис (контрол → URL):** `getSearchWith(currentParams, normalizeParam-очищені зміни)` → `router.replace(pathname + '?' + qs, { scroll: false })` (не `push`, щоб не засмічувати history).
- **Невалідний URL:** якщо `safeParse` не проходить (белеберда в URL) — падаємо на дефолти (ігноруємо невалідні поля), сторінка не ламається. Жорстка помилка бекенду/мережі — це **окремий error-стан** зі Stage 3, не «порожньо».
- Компонент, що читає `useSearchParams`, обгортається в `<Suspense>` (вимога Next.js App Router).
- `useDebouncedValue` хук для пошуку (~300-400мс) — у URL пишеться вже debounced-значення, не кожна натиснута клавіша.
- Усі три комбінуються в один запит до `GET /tasks`; при заході на сторінку з `?filter=done&sortBy=priority` список одразу відфільтрований — стан переживає перезавантаження й ним можна поділитись посиланням.
- **Критерії успіху:** зміна фільтра/сортування миттєво оновлює список і URL; дефолтні значення в URL не зʼявляються (чистий лінк); пошук не робить запит на кожну літеру (один запит після паузи); перезавантаження з параметрами в URL відновлює той самий стан; белеберда в URL не ламає сторінку.
- Тести: ні.

### Stage 8 — Мобільна адаптивність і фінальна полірування  `[ ] todo`
- Перевірка й підгонка вёрстки на вузьких екранах (форма, список, контроли фільтра/пошуку).
- Прибрати всі debug-артефакти, звірити з CLAUDE.md конвенціями.
- **Критерії успіху:** сторінка коректно виглядає й користується на ширині ~375px (мобільний) і на десктопі, без горизонтального скролу.
- Тести: ні.
