import { css } from 'styled-components';

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const tabularNums = css`
  font-variant-numeric: tabular-nums;
`;
