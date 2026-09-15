## 1. Агрегация

- [x] 1.1 `utils/tree/aggregate.ts` + тесты — сделано на этапе 01 (дерево показывает суммы поддерева); здесь только убедиться, что таблица использует `model.aggregates`, а не считает заново
- [ ] 1.2 `utils/format/formatMoney.ts` (+ тест на U+00A0 и суффикс « руб.»), `formatPercent.ts`, `LEVEL_LABELS` в `constants/ui.ts`; проверить тестами

## 2. Пайплайн строк

- [ ] 2.1 `types/sort.ts` (`SortKey`, `SortDirection`, `SortState`, `DEFAULT_SORT_DIRECTION` по столбцам), `utils/table/toTableRows.ts` (id, name, path, level, агрегаты), `filterRows.ts` (`toLocaleLowerCase('ru')`), `sortRows.ts` (компаратор на столбец, `null` в конце) — тесты на каждую: направление, null-хвост, регистр, пустой запрос
- [ ] 2.2 `hooks/common/useDebouncedValue.ts`, `hooks/orgTable/useSortState.ts` (click идемпотентен, dblclick/Enter переключает), `hooks/orgTable/useTableRows.ts` (три `useMemo`); проверить в React DevTools Profiler, что смена сортировки не вызывает `buildOrgModel`

## 3. Выделение и раскладка

- [ ] 3.1 `providers/SelectionProvider/{SelectionContext,SelectionProvider,types,index}.ts(x)` (`selectedId`, `expandedIds`, `select`, `toggleExpanded`, `expandMany`), `hooks/common/useSelection.ts`, `hooks/orgTree/useRevealNode.ts`; перенести `useExpandedIds` из дерева в провайдер; проверить, что раскрытие переживает рефетч
- [ ] 3.2 `hooks/common/useMediaQuery.ts`, `components/layout/ViewToggle` (segmented control, `aria-pressed`), `DashboardLayout` (grid при ≥1280px, `hidden` для неактивного представления ниже); проверить на 1440 и 1024px, состояние сохраняется при переключении

## 4. Таблица

- [ ] 4.1 `components/orgTable/OrgTable/` (`<table>`, sticky `<thead>`, `SortableHeader` с `<button>` и `aria-sort`, `user-select: none`), `OrgTableRow` (`React.memo`, tabular-nums, `LevelBadge`, `HighlightedText`), `OrgTableToolbar` (поле фильтра с очисткой, счётчик «N из M»); проверить сортировку каждого столбца, двойной клик, Enter на заголовке
- [ ] 4.2 Состояние «Ничего не найдено» с кнопкой «Сбросить фильтр» (переиспользовать `EmptyState`); клик по строке → `useRevealNode`; клик по узлу дерева → `select`; `aria-selected` в дереве и подсветка строки; проверить связь в обе стороны, прокрутку к узлу, `prefers-reduced-motion` (DevTools → Rendering)
- [ ] 4.3 Приёмка этапа: фильтр «прод» с таймингом дебаунса в Network/console, формат бюджета, `pnpm typecheck && pnpm lint && pnpm test && pnpm build` зелёные, `grep style=` пусто

## 5. Docs и передача автору

- [ ] 5.1 `docs/data-model.md` (структура модели, алгоритм агрегации, формулы; ADR-002 уже написан на этапе 01), README «Интерпретации» (двойной клик, фильтр и агрегаты, уровень, «—» при нулевом headcount)
- [ ] 5.2 Запись в `notes/ai-log.md`; сообщить автору текст коммита `feat: этап 02 — аналитическая таблица` и тег `step/2`; после коммита — `openspec archive step-2-core`
