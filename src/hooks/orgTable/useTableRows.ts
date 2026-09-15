import { useMemo } from 'react';

import type { OrgModel } from 'src/types/orgModel';
import type { SortState } from 'src/types/table';
import { filterRows } from 'src/utils/table/filterRows';
import { sortRows } from 'src/utils/table/sortRows';
import { toTableRows } from 'src/utils/table/toTableRows';

export const useTableRows = (model: OrgModel, query: string, sort: SortState | null) => {
  const allRows = useMemo(() => toTableRows(model), [model]);
  const filteredRows = useMemo(() => filterRows(allRows, query), [allRows, query]);
  const rows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort]);

  return { rows, totalCount: allRows.length };
};
