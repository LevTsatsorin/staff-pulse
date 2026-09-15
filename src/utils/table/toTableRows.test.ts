import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';
import { buildOrgModel } from 'src/utils/tree/buildOrgModel';

import { toTableRows } from './toTableRows';

describe('toTableRows', () => {
  it('should return no rows for an empty model', () => {
    expect(toTableRows(buildOrgModel([]))).toEqual([]);
  });

  it('should list nodes in tree pre-order with parent path and level', () => {
    const model = buildOrgModel([
      dto('div', null, { name: 'Коммерция' }),
      dto('div2', null, { name: 'Продукт' }),
      dto('dep', 'div', { name: 'Продажи' }),
      dto('team', 'dep', { name: 'SMB' }),
    ]);

    const rows = toTableRows(model);

    expect(rows.map(row => row.id)).toEqual(['div', 'dep', 'team', 'div2']);
    expect(rows.map(row => row.order)).toEqual([0, 1, 2, 3]);
    expect(rows[2]).toMatchObject({ path: 'Коммерция · Продажи', depth: 2, levelName: 'Команда' });
    expect(rows[0]).toMatchObject({ path: '', levelName: 'Дивизион' });
  });

  it('should fall back to a generic level name below the third level', () => {
    const model = buildOrgModel([dto('a', null), dto('b', 'a'), dto('c', 'b'), dto('d', 'c')]);

    const rows = toTableRows(model);

    expect(rows[3]?.levelName).toBe('Подразделение');
  });

  it('should take totals from model aggregates instead of recomputing them', () => {
    const model = buildOrgModel([dto('root', null, { headcount: 5 })]);
    const tampered = {
      ...model,
      aggregates: {
        root: { totalHeadcount: 999, totalBudget: 7, perfWeightedSum: 0, avgPerformance: null },
      },
    };

    const [row] = toTableRows(tampered);

    expect(row).toMatchObject({ totalHeadcount: 999, totalBudget: 7, avgPerformance: null });
  });
});
