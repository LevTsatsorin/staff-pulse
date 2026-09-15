import { describe, expect, it } from 'vitest';

import { makeTableRow as row } from 'src/testing/orgFixtures';

import type { StructuredFilter } from 'shared/search';

import { applyStructuredFilter, getFilterChips, withoutCondition } from './structuredFilter';

const EMPTY: StructuredFilter = {
  text: null,
  levels: null,
  headcount: null,
  budget: null,
  performance: null,
  sort: null,
};

const ROWS = [
  row('div', { name: 'Коммерция', depth: 0, totalHeadcount: 120, avgPerformance: 70 }),
  row('dep', { name: 'Продажи', depth: 1, totalHeadcount: 40, avgPerformance: 50 }),
  row('team-low', { name: 'SMB', depth: 2, totalHeadcount: 7, avgPerformance: 40 }),
  row('team-high', { name: 'Enterprise', depth: 2, totalHeadcount: 12, avgPerformance: 90 }),
  row('team-empty', { name: 'Новая команда', depth: 2, totalHeadcount: 0, avgPerformance: null }),
];

const ids = (rows: readonly { id: string }[]) => rows.map(r => r.id);

describe('applyStructuredFilter', () => {
  it('should return the same rows without a filter or without conditions', () => {
    expect(applyStructuredFilter(ROWS, null)).toBe(ROWS);
    expect(applyStructuredFilter(ROWS, EMPTY)).toBe(ROWS);
  });

  it('should combine level and an inclusive performance range', () => {
    const filter = { ...EMPTY, levels: [3], performance: { min: null, max: 49.999 } };

    const result = applyStructuredFilter(ROWS, filter);

    expect(ids(result)).toEqual(['team-low']);
  });

  it('should include range bounds and exclude rows with an empty average', () => {
    const filter = { ...EMPTY, performance: { min: 50, max: 90 } };

    expect(ids(applyStructuredFilter(ROWS, filter))).toEqual(['div', 'dep', 'team-high']);
  });

  it('should match text case-insensitively like the name filter', () => {
    const filter = { ...EMPTY, text: 'продаж' };

    expect(ids(applyStructuredFilter(ROWS, filter))).toEqual(['dep']);
  });

  it('should ignore an empty levels list and ranges without bounds', () => {
    const filter = { ...EMPTY, levels: [], headcount: { min: null, max: null } };

    expect(applyStructuredFilter(ROWS, filter)).toBe(ROWS);
  });
});

describe('getFilterChips', () => {
  it('should describe levels and a performance limit like the spec example', () => {
    const filter = { ...EMPTY, levels: [3], performance: { min: null, max: 49.999999 } };

    expect(getFilterChips(filter).map(chip => chip.label)).toEqual([
      'Уровень: команда',
      'Эффективность ≤ 50',
    ]);
  });

  it('should format both bounds and money ranges', () => {
    const filter = {
      ...EMPTY,
      headcount: { min: 10, max: 30 },
      budget: { min: 5_000_000, max: null },
    };

    expect(getFilterChips(filter).map(chip => chip.label)).toEqual([
      'Сотрудники 10–30',
      'Бюджет ≥ 5 000 000 руб.',
    ]);
  });
});

describe('withoutCondition', () => {
  it('should drop one condition and keep the others', () => {
    const filter = { ...EMPTY, text: 'продаж', levels: [2] };

    expect(withoutCondition(filter, 'text')).toEqual({ ...EMPTY, levels: [2] });
  });

  it('should return null when the last condition is removed', () => {
    expect(withoutCondition({ ...EMPTY, levels: [1] }, 'levels')).toBeNull();
  });
});
