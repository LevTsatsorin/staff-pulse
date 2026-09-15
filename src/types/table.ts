import type { ValueOf } from 'src/types/helpers';

export const SortDirection = { Asc: 'asc', Desc: 'desc' } as const;
export type SortDirection = ValueOf<typeof SortDirection>;

export const SortKey = {
  Name: 'name',
  Level: 'level',
  Headcount: 'totalHeadcount',
  Budget: 'totalBudget',
  Performance: 'avgPerformance',
} as const;
export type SortKey = ValueOf<typeof SortKey>;

export type SortState = { key: SortKey; direction: SortDirection };

// 'click' selects a column, 'reverse' comes from a double click or keyboard activation
export type SortTrigger = 'click' | 'reverse';

export type TableRow = {
  id: string;
  name: string;
  path: string;
  depth: number;
  levelName: string;
  order: number;
  totalHeadcount: number;
  totalBudget: number;
  avgPerformance: number | null;
};
