import type React from 'react';

import styled from 'styled-components';

import { SPLIT_VIEW_MIN_WIDTH_PX } from 'src/constants/ui';
import { focusRing } from 'src/styles/mixins';
import { ViewMode } from 'src/types/view';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const OPTIONS = [
  { value: ViewMode.Tree, label: 'Дерево' },
  { value: ViewMode.Table, label: 'Таблица' },
] as const;

export const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange }) => (
  <Group role="group" aria-label="Представление">
    {OPTIONS.map(option => (
      <Option
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </Option>
    ))}
  </Group>
);

const Group = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.bg};

  @media (width >= ${SPLIT_VIEW_MIN_WIDTH_PX}px) {
    display: none;
  }
`;

const Option = styled.button`
  height: 28px;
  padding: 0 ${({ theme }) => theme.space(3)};
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  ${focusRing}

  &[aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;
