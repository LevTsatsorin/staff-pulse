import { useCallback } from 'react';

import { useSelection } from 'src/hooks/common';
import type { OrgModel } from 'src/types/orgModel';
import { getAncestorIds } from 'src/utils/tree/getAncestorIds';

export const useRevealNode = (model: OrgModel) => {
  const { select, expandMany } = useSelection();

  return useCallback(
    (id: string) => {
      expandMany(getAncestorIds(model, id));
      select(id);
    },
    [model, select, expandMany],
  );
};
