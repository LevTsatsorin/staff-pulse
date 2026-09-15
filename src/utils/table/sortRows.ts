import { LOCALE } from 'src/constants/ui';
import { SortDirection, type SortKey, type SortState, type TableRow } from 'src/types/table';

type SortValue = string | number | null;

const collator = new Intl.Collator(LOCALE, { sensitivity: 'base', numeric: true });

const SORT_VALUE: Record<SortKey, (row: TableRow) => SortValue> = {
  name: row => row.name,
  level: row => row.depth,
  totalHeadcount: row => row.totalHeadcount,
  totalBudget: row => row.totalBudget,
  avgPerformance: row => row.avgPerformance,
};

const compareValues = (a: string | number, b: string | number): number =>
  typeof a === 'string' && typeof b === 'string' ? collator.compare(a, b) : Number(a) - Number(b);

// Empty values stay last in both directions; ties keep tree order.
export const sortRows = (
  rows: readonly TableRow[],
  sort: SortState | null,
): readonly TableRow[] => {
  if (!sort) return rows;
  const pick = SORT_VALUE[sort.key];
  const sign = sort.direction === SortDirection.Asc ? 1 : -1;

  return rows.toSorted((a, b) => {
    const left = pick(a);
    const right = pick(b);
    if (left === null || right === null) {
      if (left === right) return a.order - b.order;
      return left === null ? 1 : -1;
    }
    return sign * compareValues(left, right) || a.order - b.order;
  });
};
