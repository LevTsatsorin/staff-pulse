import { describe, expect, it } from 'vitest';

import { normalizeQuery, splitByMatch } from './search';

describe('normalizeQuery', () => {
  it('should trim and lowercase with the ru locale', () => {
    expect(normalizeQuery('  ПРОД ')).toBe('прод');
  });
});

describe('splitByMatch', () => {
  it('should return the whole text as one segment for a blank query', () => {
    const result = splitByMatch('Продажи', '   ');

    expect(result).toEqual([{ text: 'Продажи', isMatch: false, start: 0 }]);
  });

  it('should match case-insensitively and keep the original casing', () => {
    const result = splitByMatch('Продажи', 'прод');

    expect(result).toEqual([
      { text: 'Прод', isMatch: true, start: 0 },
      { text: 'ажи', isMatch: false, start: 4 },
    ]);
  });

  it('should mark every occurrence', () => {
    const result = splitByMatch('Web и web', 'WEB');

    expect(result).toEqual([
      { text: 'Web', isMatch: true, start: 0 },
      { text: ' и ', isMatch: false, start: 3 },
      { text: 'web', isMatch: true, start: 6 },
    ]);
  });

  it('should return one plain segment when nothing matches', () => {
    expect(splitByMatch('Дизайн', 'склад')).toEqual([{ text: 'Дизайн', isMatch: false, start: 0 }]);
  });
});
