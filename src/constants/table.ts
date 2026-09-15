import { SortKey } from 'src/types/table';

export const TABLE_COLUMNS = [
  { key: SortKey.Name, label: 'Подразделение', align: 'start' },
  { key: SortKey.Level, label: 'Уровень', align: 'start' },
  { key: SortKey.Headcount, label: 'Всего сотрудников', align: 'end' },
  { key: SortKey.Budget, label: 'Бюджет суммарный', align: 'end' },
  { key: SortKey.Performance, label: 'Средняя эффективность', align: 'end' },
] as const;

export type TableColumn = (typeof TABLE_COLUMNS)[number];
export type ColumnAlign = TableColumn['align'];
