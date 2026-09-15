## 1. Сервер и контракт

- [ ] 1.1 `shared/live.ts`: `liveMessageSchema` (discriminated union `hello` | `patch`), типы `LivePatch`, `LiveChange`; проверить typecheck клиента и сервера
- [ ] 1.2 `server/live.ts`: `WebSocketServer({ noServer: true })` + `upgrade` на `/ws`, `hello` при подключении, тикер (1–3 с, `PATCH_INTERVAL_MS`, пачка каждый ~5-й тик), `version++` и синхронный `ETag`; проверить `node -e` WS-клиентом: hello, затем патчи, `curl -I` показывает растущий `ETag`
- [ ] 1.3 `.env.example` дополнить `PATCH_INTERVAL_MS`; README — как наблюдать патчи

## 2. Применение патчей

- [ ] 2.1 `utils/tree/applyPatch.ts` (копия узла, цепочка предков, пересчёт из прямых детей, сохранение ссылок) + тест: один узел, пачка, неизвестный id → результат «нужен рефетч», эквивалентность 1000 случайных патчей полному пересчёту, сохранение ссылок незатронутых узлов — `pnpm test`
- [ ] 2.2 `hooks/live/useOrgLiveUpdates.ts`: сокет, валидация, сверка версий, `setQueryData`, `invalidateQueries` при пропуске/неизвестном id, backoff с jitter (`constants/live.ts`), `online`, `disposed`; проверить в dev с StrictMode — одно соединение, патч применяется один раз (счётчик в консоли временно)
- [ ] 2.3 `components/layout/ConnectionBadge` (4 состояния, отсчёт через `nextRetryAt` и один интервал на 1 с) в шапке; проверить: остановить сервер → интервалы растут (лог задержек), `online/offline` в DevTools, запуск сервера → live + один рефетч в Network

## 3. UX

- [ ] 3.1 `components/common/FlashValue` (`@keyframes`, `key` по значению, активна при `version !== snapshotVersion`), применить к числовым ячейкам таблицы и headcount/performance в дереве; проверить: патч подсвечивает узел и предков, первичная загрузка не мигает, reduced-motion — без анимации
- [ ] 3.2 `hooks/common/useRovingRows.ts` + интеграция в `OrgTable` (`tabIndex`, `onKeyDown`, фокус по `data-id`), видимый focus-ring через миксин; проверить ↑/↓/Home/End/Enter, сортировку после патча, исчезновение активной строки при фильтре
- [ ] 3.3 `components/common/Collapsible` (grid rows, `inert`), подключить в `OrgTreeNode`, поворот шеврона, глобальный `prefers-reduced-motion`; проверить: анимация ~200 мс, `style` в DOM отсутствует, Tab не заходит в свёрнутое, reduced-motion мгновенно
- [ ] 3.4 (опционально, если есть время) стрелки ←/→/↑/↓ в дереве по паттерну WAI-ARIA tree
- [ ] 3.5 Приёмка: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, `grep style=` пусто, GIF: fade после патча и бейдж reconnecting

## 4. Docs и передача автору

- [ ] 4.1 `docs/data-model.md`: контракт WS (hello/patch, версии, правила применения), алгоритм `applyPatch`; `docs/adr/003-websocket-для-live-обновлений.md`, `docs/adr/004-анимация-высоты-через-grid.md`; README «Интерпретации» (патч не меняет parentId)
- [ ] 4.2 Запись в `notes/ai-log.md`; сообщить автору текст коммита `feat: этап 03 — live-обновления, клавиатура, анимации` и тег `step/3`; после коммита — `openspec archive step-3-polish`
