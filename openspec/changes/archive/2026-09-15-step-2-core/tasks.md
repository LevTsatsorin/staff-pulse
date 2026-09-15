## 1. Агрегация

- [x] 1.1 `utils/tree/aggregate.ts` + тесты — сделано на этапе 01 (дерево показывает суммы поддерева); здесь только убедиться, что таблица использует `model.aggregates`, а не считает заново
- [x] 1.2 `utils/format/formatNumber.ts` (`formatNumber`, `formatMoney`; тест на U+00A0 и « руб.»), `LEVEL_LABELS` уже есть с этапа 01; `formatPercent` не понадобился — проценты форматирует `PerformanceIndicator` (перенесён в `components/common`)

## 2. Пайплайн строк

- [x] 2.1 `types/table.ts` (`SortKey`, `SortDirection`, `SortState`, `SortTrigger`, `TableRow`), `constants/table.ts` (`TABLE_COLUMNS`; направление по умолчанию единое — по возрастанию), `utils/table/{toTableRows,filterRows,sortRows,getNextSort}.ts`, `utils/search.ts` (`normalizeQuery`, `splitByMatch`), `utils/tree/{getAncestorIds,getDefaultExpandedIds}.ts`, фикстуры `src/testing/orgFixtures.ts` — тесты: pre-order и путь, чтение агрегатов из модели (подменённые агрегаты), регистр, null-хвост в обе стороны, стабильность по порядку дерева, последовательность click → click → dblclick
- [x] 2.2 `hooks/common/useDebouncedValue.ts`, `hooks/orgTable/useSortState.ts` (обёртка над `getNextSort`), `hooks/orgTable/useTableRows.ts` (три `useMemo`); отсутствие пересчёта агрегатов доказано тестом `toTableRows` с подменёнными агрегатами — таблица читает модель и не зовёт агрегацию

## 3. Выделение и раскладка

- [x] 3.1 `providers/SelectionProvider/{SelectionContext,SelectionProvider,types,index}.ts(x)` (`selectedId`, `expandedIds`, `select`, `toggleExpanded`, `expandMany`), `hooks/common/{useSelection,useScrollIntoView}.ts`, `hooks/orgTree/useRevealNode.ts`; `useExpandedIds` удалён, дефолты — `getDefaultExpandedIds`; реализовано, проверить в браузере: раскрытие переживает рефетч (подождать > 5 с и сменить фокус окна)
- [x] 3.2 `components/layout/ViewToggle` (segmented control, `aria-pressed`, скрыт от 1280px), `components/layout/SplitView` (CSS grid + медиазапрос по `data-view`, без `useMediaQuery`: обе панели всегда смонтированы); реализовано, проверить в браузере на 1440 и 1024px, состояние сохраняется при переключении

## 4. Таблица

- [x] 4.1 `components/orgTable/{OrgTable,OrgTableRow,OrgTableToolbar,SortableHeader}` (`<table>`, sticky `<thead>`, `aria-sort`, `user-select: none`, `React.memo` строк, чип уровня в цветах направляющих дерева, `HighlightedText` в common, поле фильтра с очисткой, счётчик «N из M»); SSR-smoke на 52 узлах пройден; проверить в браузере сортировку каждого столбца, двойной клик, Enter на заголовке
- [x] 4.2 «Ничего не найдено» + «Сбросить фильтр» (очистка без дебаунса); клик по строке → `useRevealNode`; клик по узлу → `select`; `aria-selected` в дереве, подсветка строки; реализовано, проверить в браузере связь в обе стороны, прокрутку к узлу, `prefers-reduced-motion` (DevTools → Rendering)
- [x] 4.3 Приёмка этапа: фильтр «прод» с таймингом дебаунса в Network/console, формат бюджета, `pnpm typecheck && pnpm lint && pnpm test && pnpm build` зелёные, `grep style=` пусто

## 5. Docs и передача автору

- [x] 5.1 `docs/data-model.md` (контракт API, модель, формулы агрегации, пайплайн строк), `docs/architecture.md` (выделение, таблица, раскладка), README «Интерпретации» (двойной клик и клавиатура, порядок по умолчанию, фильтр и агрегаты, уровень, «—», split-view, ошибка фонового обновления)
- [x] 5.2 Запись в `notes/ai-log.md`; приёмка по скиллу stage-review; `openspec archive step-2-core` до коммита; автору передан текст коммита `feat: step 02 — analytics table` и тег `step/2`
