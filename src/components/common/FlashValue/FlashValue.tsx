import type React from 'react';
import { useState } from 'react';

import styled, { keyframes } from 'styled-components';

import { FLASH_DURATION_MS } from 'src/constants/ui';

interface FlashValueProps {
  value: number | string | null;
  children: React.ReactNode;
}

// Each real change of `value` bumps the generation; the new key remounts the span and restarts
// the CSS animation. First mounts (initial load, filter, expand) stay at generation 0 and never flash.
export const FlashValue: React.FC<FlashValueProps> = ({ value, children }) => {
  const [tracked, setTracked] = useState({ value, generation: 0 });
  if (tracked.value !== value) setTracked({ value, generation: tracked.generation + 1 });

  return (
    <Flash key={tracked.generation} data-flash={tracked.generation > 0 || undefined}>
      {children}
    </Flash>
  );
};

const fade = keyframes`
  from { background-color: var(--color-flash); }
  to { background-color: transparent; }
`;

const Flash = styled.span`
  margin: -2px -4px;
  padding: 2px 4px;
  border-radius: 4px;

  &[data-flash] {
    animation: ${fade} ${FLASH_DURATION_MS}ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-flash] {
      animation: ${fade} ${FLASH_DURATION_MS}ms steps(1, end) !important;
    }
  }
`;
