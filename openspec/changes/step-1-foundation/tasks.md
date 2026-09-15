## 1. Scaffold и тулинг

- [ ] 1.1 `pnpm create vite` (react-ts), убрать шаблонный код, зафиксировать точные версии, `packageManager`, `engines.node`, скрипты `dev` (client + server параллельно), `dev:client`, `dev:server`, `build`, `start`, `typecheck`, `test`, `lint`, `lint:fix`, `prepare`; проверить `pnpm install` и `pnpm dev`
- [ ] 1.2 `tsconfig.json` (strict-набор, `noUncheckedIndexedAccess`, `paths` для `src/*` и `shared/*`) + `tsconfig.server.json` (`NodeNext`, `erasableSyntaxOnly`, `types: node`); алиасы продублировать в `vite.config.ts`; проверить `pnpm typecheck` на обоих проектах
- [ ] 1.3 Biome (`biome.json`: форматтер, правила, группы импортов, override `noConsole` для `server/`) + `.editorconfig`; проверить `pnpm lint` на чистом каркасе
- [ ] 1.4 Vitest (`test` в `vite.config.ts`, environment `node`), `.git-hooks/pre-commit` (`lint` + `typecheck` + `test --run`), `prepare` ставит `core.hooksPath`; проверить, что хук исполняется на тестовом `git commit --dry-run`-подобной проверке (`sh .git-hooks/pre-commit`)
- [ ] 1.5 `.gitignore` (node_modules, dist, .env, coverage), `.env.example` (`PORT=3001`, `MOCK_SCENARIO=`); Vite proxy `/api` и `/ws` → `http://localhost:3001`; проверить `curl localhost:5173/api/org-tree` после 3.x

## 2. Общий контракт

- [ ] 2.1 `shared/orgTree.ts`: `orgNodeSchema` (`id` непустая строка, `name`, `parentId` nullable, `headcount` int ≥ 0, `budget` ≥ 0, `performance` 0–100, `updatedAt` `z.iso.datetime()`), `orgTreeResponseSchema`, типы `OrgNodeDto`; `shared/api.ts` с путями `/api/org-tree`; проверить, что импортируется из `src/` и `server/` без ошибок typecheck

## 3. Mock-сервер

- [ ] 3.1 `server/data.ts`: seeded PRNG, генератор 4 × 3 × 3 = 52 узла с русскими названиями, у каждого свой `headcount`; проверить `node server/index.ts` и `curl` → 52 узла, три уровня, повтор запуска даёт те же id
- [ ] 3.2 `server/index.ts`: `node:http`, роутер `GET /api/org-tree` (JSON, `ETag: "<version>"`, `Cache-Control: no-cache`, 304 на `If-None-Match`), 404 JSON на остальное, `MOCK_SCENARIO` (empty | error | slow | invalid), порт из env; проверить curl-ом каждый сценарий и 304
- [ ] 3.3 Скрипт `dev:server` через `node --watch server/index.ts`; проверить перезапуск при правке файла

## 4. Слой данных

- [ ] 4.1 `src/config.ts`, `constants/{api,cache,ui}.ts`, `errors/{ApiError,ApiValidationError,OrgDataError}.ts`, `utils/toUserMessage.ts`; `api/client.ts` (`fetchJson(url, { signal })`, HTTP-ошибка → `ApiError` со статусом); проверить typecheck
- [ ] 4.2 `utils/tree/buildOrgModel.ts` (+ `.test.ts`: пусто, один узел, лес, глубина, дубль id, сирота, цикл) и `types/orgModel.ts`; проверить `pnpm test --run`
- [ ] 4.3 `api/orgTree.ts` (`getOrgTree(signal)`: fetch → `safeParse` → `buildOrgModel`, версия из `ETag`), `api/queryClient.ts` (`staleTime: 5_000`, `retry: 1`), `hooks/orgTree/useOrgTree.ts` (`useQuery`, возвращает `{ model, status, error, refetch, isFetching }`); проверить в DevTools: один запрос, повторный монтаж < 5 с без запроса, отмена при размонтировании (throttling + быстрый unmount), `AbortError` не показывается

## 5. UI

- [ ] 5.1 `styles/{GlobalStyle,theme,styled.d,mixins}.ts` (CSS-переменные, dark по `prefers-color-scheme`, reset, шрифт system-ui), `App.tsx` с `QueryClientProvider` + `ThemeProvider` + `ErrorBoundary`; проверить рендер пустой страницы без ошибок консоли
- [ ] 5.2 `components/common/{Skeleton,Spinner,ErrorState,EmptyState,ErrorBoundary}` (`ErrorState` с кнопкой «Повторить», `EmptyState` с заголовком, текстом и CTA); визуальная проверка — через `MOCK_SCENARIO` в 5.4
- [ ] 5.3 `utils/getPerformanceTone.ts` (+ test порогов 49/50/79/80), `components/orgTree/{PerformanceIndicator,OrgTreeNode,OrgTree}`, `hooks/orgTree/useExpandedIds.ts` (начальное по `DEFAULT_EXPANDED_DEPTH`), разметка `role="tree"`; проверить: корни раскрыты, шеврон переключает, клик по названию не сворачивает, `aria-expanded` меняется
- [ ] 5.4 `components/layout/{Header,DashboardLayout}`, `pages/dashboard/DashboardPage.tsx` (ветвление по `status`, `isFetching` → тихий индикатор в шапке); проверить все состояния через `MOCK_SCENARIO=empty|error|slow|invalid` и обычный режим
- [ ] 5.5 Приёмка этапа: `grep -rn "style=" src/` пусто; `pnpm typecheck && pnpm lint && pnpm test --run && pnpm build` зелёные; размер gzip из `vite build` записан в лог

## 6. Docs и передача автору

- [ ] 6.1 README (RU): запуск одной командой, структура репозитория, раздел «Интерпретации» (второй уровень, headcount в дереве), заглушка «AI в разработке»; `docs/architecture.md` (слои, поток данных API → cache → hooks → UI), `docs/adr/001-tanstack-query-как-слой-кэширования.md`
- [ ] 6.2 Запись в `notes/ai-log.md` по этапу; сообщить автору текст коммита `feat: этап 01 — каркас, mock API, дерево` и тег `step/1`; после коммита — `openspec archive step-1-foundation`
