import { LOCALE } from 'src/constants/ui';
import type { TableRow } from 'src/types/table';
import { normalizeQuery } from 'src/utils/search';

export const filterRows = (rows: readonly TableRow[], query: string): readonly TableRow[] => {
  const needle = normalizeQuery(query);
  if (!needle) return rows;
  return rows.filter(row => row.name.toLocaleLowerCase(LOCALE).includes(needle));
};
