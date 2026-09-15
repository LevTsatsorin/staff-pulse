import type { OrgModel } from 'src/types/orgModel';

// Pre-order ids of the nodes a user can see: children of collapsed nodes are skipped.
export const getVisibleTreeIds = (model: OrgModel, expandedIds: ReadonlySet<string>): string[] => {
  const ids: string[] = [];

  const visit = (id: string) => {
    ids.push(id);
    if (!expandedIds.has(id)) return;
    for (const childId of model.childrenIds[id] ?? []) visit(childId);
  };

  for (const id of model.rootIds) visit(id);
  return ids;
};
