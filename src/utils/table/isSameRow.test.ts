import { describe, expect, it } from 'vitest';

import { makeTableRow as row } from 'src/testing/orgFixtures';

import { isSameRow } from './isSameRow';

describe('isSameRow', () => {
  it('should treat rows with equal fields as the same', () => {
    expect(isSameRow(row('a'), row('a'))).toBe(true);
  });

  it('should detect a changed aggregate', () => {
    expect(isSameRow(row('a'), row('a', { totalBudget: 1 }))).toBe(false);
  });

  it('should detect a change from a number to an empty average', () => {
    expect(isSameRow(row('a'), row('a', { avgPerformance: null }))).toBe(false);
  });
});
