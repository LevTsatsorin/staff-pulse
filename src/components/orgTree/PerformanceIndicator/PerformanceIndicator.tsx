import type React from 'react';

import styled from 'styled-components';

import { tabularNums } from 'src/styles/mixins';
import { getPerformanceTone, type PerformanceTone } from 'src/utils/getPerformanceTone';

interface PerformanceIndicatorProps {
  value: number | null;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ value }) => {
  if (value === null) {
    return (
      <Badge $tone="none" aria-label="Эффективность не определена">
        —
      </Badge>
    );
  }
  const rounded = Math.round(value);
  return (
    <Badge $tone={getPerformanceTone(value)} aria-label={`Эффективность ${rounded}%`}>
      {rounded}%
    </Badge>
  );
};

const Badge = styled.span<{ $tone: PerformanceTone | 'none' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 56px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $tone, theme }) => ($tone === 'none' ? theme.colors.skeleton : `var(--color-tone-${$tone}-bg)`)};
  color: ${({ $tone, theme }) => ($tone === 'none' ? theme.colors.textMuted : `var(--color-tone-${$tone}-text)`)};
  ${tabularNums}

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;
