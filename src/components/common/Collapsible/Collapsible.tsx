import type React from 'react';

import styled from 'styled-components';

import { EXPAND_ANIMATION_MS } from 'src/constants/ui';

interface CollapsibleProps {
  isOpen: boolean;
  children: React.ReactNode;
}

// Animates height without measuring: grid rows go 0fr -> 1fr. Collapsed content stays mounted
// but inert, so Tab and screen readers skip it.
export const Collapsible: React.FC<CollapsibleProps> = ({ isOpen, children }) => (
  <Outer $isOpen={isOpen} inert={!isOpen}>
    <Inner>{children}</Inner>
  </Outer>
);

const Outer = styled.div<{ $isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows ${EXPAND_ANIMATION_MS}ms ease;
`;

const Inner = styled.div`
  min-height: 0;
  overflow: hidden;
`;
