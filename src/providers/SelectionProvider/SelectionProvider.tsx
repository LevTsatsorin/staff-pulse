import type React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { SelectionContext } from './SelectionContext';
import type { SelectionContextValue, SelectionProviderProps } from './types';

const EMPTY_IDS: ReadonlySet<string> = new Set();

export const SelectionProvider: React.FC<SelectionProviderProps> = ({
  defaultExpandedIds = EMPTY_IDS,
  children,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState(defaultExpandedIds);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandMany = useCallback((ids: readonly string[]) => {
    setExpandedIds(prev => (ids.every(id => prev.has(id)) ? prev : new Set([...prev, ...ids])));
  }, []);

  const contextValue = useMemo<SelectionContextValue>(
    () => ({ selectedId, expandedIds, select: setSelectedId, toggleExpanded, expandMany }),
    [selectedId, expandedIds, toggleExpanded, expandMany],
  );

  return <SelectionContext value={contextValue}>{children}</SelectionContext>;
};
