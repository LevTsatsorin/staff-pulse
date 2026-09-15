import type { OrgModel } from 'src/types/orgModel';

// Nearest parent first. The model is validated against cycles when it is built.
export const getAncestorIds = (model: OrgModel, id: string): string[] => {
  const ids: string[] = [];
  let parentId = model.nodes[id]?.parentId ?? null;
  while (parentId !== null) {
    ids.push(parentId);
    parentId = model.nodes[parentId]?.parentId ?? null;
  }
  return ids;
};
