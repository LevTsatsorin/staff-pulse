import { describe, expect, it } from 'vitest';

import { getBackoffDelay } from './getBackoffDelay';

const MAX_JITTER = () => 1;
const MIN_JITTER = () => 0;

describe('getBackoffDelay', () => {
  it('should double the delay with every attempt', () => {
    const delays = [0, 1, 2, 3, 4].map(attempt => getBackoffDelay(attempt, MAX_JITTER));

    expect(delays).toEqual([1_000, 2_000, 4_000, 8_000, 16_000]);
  });

  it('should cap the delay at 30 seconds', () => {
    expect(getBackoffDelay(5, MAX_JITTER)).toBe(30_000);
    expect(getBackoffDelay(50, MAX_JITTER)).toBe(30_000);
  });

  it('should apply jitter down to half of the step', () => {
    expect(getBackoffDelay(3, MIN_JITTER)).toBe(4_000);
    expect(getBackoffDelay(3, () => 0.5)).toBe(6_000);
  });
});
