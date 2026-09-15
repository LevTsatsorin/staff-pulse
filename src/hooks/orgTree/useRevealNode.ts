import { useCallback, useEffect, useRef } from 'react';

import { useSelection } from 'src/hooks/common';
import type { OrgModel } from 'src/types/orgModel';
import { getAncestorIds } from 'src/utils/tree/getAncestorIds';

// The callback stays stable across live patches, so memoized table rows keep skipping renders.
// Patches never change parentId, so the model from the last commit always has the right ancestors.
export const useRevealNode = (model: OrgModel) => {
  const { select, expandMany } = useSelection();
  const modelRef = useRef(model);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  return useCallback(
    (id: string) => {
      expandMany(getAncestorIds(modelRef.current, id));
      select(id);
    },
    [select, expandMany],
  );
};
