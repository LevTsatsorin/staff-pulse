import type { Aggregate, OrgNode } from 'src/types/orgModel';

const EMPTY_AGGREGATE: Aggregate = {
  totalHeadcount: 0,
  totalBudget: 0,
  perfWeightedSum: 0,
  avgPerformance: null,
};

// Own values plus direct children's aggregates. Ancestors are rebuilt from children (not by delta)
// so incremental patches never drift on floating point.
export const aggregateNode = (own: OrgNode, children: readonly Aggregate[]): Aggregate => {
  const sum = children.reduce(
    (acc, child) => ({
      totalHeadcount: acc.totalHeadcount + child.totalHeadcount,
      totalBudget: acc.totalBudget + child.totalBudget,
      perfWeightedSum: acc.perfWeightedSum + child.perfWeightedSum,
    }),
    {
      totalHeadcount: own.headcount,
      totalBudget: own.budget,
      perfWeightedSum: own.performance * own.headcount,
    },
  );
  return {
    ...sum,
    avgPerformance: sum.totalHeadcount > 0 ? sum.perfWeightedSum / sum.totalHeadcount : null,
  };
};

export const computeAggregates = (
  nodes: Record<string, OrgNode>,
  childrenIds: Record<string, string[]>,
  rootIds: readonly string[],
): Record<string, Aggregate> => {
  const result: Record<string, Aggregate> = {};

  const visit = (id: string): Aggregate => {
    const node = nodes[id];
    if (!node) return EMPTY_AGGREGATE;
    const aggregate = aggregateNode(node, (childrenIds[id] ?? []).map(visit));
    result[id] = aggregate;
    return aggregate;
  };

  for (const id of rootIds) visit(id);
  return result;
};
