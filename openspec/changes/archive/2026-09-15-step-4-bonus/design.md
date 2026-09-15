## Context

Этапы 01–03 закрыты. Клиент ходит на относительные `/api` и `/ws`, поэтому env клиенту не нужен и один образ работает везде. Ревьюер, скорее всего, запустит проект без ключа OpenAI — fallback обязан выглядеть намеренным. У автора оплаченный доступ к OpenAI и нет ключа Anthropic, поэтому провайдер AI-поиска — OpenAI.

## Goals / Non-Goals

**Goals:** compose из двух сервисов, nginx с gzip и WS-прокси, бюджет бандла, AI-поиск со structured output и честным fallback.

**Non-Goals:** CI/CD, HTTPS, кэширование ответов модели, история запросов.

## Decisions

- **Два образа.** Клиент: стадия `node:24-alpine` (`pnpm install --frozen-lockfile`, `vite build`) → `nginx:alpine` с `dist/` и `nginx.conf`. Сервер: `node:24-alpine`, `pnpm install --prod --frozen-lockfile` (в `dependencies` только `ws`, `zod`, `openai`), `CMD ["node", "server/index.ts"]`. Клиентские библиотеки — в `devDependencies`, поэтому образ сервера без React.
- **nginx.conf:** `gzip on; gzip_types application/javascript text/css application/json image/svg+xml;`, `try_files $uri /index.html`, `location /api { proxy_pass http://server:3001; }`, `location /ws { proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 1h; }` — без этого WS за nginx не поднимется.
- **compose:** сервисы `server` и `client` с `container_name`, порты `${CLIENT_PORT:-8080}:80`, `depends_on`. Переменные сервера перечислены явно в `environment` со значениями по умолчанию (`${OPENAI_MODEL:-gpt-5.6-terra}` и т. д.): Compose подставляет их из `.env` проекта, если файл есть, а без файла берёт дефолты. Вариант `env_file` с `required: false` отклонён при приёмке — синтаксис появился только в Compose 2.24, и явный список читается лучше. Сервер отдаёт `GET /api/health`, compose ждёт `service_healthy` перед стартом nginx: без этого первые секунды после `up` дашборд получал 502 от прокси.
- **Бюджет:** `vite build` печатает gzip — 129.6 КБ при лимите 200 КБ. Vendor-чанк (`manualChunks`) не выделялся: бандл заметно меньше лимита, разбиение дало бы выигрыш только в кэше между деплоями; `zod/mini` не понадобился.
- **Версия сборки:** `vite.config.ts` при `build` берёт `VITE_APP_BUILD_VERSION` из окружения (build-arg Docker) или короткий хеш коммита через `git rev-parse`.
- **Кэш демо-сценариев (найдено в браузере при реализации):** ответы `empty`, `error`, `invalid` отдаются с `Cache-Control: no-store` и без `ETag` — иначе пустой ответ с `ETag: "1"` совпадал с реальными данными версии 1, и браузер по 304 показывал закэшированный пустой список.
- **Фиксированные ширины колонок таблицы (найдено при реализации):** `table-layout: fixed` + ширины из `TABLE_COLUMNS`; без этого колонки прыгали при каждом изменении фильтра; скелетон берёт ту же сетку.
- **Провайдер — OpenAI.** ТЗ провайдера не задаёт; у автора оплаченный ключ OpenAI, поэтому фичу можно проверить вживую и снять для README. Альтернативы: Anthropic (нужен отдельный ключ и оплата), оба провайдера через `AI_PROVIDER` (второй адаптер ради гибкости, которая проекту не нужна). Вызов провайдера изолирован в одном модуле `server/search.ts`, смена провайдера — правка одного файла. → ADR-005.
- **AI-поиск на сервере.** `server/search.ts`: SDK `openai`, Responses API `responses.parse` со structured outputs через `zodTextFormat` (схема фильтра — та же zod-схема из `shared/search.ts`; совместимость helper с zod 4 проверить при установке), `reasoning.effort: "low"`, модель из `OPENAI_MODEL` (по умолчанию `gpt-5.6-terra` — уровень mini, $2 / $12 за 1M токенов; окончательный выбор по замеру `gpt-5.6-luna` / `gpt-5.6-terra` / `gpt-5.6-sol` на 15–20 запросах: точность, задержка, стоимость по `usage`), системный промпт с описанием столбцов и уровней, таймаут 5 с через `AbortSignal.timeout`. Отказ модели (`refusal`) и невалидный ответ — как ошибка. Ответы: 200 / 400 / 503 (нет ключа) / 504 (таймаут) / 502 (ошибка провайдера). Перед кодом — актуальная документация OpenAI через Context7, не по памяти.
- **Клиент.** `shared/search.ts` — zod-схема `StructuredFilter`, одна и та же для сервера (формат structured output и валидация ответа модели) и клиента. `useAiSearch` на `useMutation`: разбор по Enter или кнопке, а не после дебаунса — каждый вызов платный и длится 1.5–2.5 с, а недописанная фраза давала бы мигание пустого состояния (изменено при реализации); колбэки последнего `mutate` не дают медленному старому ответу перезаписать новый; успех очищает поле и переносит условия в чипы; ошибка оставляет текст фильтром по названию + флаг `isAiUnavailable`. `applyStructuredFilter(rows, filter)` — чистая функция с тестом, встраивается в пайплайн после `filterRows`; `sort` из фильтра выставляет `useSortState`. Чипы — `FilterChips` с удалением условия (клиентское состояние, без повторного запроса).
- **Без ключа** сервер отвечает 503 сразу, клиент запоминает недоступность на сессию (не долбит эндпоинт на каждый ввод).

## Risks / Trade-offs

- [Модель отвечает дольше 5 с] → таймаут и fallback; `reasoning.effort: "low"`, модель переключается `OPENAI_MODEL` (`gpt-5.6-luna` как самый быстрый вариант).
- [Расходы] → лимит расходов проекта в кабинете OpenAI; короткий промпт и небольшой `max_output_tokens`; без ключа запросы к провайдеру не уходят вовсе.
- [Structured output вернул поля вне схемы] → zod на обеих сторонах; невалидно → fallback.
- [Ревьюер без Docker] → `pnpm i && pnpm dev` остаётся основным способом запуска в README.
- [Порог 200 КБ] → измерить до AI-поиска; SDK на клиенте не используется, размер не растёт.
