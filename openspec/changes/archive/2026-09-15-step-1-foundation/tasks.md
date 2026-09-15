## 1. Scaffold и тулинг

- [x] 1.1 `pnpm create vite` (react-ts), убрать шаблонный код, зафиксировать точные версии, `packageManager`, `engines.node`, скрипты `dev` (client + server параллельно), `dev:client`, `dev:server`, `build`, `start`, `typecheck`, `test`, `lint`, `lint:fix`, `prepare`; проверить `pnpm install` и `pnpm dev`
- [x] 1.2 `tsconfig.json` (strict-набор, `noUncheckedIndexedAccess`, `paths` для `src/*` и `shared/*`) + `tsconfig.server.json` (`NodeNext`, `erasableSyntaxOnly`, `types: node`); алиасы продублировать в `vite.config.ts`; проверить `pnpm typecheck` на обоих проектах
- [x] 1.3 Biome (`biome.json`: форматтер, правила, группы импортов, override `noConsole` для `server/`) + `.editorconfig`; проверить `pnpm lint` на чистом каркасе
- [x] 1.4 Vitest (`test` в `vite.config.ts`, environment `node`), `.git-hooks/pre-commit` (`lint` + `typecheck` + `test`), `prepare` ставит `core.hooksPath`; проверить, что хук исполняется на тестовом `git commit --dry-run`-подобной проверке (`sh .git-hooks/pre-commit`)
- [x] 1.5 `.gitignore` (node_modules, dist, .env, coverage), `.env.example` (`PORT=3001`, `MOCK_SCENARIO=`); Vite proxy `/api` и `/ws` → `http://localhost:3001`; проверить `curl localhost:5173/api/org-tree` после 3.x

## 2. Общий контракт

- [x] 2.1 `shared/orgTree.ts`: `orgNodeSchema` (`id` непустая строка, `name`, `parentId` nullable, `headcount` int ≥ 0, `budget` ≥ 0, `performance` 0–100, `updatedAt` `z.iso.datetime()`), `orgTreeResponseSchema`, типы `OrgNodeDto`; `shared/api.ts` с путями `/api/org-tree`; проверить, что импортируется из `src/` и `server/` без ошибок typecheck

## 3. Mock-сервер

- [x] 3.1 `server/data.ts`: seeded PRNG, генератор 4 × 3 × 3 = 52 узла с русскими названиями, у каждого свой `headcount`; проверить `node server/index.ts` и `curl` → 52 узла, три уровня, повтор запуска даёт те же id
- [x] 3.2 `server/index.ts`: `node:http`, роутер `GET /api/org-tree` (JSON, `ETag: "<version>"`, `Cache-Control: no-cache`, 304 на `If-None-Match`), 404 JSON на остальное, `MOCK_SCENARIO` (empty | error | slow | invalid), порт из env; проверить curl-ом каждый сценарий и 304
- [x] 3.3 Скрипт `dev:server` через `node --watch server/index.ts`; проверить перезапуск при правке файла

## 4. Слой данных

- [x] 4.1 `src/config.ts`, `constants/{api,cache,ui}.ts`, `errors/{ApiError,ApiValidationError,OrgDataError}.ts`, `utils/toUserMessage.ts`; `api/client.ts` (`fetchJson(url, { signal })`, HTTP-ошибка → `ApiError` со статусом); проверить typecheck
- [x] 4.4 `utils/tree/aggregate.ts` (`aggregateNode`, `computeAggregates`: суммы поддерева, взвешенная средняя, `null` при нулевой численности) + тесты (лист, вложенность, ноль, лес, пусто); встроить в `buildOrgModel` — перенесено из этапа 02 после первого визуального прогона
- [x] 4.2 `utils/tree/buildOrgModel.ts` (+ `.test.ts`: пусто, один узел, лес, глубина, дубль id, сирота, цикл) и `types/orgModel.ts`; проверить `pnpm test`
- [x] 4.3 `api/orgTree.ts` (`getOrgTree(signal)`: fetch → `safeParse` → `buildOrgModel`, версия из `ETag`), `api/queryClient.ts` (`staleTime: 5_000`, `retry: 1`), `hooks/orgTree/useOrgTree.ts` (`useQuery`, возвращает `{ model, status, error, refetch, isFetching }`); проверить в DevTools: один запрос, повторный монтаж < 5 с без запроса, отмена при размонтировании (throttling + быстрый unmount), `AbortError` не показывается

## 5. UI

- [x] 5.1 `styles/{GlobalStyle,theme,styled.d,mixins}.ts` (CSS-переменные, dark по `prefers-color-scheme`, reset, шрифт system-ui), `App.tsx` с `QueryClientProvider` + `ThemeProvider` + `ErrorBoundary`; проверить рендер пустой страницы без ошибок консоли
- [x] 5.2 `components/common/{Skeleton,Spinner,ErrorState,EmptyState,ErrorBoundary}` (`ErrorState` с кнопкой «Повторить», `EmptyState` с заголовком, текстом и CTA); визуальная проверка — через `MOCK_SCENARIO` в 5.4
- [x] 5.6 Направляющие вложенности (indent-rainbow): полоса + линия под колонкой шеврона, цвет по уровню через CSS-переменные; favicon inline-SVG; `--env-file-if-exists=.env` для сервера; убран deprecated `baseUrl` (проверено TS 6.0-beta: 0 предупреждений)
- [x] 5.3 `utils/getPerformanceTone.ts` (+ test порогов 49/50/79/80), `components/orgTree/{PerformanceIndicator,OrgTreeNode,OrgTree}`, `hooks/orgTree/useExpandedIds.ts` (начальное по `DEFAULT_EXPANDED_DEPTH`), разметка `role="tree"`; проверить: корни раскрыты, шеврон переключает, клик по названию не сворачивает, `aria-expanded` меняется
- [x] 5.4 `components/layout/{Header,DashboardLayout}`, `pages/dashboard/DashboardPage.tsx` (ветвление по `status`, `isFetching` → тихий индикатор в шапке); проверить все состояния через `MOCK_SCENARIO=empty|error|slow|invalid` и обычный режим
- [x] 5.5 Приёмка этапа: `grep -rn "style=" src/` пусто; `pnpm typecheck && pnpm lint && pnpm test && pnpm build` зелёные; размер gzip из `vite build` записан в лог

## 6. Docs и передача автору

- [x] 6.1 README (RU): запуск одной командой, структура репозитория, раздел «Интерпретации» (второй уровень, headcount в дереве), заглушка «AI в разработке»; `docs/architecture.md` (слои, поток данных API → cache → hooks → UI), `docs/adr/001-tanstack-query-как-слой-кэширования.md`
- [x] 6.2 Запись в `notes/ai-log.md` по этапу; сообщить автору текст коммита `feat: этап 01 — каркас, mock API, дерево` и тег `step/1`; после коммита — `openspec archive step-1-foundation`
