## Why

Этап 04 BONUS ТЗ: production-сборка одной командой и AI-поиск. Показывает, что проект доводится до запуска «как в проде», а AI-функция деградирует достойно без ключа.

## What Changes

- Docker: `docker-compose up` поднимает `server` (node:24-alpine) и `client` (nginx:alpine со статикой); конфиг через `.env`.
- Nginx: gzip для js/css/json/svg, SPA-fallback, прокси `/api` и `/ws` (с upgrade-заголовками).
- Production-бандл ≤ 200 КБ gzip: измерение, `manualChunks`, при необходимости `zod/mini`.
- AI-поиск: `POST /api/search/parse` превращает естественный язык в структурированный фильтр через OpenAI Responses API со structured outputs; клиент валидирует ответ, показывает чипы и применяет фильтр; fallback — текстовый поиск с бейджем «AI недоступен».
- Docs: ADR-005 (AI-поиск и fallback), README (docker, env, AI-поиск, скриншоты/GIF), финальный `architecture.md`.

## Capabilities

### New Capabilities
- `deployment`: контейнеризация, nginx, бюджет бандла
- `ai-search`: разбор естественного языка в фильтр и его применение с fallback

### Modified Capabilities
- `mock-api`: добавляется эндпоинт разбора поискового запроса и проверка готовности
- `org-tree`: добавляется клавиатурная навигация по дереву (необязательная задача, сделана по решению автора)

## Impact

`Dockerfile.client`, `Dockerfile.server`, `nginx.conf`, `docker-compose.yaml`, `.env.example`; `server/search.ts`, `shared/search.ts`, `hooks/orgTable/useAiSearch.ts`, `utils/table/applyStructuredFilter.ts`, `components/orgTable/{SearchBox,FilterChips}`. Зависимость `openai` (сервер).
