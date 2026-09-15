## 1. Production-сборка

- [ ] 1.1 `Dockerfile.server` (node:24-alpine, prod-зависимости, `node server/index.ts`), `Dockerfile.client` (build → nginx:alpine), `nginx.conf` (gzip_types, try_files, `/api`, `/ws` с upgrade), `.dockerignore`; проверить `docker build` обоих образов
- [ ] 1.2 `docker-compose.yaml` (server, client, `env_file`, порты из `.env`), `.env.example` (`CLIENT_PORT`, `PORT`, `PATCH_INTERVAL_MS`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`); проверить `docker-compose up`: страница открывается, `curl -I` бандла показывает `Content-Encoding: gzip`, бейдж «live» за nginx
- [ ] 1.3 Бюджет: `manualChunks` vendor, зафиксировать gzip-размеры из `pnpm build` в README; при > 200 КБ — `zod/mini`

## 2. AI-поиск

- [ ] 2.1 `shared/search.ts` (zod-схема `structuredFilterSchema` + JSON-схема для модели из неё), `server/search.ts` (`POST /api/search/parse`, SDK, structured output, таймаут 5 с, 400/503/504) — перед кодом загрузить скилл `claude-api`; проверить curl-ом с ключом и без
- [ ] 2.2 `utils/table/applyStructuredFilter.ts` + тест (levels, диапазоны, text, пустой фильтр), `hooks/orgTable/useAiSearch.ts` (дебаунс, AbortController, fallback, «недоступен» на сессию); проверить в UI: «команды с эффективностью ниже 50», «продажи», без ключа — бейдж и текстовый поиск
- [ ] 2.3 `components/orgTable/{SearchBox,FilterChips}` (чипы с удалением, бейдж «AI недоступен», индикатор «разбираю…»), интеграция `sort` из фильтра в `useSortState`; проверить удаление чипа и сброс
- [ ] 2.4 Приёмка: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, `docker-compose up` с нуля

## 3. Финальные docs и передача автору

- [ ] 3.1 `docs/adr/005-ai-поиск-с-fallback.md`; `docs/architecture.md` финальная (слои, поток API → cache → hooks → UI, WS, deployment-схема); README: docker-запуск, env, AI-поиск, «Интерпретации» полные, размеры бандла
- [ ] 3.2 Скриншоты/GIF в `docs/media/`: split-view, fade после патча, бейдж reconnecting, три состояния (загрузка/ошибка/пусто), AI-чипы; вставить в README
- [ ] 3.3 README «AI в разработке» из `notes/ai-log.md`: что генерировалось, что переписано руками и почему, какие инструменты (Claude Code, openspec, скиллы); запись в лог; сообщить автору текст коммита `feat: этап 04 — docker, nginx, AI-поиск` и тег `step/4`; после коммита — `openspec archive step-4-bonus` и `git push --tags`
