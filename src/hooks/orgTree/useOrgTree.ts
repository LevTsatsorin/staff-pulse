import { useQuery } from '@tanstack/react-query';

import { getOrgTree } from 'src/api/orgTree';
import { ORG_TREE_QUERY_KEY } from 'src/constants/cache';

// Returns the query result as is: TanStack's status-discriminated type narrows `data` for consumers.
export const useOrgTree = () =>
  useQuery({
    queryKey: ORG_TREE_QUERY_KEY,
    queryFn: ({ signal }) => getOrgTree(signal),
  });
