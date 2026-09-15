import { RECONNECT_BASE_DELAY_MS, RECONNECT_MAX_DELAY_MS } from 'src/constants/live';

// Exponential backoff with jitter in [50%, 100%] of the step, so clients do not reconnect in sync.
export const getBackoffDelay = (attempt: number, random: () => number = Math.random): number => {
  const step = Math.min(RECONNECT_MAX_DELAY_MS, RECONNECT_BASE_DELAY_MS * 2 ** attempt);
  return Math.round(step * (0.5 + random() / 2));
};
