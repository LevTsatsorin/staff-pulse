import { useEffect, useRef } from 'react';

// Focus follows the active id only after keyboard navigation asked for it, never on mount.
export const useRovingFocus = <TContainer extends HTMLElement>(
  attribute: string,
  currentId: string | null,
) => {
  const containerRef = useRef<TContainer>(null);
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current || currentId === null) return;
    shouldFocusRef.current = false;
    containerRef.current
      ?.querySelector<HTMLElement>(`[${attribute}="${CSS.escape(currentId)}"]`)
      ?.focus();
  }, [attribute, currentId]);

  const focusOnNextRender = () => {
    shouldFocusRef.current = true;
  };

  return { containerRef, focusOnNextRender };
};
