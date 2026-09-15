import { describe, expect, it } from 'vitest';

import type { OrgNode } from 'src/types/orgModel';

import { aggregateNode, computeAggregates } from './aggregate';

const node = (id: string, headcount: number, performance: number, budget = 100): OrgNode => ({
  id,
  name: id,
  parentId: null,
  depth: 0,
  headcount,
  budget,
  performance,
  updatedAt: '2026-09-01T00:00:00.000Z',
});

describe('aggregateNode', () => {
  it('should equal own values for a leaf', () => {
    const result = aggregateNode(node('leaf', 10, 70, 500), []);

    expect(result).toEqual({
      totalHeadcount: 10,
      totalBudget: 500,
      perfWeightedSum: 700,
      avgPerformance: 70,
    });
  });

  it('should weight the average by headcount across own and children', () => {
    const children = [aggregateNode(node('t1', 10, 60), []), aggregateNode(node('t2', 10, 80), [])];

    const result = aggregateNode(node('dep', 5, 100, 1000), children);

    expect(result.totalHeadcount).toBe(25);
    expect(result.totalBudget).toBe(1200);
    expect(result.avgPerformance).toBe(76);
  });

  it('should return null average when total headcount is zero', () => {
    const result = aggregateNode(node('empty', 0, 90), [aggregateNode(node('child', 0, 10), [])]);

    expect(result.totalHeadcount).toBe(0);
    expect(result.avgPerformance).toBeNull();
  });
});

describe('computeAggregates', () => {
  it('should return an empty map for an empty forest', () => {
    expect(computeAggregates({}, {}, [])).toEqual({});
  });

  it('should aggregate three levels and keep sibling roots independent', () => {
    const nodes = {
      a: node('a', 1, 50),
      a1: node('a1', 2, 50),
      a11: node('a11', 4, 100),
      b: node('b', 3, 20),
    };
    const childrenIds = { a: ['a1'], a1: ['a11'] };

    const result = computeAggregates(nodes, childrenIds, ['a', 'b']);

    expect(result.a?.totalHeadcount).toBe(7);
    expect(result.a?.avgPerformance).toBeCloseTo((50 + 100 + 400) / 7);
    expect(result.a1?.totalHeadcount).toBe(6);
    expect(result.b).toEqual({
      totalHeadcount: 3,
      totalBudget: 100,
      perfWeightedSum: 60,
      avgPerformance: 20,
    });
  });
});
