## Context

Этапы 01–03 закрыты. Клиент ходит на относительные `/api` и `/ws`, поэтому env клиенту не нужен и один образ работает везде. Ревьюер, скорее всего, запустит проект без ключа Anthropic — fallback обязан выглядеть намеренным.

## Goals / Non-Goals

**Goals:** compose из двух сервисов, nginx с gzip и WS-прокси, бюджет бандла, AI-поиск со structured output и честным fallback.

**Non-Goals:** CI/CD, HTTPS, кэширование ответов модели, история запросов.

## Decisions

- **Два образа.** Клиент: стадия `node:24-alpine` (`pnpm install --frozen-lockfile`, `vite build`) → `nginx:alpine` с `dist/` и `nginx.conf`. Сервер: `node:24-alpine`, `pnpm install --prod --frozen-lockfile` (в `dependencies` только `ws`, `zod`, `@anthropic-ai/sdk`), `CMD ["node", "server/index.ts"]`. Клиентские библиотеки — в `devDependencies`, поэтому образ сервера без React.
- **nginx.conf:** `gzip on; gzip_types application/javascript text/css application/json image/svg+xml;`, `try_files $uri /index.html`, `location /api { proxy_pass http://server:3001; }`, `location /ws { proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 1h; }` — без этого WS за nginx не поднимется.
- **compose:** сервисы `server` и `client` с `container_name`, `env_file: .env`, порты `${CLIENT_PORT:-8080}:80`; `depends_on`. Формат совместим и с `docker-compose`, и с `docker compose`.
- **Бюджет:** `vite build` печатает gzip; `build.rollupOptions.output.manualChunks` — `vendor` для react/react-dom/query/styled-components. Если zod 4 не влезает — `zod/mini` в `shared/`. Ожидание ~90–110 КБ.
- **AI-поиск на сервере.** `server/search.ts`: `@anthropic-ai/sdk`, structured output с JSON-схемой фильтра (перед кодом — скилл `claude-api`), модель из `ANTHROPIC_MODEL` (по умолчанию `claude-opus-5` — решение автора: качество разбора важнее задержки; замерить на 15–20 запросах на этапе 04), системный промпт с описанием столбцов и уровней, `AbortSignal.timeout(5_000)`. Ответы: 200 / 400 / 503 (нет ключа) / 504 (таймаут). → ADR-005.
- **Клиент.** `shared/search.ts` — zod-схема `StructuredFilter`, одна и та же для сервера (валидация ответа модели) и клиента. `useAiSearch(query)`: после дебаунса POST; результат → `structuredFilter`; ошибка → `{ text: query }` + флаг `isAiUnavailable`. `applyStructuredFilter(rows, filter)` — чистая функция с тестом, встраивается в пайплайн после `filterRows`; `sort` из фильтра выставляет `useSortState`. Чипы — `FilterChips` с удалением условия (клиентское состояние, без повторного запроса).
- **Без ключа** сервер отвечает 503 сразу, клиент запоминает недоступность на сессию (не долбит эндпоинт на каждый ввод).

## Risks / Trade-offs

- [Модель отвечает дольше 5 с] → таймаут и fallback; модель переключается env-переменной (`claude-sonnet-5` как быстрый вариант).
- [Structured output вернул поля вне схемы] → zod на обеих сторонах; невалидно → fallback.
- [Ревьюер без Docker] → `pnpm i && pnpm dev` остаётся основным способом запуска в README.
- [Порог 200 КБ] → измерить до AI-поиска; SDK на клиенте не используется, размер не растёт.
