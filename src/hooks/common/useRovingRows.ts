import type React from 'react';
import { useState } from 'react';

import { useRovingFocus } from 'src/hooks/common/useRovingFocus';
import { getNextRowId } from 'src/utils/table/getNextRowId';

// Roving tabindex: one tab stop for the whole list, the active row is tracked by id,
// so sorting, filtering and live patches never move focus to a different node.
export const useRovingRows = (rowIds: readonly string[], onEnter: (id: string) => void) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const currentId = activeId !== null && rowIds.includes(activeId) ? activeId : (rowIds[0] ?? null);
  const { containerRef, focusOnNextRender } = useRovingFocus<HTMLTableSectionElement>(
    'data-row-id',
    currentId,
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (currentId === null) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      onEnter(currentId);
      return;
    }

    const nextId = getNextRowId(rowIds, currentId, event.key);
    if (nextId === null) return;
    event.preventDefault();
    if (nextId === currentId) return;

    focusOnNextRender();
    setActiveId(nextId);
  };

  return { activeId: currentId, setActiveId, containerRef, handleKeyDown };
};
