## Why

Этап 03 POLISH ТЗ: live-обновления без полного рефетча, индикатор соединения, клавиатурная навигация и анимация дерева. Это то, что отличает «таблицу с данными» от живого дашборда.

## What Changes

- Сервер: WebSocket на `/ws`, тикер случайных изменений раз в 1–3 с (иногда пачкой), версия данных растёт с каждым патчем и совпадает с `ETag` снапшота.
- Общий контракт `shared/live.ts`: сообщения `hello` и `patch`, zod-схемы.
- Клиент: `applyPatch` в кэш без рефетча, пересчёт агрегатов только для узла и предков, сверка версий, один рефетч при пропуске версии или после реконнекта.
- Экспоненциальный backoff с jitter, реакция на `online`, индикатор соединения в шапке.
- Fade-out обновлённых ячеек ~1.5 с через CSS-анимацию.
- Keyboard navigation по таблице: стрелки, Home/End, Enter; фокус по id.
- Анимация раскрытия дерева через `grid-template-rows` без inline-CSS; `prefers-reduced-motion`.
- Docs: контракт патча в `data-model.md`, ADR-003 (WebSocket), ADR-004 (анимация высоты).

## Capabilities

### New Capabilities
- `live-updates`: поток изменений, применение патчей, реконнект, индикатор соединения, подсветка обновлений

### Modified Capabilities
- `mock-api`: добавляется WebSocket-эндпоинт и тикер изменений
- `org-table`: добавляется клавиатурная навигация и fade обновлённых ячеек
- `org-tree`: добавляется анимация раскрытия с учётом `prefers-reduced-motion`

## Impact

`server/live.ts`, `shared/live.ts`, `src/utils/tree/applyPatch.ts`, `hooks/live/useOrgLiveUpdates.ts`, `components/layout/ConnectionBadge`, `components/common/FlashValue`, `components/common/Collapsible`, `hooks/common/useRovingRows.ts`. Зависимость `ws` (сервер).
