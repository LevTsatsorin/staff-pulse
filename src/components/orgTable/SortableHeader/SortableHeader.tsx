import type React from 'react';

import styled from 'styled-components';

import type { ColumnAlign, TableColumn } from 'src/constants/table';
import { focusRing } from 'src/styles/mixins';
import type { SortKey, SortState, SortTrigger } from 'src/types/table';

interface SortableHeaderProps {
  column: TableColumn;
  sort: SortState | null;
  onSort: (key: SortKey, trigger: SortTrigger) => void;
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

export const SortableHeader: React.FC<SortableHeaderProps> = ({ column, sort, onSort }) => {
  const direction = sort?.key === column.key ? sort.direction : null;

  // Enter/Space fire a click with detail 0; keyboard users cannot double click, so it reverses.
  const handleClick = (event: React.MouseEvent) =>
    onSort(column.key, event.detail === 0 ? 'reverse' : 'click');
  const handleDoubleClick = () => onSort(column.key, 'reverse');

  return (
    <Th scope="col" aria-sort={direction ? ARIA_SORT[direction] : 'none'} $align={column.align}>
      <HeaderButton
        type="button"
        $align={column.align}
        title="Клик — сортировать, двойной клик — обратный порядок"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {column.label}
        <SortIcon aria-hidden="true" data-direction={direction ?? 'none'} />
      </HeaderButton>
    </Th>
  );
};

const Th = styled.th<{ $align: ColumnAlign }>`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: ${({ $align }) => $align};
  vertical-align: bottom;
  user-select: none;

  &[aria-sort='ascending'],
  &[aria-sort='descending'] {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const HeaderButton = styled.button<{ $align: ColumnAlign }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'end' ? 'flex-end' : 'flex-start')};
  gap: 6px;
  width: 100%;
  min-height: 40px;
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  text-align: inherit;
  text-wrap: balance;
  cursor: pointer;
  user-select: none;
  ${focusRing}

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:hover [data-direction='none']::before {
    opacity: 0.4;
  }
`;

const SortIcon = styled.span`
  flex: none;
  width: 8px;
  height: 8px;

  &::before {
    content: '';
    display: block;
    width: 5px;
    height: 5px;
    margin: 1px auto 0;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg);
    transition: transform 150ms ease;
  }

  &[data-direction='none']::before {
    opacity: 0;
  }

  &[data-direction='asc']::before {
    margin-top: 3px;
    transform: rotate(-135deg);
  }
`;
