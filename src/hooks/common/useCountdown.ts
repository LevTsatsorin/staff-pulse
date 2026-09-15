import { useEffect, useState } from 'react';

const TICK_MS = 1_000;

// Whole seconds left until the target timestamp; ticks only while a target is set.
export const useCountdown = (targetMs: number | null): number => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (targetMs === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [targetMs]);

  return targetMs === null ? 0 : Math.max(0, Math.ceil((targetMs - now) / TICK_MS));
};
