import type React from 'react';

export type SelectionContextValue = {
  selectedId: string | null;
  expandedIds: ReadonlySet<string>;
  select: (id: string) => void;
  toggleExpanded: (id: string) => void;
  expandMany: (ids: readonly string[]) => void;
};

export interface SelectionProviderProps {
  defaultExpandedIds?: ReadonlySet<string>;
  children: React.ReactNode;
}
