import { PERFORMANCE_THRESHOLDS } from 'src/constants/ui';

export type PerformanceTone = 'low' | 'mid' | 'high';

export const getPerformanceTone = (value: number): PerformanceTone => {
  if (value >= PERFORMANCE_THRESHOLDS.high) return 'high';
  if (value >= PERFORMANCE_THRESHOLDS.mid) return 'mid';
  return 'low';
};
