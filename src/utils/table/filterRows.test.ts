import { describe, expect, it } from 'vitest';

import { makeTableRow as row } from 'src/testing/orgFixtures';

import { filterRows } from './filterRows';

const ROWS = [
  row('1', { name: 'Продажи' }),
  row('2', { name: 'Продукт' }),
  row('3', { name: 'Маркетинг', path: 'Коммерция · Продажи' }),
];

describe('filterRows', () => {
  it('should return the same array for a blank query', () => {
    expect(filterRows(ROWS, '  ')).toBe(ROWS);
  });

  it('should match names case-insensitively', () => {
    const result = filterRows(ROWS, 'ПРОД');

    expect(result.map(r => r.id)).toEqual(['1', '2']);
  });

  it('should match by name only, not by parent path', () => {
    expect(filterRows(ROWS, 'коммерция')).toEqual([]);
  });
});
