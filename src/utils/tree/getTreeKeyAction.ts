import type { OrgModel } from 'src/types/orgModel';
import { getNextRowId } from 'src/utils/table/getNextRowId';

export type TreeKeyAction =
  | { type: 'focus'; id: string }
  | { type: 'expand'; id: string }
  | { type: 'collapse'; id: string };

export const TREE_NAVIGATION_KEYS: ReadonlySet<string> = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

// WAI-ARIA tree keys: Right opens a branch or steps into it, Left closes it or steps up to the
// parent; Up, Down, Home and End move through the visible nodes.
export const getTreeKeyAction = (
  model: OrgModel,
  visibleIds: readonly string[],
  expandedIds: ReadonlySet<string>,
  activeId: string,
  key: string,
): TreeKeyAction | null => {
  const node = model.nodes[activeId];
  if (!node) return null;

  const childIds = model.childrenIds[activeId] ?? [];
  const isOpen = childIds.length > 0 && expandedIds.has(activeId);

  if (key === 'ArrowRight') {
    const firstChildId = childIds[0];
    if (firstChildId === undefined) return null;
    return isOpen ? { type: 'focus', id: firstChildId } : { type: 'expand', id: activeId };
  }

  if (key === 'ArrowLeft') {
    if (isOpen) return { type: 'collapse', id: activeId };
    return node.parentId === null ? null : { type: 'focus', id: node.parentId };
  }

  const nextId = getNextRowId(visibleIds, activeId, key);
  return nextId === null || nextId === activeId ? null : { type: 'focus', id: nextId };
};
