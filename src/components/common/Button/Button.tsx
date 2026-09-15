import styled from 'styled-components';

import { focusRing } from 'src/styles/mixins';

export const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  height: 32px;
  padding: 0 ${({ theme }) => theme.space(3)};
  border: 1px solid ${({ theme, $variant }) => ($variant === 'ghost' ? theme.colors.border : theme.colors.accent)};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme, $variant }) => ($variant === 'ghost' ? theme.colors.surface : theme.colors.accent)};
  color: ${({ theme, $variant }) => ($variant === 'ghost' ? theme.colors.text : '#fff')};
  cursor: pointer;
  transition: filter 120ms ease;
  ${focusRing}

  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  &:disabled {
    cursor: progress;
    opacity: 0.6;
  }
`;
