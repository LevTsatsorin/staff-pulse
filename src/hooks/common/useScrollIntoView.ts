import { type RefObject, useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const useScrollIntoView = (ref: RefObject<HTMLElement | null>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;
    const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth';
    ref.current?.scrollIntoView({ block: 'nearest', behavior });
  }, [ref, isActive]);
};
