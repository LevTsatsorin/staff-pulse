import { SortKey } from 'src/types/table';

// Fixed widths keep columns still while the filter changes the rows; the name column takes the rest.
export const TABLE_COLUMNS = [
  { key: SortKey.Name, label: 'Подразделение', align: 'start', width: null },
  { key: SortKey.Level, label: 'Уровень', align: 'start', width: '124px' },
  { key: SortKey.Headcount, label: 'Всего сотрудников', align: 'end', width: '104px' },
  { key: SortKey.Budget, label: 'Бюджет суммарный', align: 'end', width: '150px' },
  { key: SortKey.Performance, label: 'Средняя эффективность', align: 'end', width: '124px' },
] as const;

export const TABLE_MIN_WIDTH_PX = 700;

export type TableColumn = (typeof TABLE_COLUMNS)[number];
export type ColumnAlign = TableColumn['align'];
