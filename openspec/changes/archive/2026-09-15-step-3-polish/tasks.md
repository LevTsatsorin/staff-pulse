## 1. Сервер и контракт

- [x] 1.1 `shared/live.ts`: `liveMessageSchema` (discriminated union `hello` | `patch`, поля патча — `pick` из схемы узла), `LiveChange`, `LiveMessage`; `shared/api.ts` + путь `/ws`; `allowImportingTsExtensions` в клиентском tsconfig для импорта между файлами `shared/`; typecheck обоих проектов чистый
- [x] 1.2 `server/live.ts`: `WebSocketServer({ noServer: true })` + `upgrade` на `/ws` (чужие пути отклоняются), `hello` при подключении, тикер `PATCH_INTERVAL_MS` ± 50 %, пачка 2–4 узла каждый 5-й тик, `version++` = `ETag`; тикер выключен в сценариях `empty|error|invalid`, `slow` теперь отдаёт `ETag`; проверено двумя WS-клиентами Node: `hello` первым, 14 патчей подряд без пропусков, одинаковые у обоих клиентов, `ETag` = последняя версия
- [x] 1.3 `.env.example` + `PATCH_INTERVAL_MS`; README — раздел «Live-обновления» (как ускорить патчи, как увидеть переподключение, клавиатура)

## 2. Применение патчей

- [x] 2.0 Стабильные перерисовки: компаратор `memo` в `OrgTableRow` по полям строки (`utils/table/isSameRow` + тест), стабильный `useRevealNode` (модель в ref); проверено автором в браузере React DevTools «Highlight updates»: патч подсвечивает только строки узла и его предков
- [x] 2.1 `utils/tree/applyPatch.ts` (копии словарей один раз на патч, цепочка предков, пересборка глубоких первыми из прямых детей, сохранение ссылок) + тесты: узел и предки, сохранение ссылок, пачка, неизвестный id → `null`, 1000 случайных патчей ≡ полная пересборка; `utils/live/resolveLiveMessage.ts` + тесты всех веток сверки версий; сквозная проверка с живым сервером: 40 реальных патчей, модель на версии 46 совпала со снапшотом, перезапуск сервера → рефетч
- [x] 2.2 `hooks/live/useOrgLiveUpdates.ts`: сокет, zod, `resolveLiveMessage`, `setQueryData` / `invalidateQueries(cancelRefetch: false)`, backoff (`utils/live/getBackoffDelay` + тест, `constants/live.ts`), `online`/`offline`, `isDisposed`, отложенное первое подключение; `snapshotVersion` удалён из модели; проверено автором в браузере: в DevTools → Network → WS ровно одно соединение `/ws` в dev со StrictMode
- [x] 2.3 `components/layout/ConnectionBadge` (4 состояния, цвет + текст, отсчёт через `hooks/common/useCountdown`) в шапке; проверено автором в браузере: остановить сервер → «переподключение через N с» с растущими N, DevTools → Network → Offline → «офлайн», запуск сервера → «live»

## 3. UX

- [x] 3.1 `components/common/FlashValue` (поколение значения как `key`, `@keyframes`, reduced motion → `steps(1, end)`) в числовых ячейках таблицы и в численности/эффективности дерева; SSR-smoke: при первом рендере подсветки нет; проверено автором в браузере: патч подсвечивает узел и предков, раскрытие и фильтр не мигают
- [x] 3.2 `hooks/common/useRovingRows.ts` + `utils/table/getNextRowId` (+ тест) в `OrgTable`: одна tab-остановка (SSR: 1 × `tabindex=0`, 51 × `-1`), фокус по `data-row-id`, focus-ring на ячейках строки; проверено автором в браузере ↑/↓/Home/End/Enter, сортировку после патча, исчезновение активной строки при фильтре
- [x] 3.3 `components/common/Collapsible` (grid rows, `inert`, дети всегда смонтированы; SSR: 52 узла, 12 свёрнутых групп с `inert`), прокрутка к узлу после анимации; проверено автором в браузере: анимация ~200 мс, Tab не заходит в свёрнутое, reduced motion — мгновенно
- [x] 3.4 Навигация стрелками по дереву — по решению автора перенесена в конец этапа 04 как необязательная
- [x] 3.6 По фидбеку автора после приёмки: скелетоны по форме контента (`OrgTreeSkeleton` — 4 дивизиона с отделами, шеврон, число, бейдж, направляющая; `OrgTableSkeleton` — тулбар, заголовки по конфигу колонок, путь родителей, чип уровня, числа справа, бейдж) с общим переливом `skeletonFill`; `StateMessage` центрируется по высоте панели, «Ничего не найдено» перенесено в область прокрутки таблицы; SSR-smoke 7/7, jscpd без новых клонов
- [x] 3.5 Приёмка кода: typecheck, Biome 0/0, 71 тест, build 126.6 КБ gzip, `grep style=` пусто, SSR-smoke 7/7; GIF с подсветкой и переподключением — в задаче скриншотов этапа 04

## 4. Docs и передача автору

- [x] 4.1 `docs/data-model.md` (контракт WS, таблица правил применения, алгоритм `applyPatch`, переподключение; `snapshotVersion` убран), `docs/adr/003-websocket-live-updates.md`, `docs/adr/004-height-animation-grid.md`, `docs/architecture.md` (поток live-обновлений), README «Интерпретации» (поля патча, рефетч только при расхождении версий, правила подсветки)
- [x] 4.2 Запись в `notes/ai-log.md`; приёмка по скиллу stage-review (с graphify и jscpd); `openspec archive step-3-polish` до коммита; автору передан текст коммита `feat: step 03 — live updates, keyboard, animations` и тег `step/3`
