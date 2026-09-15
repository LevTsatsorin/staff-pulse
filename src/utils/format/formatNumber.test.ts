import { describe, expect, it } from 'vitest';

import { formatMoney, formatNumber } from './formatNumber';

const NBSP = ' ';

describe('formatNumber', () => {
  it('should group thousands with non-breaking spaces', () => {
    const result = formatNumber(12345678);

    expect(result).toBe(`12${NBSP}345${NBSP}678`);
  });

  it('should round fractions to an integer', () => {
    expect(formatNumber(1234567.6)).toBe(`1${NBSP}234${NBSP}568`);
  });
});

describe('formatMoney', () => {
  it('should append the currency after a non-breaking space', () => {
    const result = formatMoney(12345678);

    expect(result).toBe(`12${NBSP}345${NBSP}678${NBSP}руб.`);
  });

  it('should format zero', () => {
    expect(formatMoney(0)).toBe(`0${NBSP}руб.`);
  });
});
