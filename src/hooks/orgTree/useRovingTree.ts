import type React from 'react';
import { useMemo, useState } from 'react';

import { useRovingFocus, useSelection } from 'src/hooks/common';
import type { OrgModel } from 'src/types/orgModel';
import { getTreeKeyAction, TREE_NAVIGATION_KEYS } from 'src/utils/tree/getTreeKeyAction';
import { getVisibleTreeIds } from 'src/utils/tree/getVisibleTreeIds';

const pickCurrentId = (
  visibleIds: readonly string[],
  activeId: string | null,
  selectedId: string | null,
): string | null => {
  if (activeId !== null && visibleIds.includes(activeId)) return activeId;
  if (selectedId !== null && visibleIds.includes(selectedId)) return selectedId;
  return visibleIds[0] ?? null;
};

// One tab stop for the tree. Tab lands on the selected node when it is visible, so a node picked
// in the table is reachable with the keyboard right away.
export const useRovingTree = (model: OrgModel) => {
  const { selectedId, expandedIds, select, toggleExpanded } = useSelection();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [followedSelectedId, setFollowedSelectedId] = useState(selectedId);

  // A new selection (from the table or by Enter) becomes the tab stop until the keyboard moves on.
  if (selectedId !== followedSelectedId) {
    setFollowedSelectedId(selectedId);
    setActiveId(selectedId);
  }
  const visibleIds = useMemo(() => getVisibleTreeIds(model, expandedIds), [model, expandedIds]);
  const currentId = pickCurrentId(visibleIds, activeId, selectedId);
  const { containerRef, focusOnNextRender } = useRovingFocus<HTMLUListElement>(
    'data-tree-id',
    currentId,
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (currentId === null) return;

    // Enter and Space on the item select it; on an inner button they keep their native click.
    const isOnItem = (event.target as HTMLElement).getAttribute('role') === 'treeitem';
    if ((event.key === 'Enter' || event.key === ' ') && isOnItem) {
      event.preventDefault();
      select(currentId);
      return;
    }

    if (!TREE_NAVIGATION_KEYS.has(event.key)) return;
    event.preventDefault();

    const action = getTreeKeyAction(model, visibleIds, expandedIds, currentId, event.key);
    if (!action) return;
    if (action.type === 'focus') {
      focusOnNextRender();
      setActiveId(action.id);
      return;
    }
    toggleExpanded(action.id);
  };

  return { activeId: currentId, setActiveId, containerRef, handleKeyDown };
};
