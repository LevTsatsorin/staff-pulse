## 1. Production-сборка

- [x] 1.1 `Dockerfile.server` (node:24.21.0-alpine, corepack, `pnpm install --prod`, пользователь `node`), `Dockerfile.client` (сборка → nginx:1.31.5-alpine), `nginx.conf` (gzip_types, SPA-fallback, immutable-кэш `/assets/`, `/api`, `/ws` с upgrade), `.dockerignore` (без `.env` и `.git`); оба образа собираются, в серверном `node_modules` только `openai`, `ws`, `zod`
- [x] 1.2 `docker-compose.yaml` (server, client, необязательный `env_file`, `CLIENT_PORT`, build-arg `BUILD_VERSION`), `.env.example` (`CLIENT_PORT`, `BUILD_VERSION`, `PORT`, `MOCK_SCENARIO`, `PATCH_INTERVAL_MS`, `OPENAI_API_KEY`, `OPENAI_MODEL`); `docker-compose up --build`: страница 200, бандл `Content-Encoding: gzip`, SPA-fallback, `/api` с `ETag`, WebSocket через nginx (hello + патчи), AI-поиск через прокси, серверный образ без `.env` отвечает 503 на разбор
- [x] 1.2.1 Версия сборки: `vite.config.ts` берёт `VITE_APP_BUILD_VERSION` (build-arg Docker) или короткий хеш коммита; проверено в бандле локальной сборки и в Docker (`docker`)
- [x] 1.3 Бюджет: 129.6 КБ gzip при лимите 200 КБ, записано в README; vendor-чанк и `zod/mini` не понадобились (обоснование в design)

## 2. AI-поиск

- [x] 2.1 `shared/search.ts` (`structuredFilterSchema`, nullable-поля для strict structured outputs, `searchParseRequestSchema`), `server/http.ts` (`sendJson`, `readJsonBody` с лимитом), `server/search.ts` (`responses.parse` + `zodTextFormat`, `reasoning.effort: low`, таймаут 5 с, 400/502/503/504); curl: «команды с эффективностью ниже 50» → `levels [3]`, `performance.max ≈ 50`; «продажи» → `text`; без ключа 503; пустой и битый запрос 400
- [x] 2.2 `utils/table/structuredFilter.ts` (`applyStructuredFilter`, `getFilterChips`, `withoutCondition`) + 9 тестов, `api/searchParse.ts`, `hooks/orgTable/useAiSearch.ts` (`useMutation`, клиентский таймаут 6 с, 503 запоминается); разбор по Enter вместо дебаунса (решение в design); проверено в headless Chrome: чипы из примера спеки, 503 → бейдж и текстовый поиск
- [x] 2.3 Тулбар: форма `role=search` с кнопкой «AI-разбор» и бейджем «AI недоступен»; `FilterChips` (удаление условия, «Сбросить»), `sort` из ответа в `useSortState`, подсказка «Разобрать запрос AI» в пустом результате, подсветка текста из AI-фильтра; проверено в браузере: удаление чипа снимает одно условие, сброс возвращает 52 строки
- [x] 2.3.1 Замер на 18 запросах: luna, terra и sol — все 18/18; terra p50 1.5 с / p95 2.5 с / $0.0014 за запрос — оставлена по умолчанию; таблица в ADR-005; стоимость замера около $0.08
- [x] 2.5 Приёмка на Fable (stage-review): сверка с ТЗ по пунктам, живой прогон 12 запросов через прод-стек (в т. ч. запросы без условий), проверка классов SDK для веток 502/504, тесты контракта `shared/search.test.ts` (5), подсказка «AI не нашёл условий» вместо молчаливого игнорирования, `.dockerignore` без `openspec`/`docs`/`.claude`, compose без `env_file`; 85 тестов, 129.8 КБ gzip
- [x] 2.4 Приёмка: typecheck, Biome 0/0, 80 тестов, build 129.6 КБ gzip, `docker-compose up --build` с нуля; headless Chrome по CDP — 22 пользовательских сценария PASS; найдены и исправлены коллизия `ETag` у демо-сценариев, прыжки ширины колонок при фильтрации, «через 0 с» в бейдже

## 3. Финальные docs и передача автору

- [x] 3.1 `docs/adr/005-ai-search-with-fallback.md` (провайдер, контракт, fallback, замер моделей); `docs/architecture.md` (AI-поиск, развёртывание); `docs/data-model.md` (контракт AI-поиска); README: Docker-запуск, env, AI-поиск, интерпретации, размер сборки
- [x] 3.2 11 скриншотов в `docs/media/` сняты headless Chrome на прод-сборке: split-view с выделением, подсветка после патча, переподключение, тёмная тема, 1024px, AI-чипы, AI недоступен, загрузка, ошибка, пустой ответ, ничего не найдено; GIF не сделан — на машине нет кодировщика, ТЗ допускает скриншоты
- [x] 3.3 README «AI в разработке»: инструменты, что сгенерировано, что изменено по решению автора, что AI переделал сам, где AI ошибался; запись в лог; архив и текст коммита — после приёмки автором

## 4. Необязательно, если останется время

- [x] 4.1 Навигация стрелками по дереву: `utils/tree/{getVisibleTreeIds,getTreeKeyAction}` (+ 8 тестов), общий `hooks/common/useRovingFocus` (таблица переведена на него), `hooks/orgTree/useRovingTree`, roving tabindex на `treeitem`, кнопки узлов вне порядка Tab, Tab попадает на выделенный узел; проверено в headless Chrome: ↓, → раскрывает и входит, ← поднимается и сворачивает, End/Home, Enter выделяет, одна tab-остановка
