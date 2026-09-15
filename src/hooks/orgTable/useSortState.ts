import { useCallback, useState } from 'react';

import type { SortKey, SortState, SortTrigger } from 'src/types/table';
import { getNextSort } from 'src/utils/table/getNextSort';

export const useSortState = () => {
  const [sort, setSort] = useState<SortState | null>(null);

  const changeSort = useCallback(
    (key: SortKey, trigger: SortTrigger) => setSort(prev => getNextSort(prev, key, trigger)),
    [],
  );

  return { sort, changeSort };
};
