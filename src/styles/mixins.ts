import { css, keyframes } from 'styled-components';

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const tabularNums = css`
  font-variant-numeric: tabular-nums;
`;

// Header rows stacked inside a panel card share spacing and the divider.
export const panelBar = css`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(3)} ${({ theme }) => theme.space(4)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const shimmer = keyframes`
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
`;

// A viewport-fixed gradient makes all placeholder bars shimmer as one wave.
export const skeletonFill = css`
  flex: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.skeleton} 35%,
      ${({ theme }) => theme.colors.skeletonHighlight} 50%,
      ${({ theme }) => theme.colors.skeleton} 65%
    )
    fixed;
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s linear infinite;
`;
