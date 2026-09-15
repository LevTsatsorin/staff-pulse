import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { getNextRowId } from 'src/utils/table/getNextRowId';

// Roving tabindex: one tab stop for the whole list, the active row is tracked by id,
// so sorting, filtering and live patches never move focus to a different node.
export const useRovingRows = (rowIds: readonly string[], onEnter: (id: string) => void) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLTableSectionElement>(null);
  const shouldFocusRef = useRef(false);
  const currentId = activeId !== null && rowIds.includes(activeId) ? activeId : (rowIds[0] ?? null);

  useEffect(() => {
    if (!shouldFocusRef.current || currentId === null) return;
    shouldFocusRef.current = false;
    containerRef.current
      ?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(currentId)}"]`)
      ?.focus();
  }, [currentId]);

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
    shouldFocusRef.current = true;
    setActiveId(nextId);
  };

  return { activeId: currentId, setActiveId, containerRef, handleKeyDown };
};
