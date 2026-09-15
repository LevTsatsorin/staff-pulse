import { describe, expect, it } from 'vitest';

import type { SortKey, SortState } from 'src/types/table';

import { getNextSort } from './getNextSort';

const doubleClick = (prev: SortState | null, key: SortKey) => {
  const afterFirstClick = getNextSort(prev, key, 'click');
  const afterSecondClick = getNextSort(afterFirstClick, key, 'click');
  return getNextSort(afterSecondClick, key, 'reverse');
};

describe('getNextSort', () => {
  it('should activate text and numeric columns ascending on click', () => {
    expect(getNextSort(null, 'name', 'click')).toEqual({ key: 'name', direction: 'asc' });
    expect(getNextSort(null, 'totalBudget', 'click')).toEqual({
      key: 'totalBudget',
      direction: 'asc',
    });
  });

  it('should start ascending when switching columns regardless of the previous direction', () => {
    const prev: SortState = { key: 'name', direction: 'desc' };

    expect(getNextSort(prev, 'totalHeadcount', 'click')).toEqual({
      key: 'totalHeadcount',
      direction: 'asc',
    });
  });

  it('should return the same state on click of the active column', () => {
    const prev: SortState = { key: 'level', direction: 'asc' };

    expect(getNextSort(prev, 'level', 'click')).toBe(prev);
  });

  it('should reverse the active column exactly once on a double click', () => {
    const start: SortState = { key: 'totalBudget', direction: 'desc' };

    expect(doubleClick(start, 'totalBudget')).toEqual({ key: 'totalBudget', direction: 'asc' });
  });

  it('should end descending for a double click on an inactive column of any type', () => {
    const prev: SortState = { key: 'level', direction: 'desc' };

    expect(doubleClick(prev, 'name')).toEqual({ key: 'name', direction: 'desc' });
    expect(doubleClick(prev, 'avgPerformance')).toEqual({
      key: 'avgPerformance',
      direction: 'desc',
    });
  });

  it('should activate an inactive column ascending on keyboard reverse', () => {
    expect(getNextSort(null, 'avgPerformance', 'reverse')).toEqual({
      key: 'avgPerformance',
      direction: 'asc',
    });
  });
});
