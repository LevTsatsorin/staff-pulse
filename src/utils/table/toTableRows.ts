import { FALLBACK_LEVEL_LABEL, LEVEL_LABELS } from 'src/constants/ui';
import type { OrgModel } from 'src/types/orgModel';
import type { TableRow } from 'src/types/table';

const PATH_SEPARATOR = ' · ';

// Pre-order walk, so the unsorted table mirrors the tree. Totals are read from the model, never recomputed.
export const toTableRows = (model: OrgModel): TableRow[] => {
  const rows: TableRow[] = [];

  const visit = (id: string, ancestorNames: readonly string[]) => {
    const node = model.nodes[id];
    const aggregate = model.aggregates[id];
    if (!node || !aggregate) return;

    rows.push({
      id,
      name: node.name,
      path: ancestorNames.join(PATH_SEPARATOR),
      depth: node.depth,
      levelName: (LEVEL_LABELS[node.depth] ?? FALLBACK_LEVEL_LABEL).name,
      order: rows.length,
      totalHeadcount: aggregate.totalHeadcount,
      totalBudget: aggregate.totalBudget,
      avgPerformance: aggregate.avgPerformance,
    });

    const childAncestors = [...ancestorNames, node.name];
    for (const childId of model.childrenIds[id] ?? []) visit(childId, childAncestors);
  };

  for (const id of model.rootIds) visit(id, []);
  return rows;
};
