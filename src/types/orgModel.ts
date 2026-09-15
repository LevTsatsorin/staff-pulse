import type { OrgNodeDto } from 'shared/orgTree';

export type OrgNode = OrgNodeDto & { depth: number };

export type Aggregate = {
  totalHeadcount: number;
  totalBudget: number;
  perfWeightedSum: number;
  avgPerformance: number | null;
};

export type OrgModel = {
  nodes: Record<string, OrgNode>;
  childrenIds: Record<string, string[]>;
  rootIds: string[];
  aggregates: Record<string, Aggregate>;
  version: number;
  snapshotVersion: number;
};
