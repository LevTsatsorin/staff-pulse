import { describe, expect, it } from 'vitest';

import { getPerformanceTone } from './getPerformanceTone';

describe('getPerformanceTone', () => {
  it('should map values below the mid threshold to low', () => {
    expect(getPerformanceTone(0)).toBe('low');
    expect(getPerformanceTone(49)).toBe('low');
  });

  it('should include the threshold value in the upper tone', () => {
    expect(getPerformanceTone(50)).toBe('mid');
    expect(getPerformanceTone(80)).toBe('high');
  });

  it('should map values just below the high threshold to mid', () => {
    expect(getPerformanceTone(79)).toBe('mid');
    expect(getPerformanceTone(79.9)).toBe('mid');
  });

  it('should map the maximum to high', () => {
    expect(getPerformanceTone(100)).toBe('high');
  });
});
