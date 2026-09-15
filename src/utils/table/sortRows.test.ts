import { describe, expect, it } from 'vitest';

import { makeTableRow as row } from 'src/testing/orgFixtures';

import { sortRows } from './sortRows';

const ROWS = [
  row('a', { order: 0, name: 'Продукт', depth: 0, totalBudget: 300, avgPerformance: 70 }),
  row('b', { order: 1, name: 'аналитика', depth: 1, totalBudget: 100, avgPerformance: null }),
  row('c', { order: 2, name: 'Web', depth: 2, totalBudget: 300, avgPerformance: 90 }),
  row('d', { order: 3, name: 'Бухгалтерия', depth: 1, totalBudget: 200, avgPerformance: 40 }),
];

const ids = (rows: readonly { id: string }[]) => rows.map(r => r.id);

describe('sortRows', () => {
  it('should keep the original array when no sort is active', () => {
    expect(sortRows(ROWS, null)).toBe(ROWS);
  });

  it('should sort names with the ru collator ignoring case', () => {
    const result = sortRows(ROWS, { key: 'name', direction: 'asc' });

    expect(ids(result)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('should sort numbers descending and break ties by tree order', () => {
    const result = sortRows(ROWS, { key: 'totalBudget', direction: 'desc' });

    expect(ids(result)).toEqual(['a', 'c', 'd', 'b']);
  });

  it('should keep tree order for ties when ascending as well', () => {
    const result = sortRows(ROWS, { key: 'level', direction: 'asc' });

    expect(ids(result)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('should put empty averages last in both directions', () => {
    const asc = sortRows(ROWS, { key: 'avgPerformance', direction: 'asc' });
    const desc = sortRows(ROWS, { key: 'avgPerformance', direction: 'desc' });

    expect(ids(asc)).toEqual(['d', 'a', 'c', 'b']);
    expect(ids(desc)).toEqual(['c', 'a', 'd', 'b']);
  });

  it('should not mutate the input', () => {
    const snapshot = ids(ROWS);

    sortRows(ROWS, { key: 'name', direction: 'desc' });

    expect(ids(ROWS)).toEqual(snapshot);
  });
});
