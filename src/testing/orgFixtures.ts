import type { TableRow } from 'src/types/table';

import type { OrgNodeDto } from 'shared/orgTree';

export const makeOrgNodeDto = (
  id: string,
  parentId: string | null,
  overrides: Partial<OrgNodeDto> = {},
): OrgNodeDto => ({
  id,
  name: id,
  parentId,
  headcount: 1,
  budget: 100,
  performance: 50,
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

export const makeTableRow = (id: string, overrides: Partial<TableRow> = {}): TableRow => ({
  id,
  name: id,
  path: '',
  depth: 0,
  levelName: 'Дивизион',
  order: 0,
  totalHeadcount: 10,
  totalBudget: 1000,
  avgPerformance: 50,
  ...overrides,
});
