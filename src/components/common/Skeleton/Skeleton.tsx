import type React from 'react';

import styled, { keyframes } from 'styled-components';

interface SkeletonProps {
  lines?: number;
}

const WIDTHS = ['lg', 'md', 'sm', 'md', 'lg', 'sm'] as const;
type LineWidth = (typeof WIDTHS)[number];

const buildLines = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `line-${index}`,
    width: WIDTHS[index % WIDTHS.length] ?? 'md',
  }));

export const Skeleton: React.FC<SkeletonProps> = ({ lines = 8 }) => (
  <List aria-busy="true" aria-label="Загрузка">
    {buildLines(lines).map(line => (
      <Line key={line.id} $width={line.width} />
    ))}
  </List>
);

const shimmer = keyframes`
  from { opacity: 0.55; }
  to { opacity: 1; }
`;

const WIDTH_PERCENT: Record<LineWidth, string> = { sm: '45%', md: '65%', lg: '85%' };

const List = styled.ul`
  display: grid;
  gap: 6px;
`;

const Line = styled.li<{ $width: LineWidth }>`
  height: ${({ theme }) => theme.rowHeight};
  width: ${({ $width }) => WIDTH_PERCENT[$width]};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.skeleton};
  animation: ${shimmer} 900ms ease-in-out infinite alternate;
`;
