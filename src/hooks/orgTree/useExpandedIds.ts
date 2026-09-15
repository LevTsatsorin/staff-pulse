import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_EXPANDED_DEPTH } from 'src/constants/ui';
import type { OrgModel } from 'src/types/orgModel';

const EMPTY: ReadonlySet<string> = new Set();

const getDefaultExpandedIds = (model: OrgModel): ReadonlySet<string> =>
  new Set(
    Object.values(model.nodes)
      .filter(node => node.depth <= DEFAULT_EXPANDED_DEPTH && model.childrenIds[node.id])
      .map(node => node.id),
  );

// Defaults are derived from the model until the user touches the tree; after that the set is user-owned.
export const useExpandedIds = (model: OrgModel | undefined) => {
  const defaultIds = useMemo(() => (model ? getDefaultExpandedIds(model) : EMPTY), [model]);
  const [userIds, setUserIds] = useState<ReadonlySet<string> | null>(null);

  const toggleExpanded = useCallback(
    (id: string) =>
      setUserIds(prev => {
        const next = new Set(prev ?? defaultIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [defaultIds],
  );

  return { expandedIds: userIds ?? defaultIds, toggleExpanded };
};
