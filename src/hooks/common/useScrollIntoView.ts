import { type RefObject, useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// delayMs lets an expanding ancestor finish its height animation before measuring the target.
export const useScrollIntoView = (
  ref: RefObject<HTMLElement | null>,
  isActive: boolean,
  delayMs = 0,
) => {
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth';
      ref.current?.scrollIntoView({ block: 'nearest', behavior });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [ref, isActive, delayMs]);
};
