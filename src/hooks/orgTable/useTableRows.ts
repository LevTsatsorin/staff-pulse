import { useMemo } from 'react';

import type { OrgModel } from 'src/types/orgModel';
import type { SortState } from 'src/types/table';
import { filterRows } from 'src/utils/table/filterRows';
import { sortRows } from 'src/utils/table/sortRows';
import { applyStructuredFilter } from 'src/utils/table/structuredFilter';
import { toTableRows } from 'src/utils/table/toTableRows';

import type { StructuredFilter } from 'shared/search';

export const useTableRows = (
  model: OrgModel,
  query: string,
  sort: SortState | null,
  structuredFilter: StructuredFilter | null,
) => {
  const allRows = useMemo(() => toTableRows(model), [model]);
  const filteredRows = useMemo(
    () => applyStructuredFilter(filterRows(allRows, query), structuredFilter),
    [allRows, query, structuredFilter],
  );
  const rows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort]);

  return { rows, totalCount: allRows.length };
};
