import { createContext } from 'react';

import type { SelectionContextValue } from './types';

export const DEFAULT_SELECTION_CONTEXT_VALUE: SelectionContextValue = {
  selectedId: null,
  expandedIds: new Set(),
  select: () => {},
  toggleExpanded: () => {},
  expandMany: () => {},
};

export const SelectionContext = createContext<SelectionContextValue>(
  DEFAULT_SELECTION_CONTEXT_VALUE,
);
