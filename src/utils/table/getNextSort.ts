import { SortDirection, type SortKey, type SortState, type SortTrigger } from 'src/types/table';

// A double click always arrives after two clicks, so a click on the active column must be a no-op.
// Every column starts ascending: a double click on an inactive column therefore always ends descending.
export const getNextSort = (
  prev: SortState | null,
  key: SortKey,
  trigger: SortTrigger,
): SortState => {
  if (prev?.key !== key) return { key, direction: SortDirection.Asc };
  if (trigger === 'click') return prev;
  const direction = prev.direction === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc;
  return { key, direction };
};
