## Context

Пустой репозиторий. Ограничения ТЗ: React + Vite + TS, без UI-библиотек, без inline-CSS, stale time 5 с, отмена запросов при размонтировании. Один pnpm-пакет: `src/` клиент, `server/` mock, `shared/` контракт. Решения ниже фиксируют каркас на все четыре этапа.

## Goals / Non-Goals

**Goals:**
- Каркас, который не придётся переделывать на этапах 02–04.
- Модель данных, готовая к агрегатам (02) и инкрементальным патчам (03).

**Non-Goals:**
- Таблица, агрегаты, WebSocket, docker, AI-поиск.

## Decisions

- **Кэш — TanStack Query v5, не свой слой.** `staleTime: 5_000`; `queryFn({ signal })` пробрасывает `AbortSignal` в fetch; `structuralSharing` сохраняет ссылки при эквивалентных данных — это и есть «инвалидация только при реальном изменении». Свой кэш — 100+ строк гонок за 2–3 дня; ТЗ допускает «аналог». Альтернативы: SWR (нет staleTime и отмены), свой `useAbortableRequest` + `Map`-кэш. → ADR-001.
- **Нормализация в `queryFn`.** После zod-валидации массив превращается в `OrgModel` (`nodes`, `childrenIds`, `rootIds`, `depth`, `version`), в кэше лежит модель, а не сырой массив. На 02 сюда же добавятся агрегаты, на 03 — `setQueryData(applyPatch)`. Альтернатива — `useMemo` от сырых данных — пересчитывала бы всё дерево на каждый патч.
- **Plain-объекты `Record<string, …>`, не `Map`:** `structuralSharing` работает только с массивами и plain-объектами.
- **Версия снапшота из `ETag`.** `queryFn` читает заголовок и кладёт `version` в модель; на 03 это точка сверки с `hello.version` из WS.
- **Сервер на `node:http` без фреймворка.** Node 24 исполняет `.ts` напрямую (type stripping) — без tsx/esbuild; `tsconfig.server.json` с `erasableSyntaxOnly` ловит неподдерживаемый синтаксис на `typecheck`. Fallback — `tsx`, если упрёмся.
- **`shared/` — единственный источник контракта.** Одна zod-схема импортируется клиентом и сервером; сервер типизирует генератор данных её выводом.
- **Демо-сценарии через env `MOCK_SCENARIO`.** Клиент о них не знает: никакого демо-кода в `src/`.
- **Dev-прокси Vite** `/api` и `/ws` → `localhost:3001`; клиент ходит на относительные пути, env клиенту не нужен — один и тот же бандл работает в dev, за nginx и в compose.
- **Стили:** `createGlobalStyle` с CSS-переменными (light + `prefers-color-scheme: dark`), `theme.ts` ссылается на переменные; transient-пропы только с конечным набором значений (`$tone: 'low' | 'mid' | 'high'`).
- **Раскрытие дерева** — `Set<id>` в хуке `useExpandedIds`, начальное значение по глубине (`DEFAULT_EXPANDED_DEPTH = 0`). На 02 состояние переезжает в `SelectionProvider`, когда появится выбор строки из таблицы.
- **Версии зависимостей — точные.** Vite 8 + plugin-react 6 (latest); TypeScript 5.9.3 (7.0 — новый нативный компилятор, вышел только что, не рискуем); Vitest 4.x (5.0.0 — day-0 релиз). Peer-диапазоны проверяются при scaffold, при конфликте берём версии из `pnpm create vite`.

## Risks / Trade-offs

- [Node native TS не поддерживает какой-то синтаксис] → `erasableSyntaxOnly` + `verbatimModuleSyntax` в серверном tsconfig; fallback `tsx watch`.
- [zod 4 тяжёл для бюджета 200 КБ gzip] → измерить на первом `vite build`, записать в лог; `zod/mini` при необходимости.
- [Vite 8 и Vitest 4 конфликтуют по peer] → Vitest 5.0.0 как запасной вариант, проверяется на scaffold.
- [TanStack Query воспринимается как «не свой кэш»] → ADR-001 объясняет выбор; `OrgModel` и патчи всё равно свои.
