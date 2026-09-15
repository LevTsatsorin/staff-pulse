import type React from 'react';
import { memo, useRef } from 'react';

import styled, { css } from 'styled-components';

import { FlashValue, HighlightedText, PerformanceIndicator } from 'src/components/common';
import { useScrollIntoView } from 'src/hooks/common';
import { tabularNums } from 'src/styles/mixins';
import type { TableRow } from 'src/types/table';
import { formatMoney, formatNumber } from 'src/utils/format/formatNumber';
import { isSameRow } from 'src/utils/table/isSameRow';

interface OrgTableRowProps {
  row: TableRow;
  query: string;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (id: string) => void;
  onFocusRow: (id: string) => void;
}

// Level chips reuse the tree indent colors; deeper levels share the last color.
const TINTED_LEVELS = 4;

const OrgTableRowBase: React.FC<OrgTableRowProps> = ({
  row,
  query,
  isSelected,
  isActive,
  onSelect,
  onFocusRow,
}) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  useScrollIntoView(rowRef, isSelected);

  return (
    <Tr
      ref={rowRef}
      data-row-id={row.id}
      tabIndex={isActive ? 0 : -1}
      $selected={isSelected}
      onClick={() => onSelect(row.id)}
      onFocus={() => onFocusRow(row.id)}
    >
      <Td>
        <Name>
          <HighlightedText text={row.name} query={query} />
        </Name>
        {row.path && <Path>{row.path}</Path>}
      </Td>
      <Td>
        <Level data-level={Math.min(row.depth + 1, TINTED_LEVELS)}>
          <LevelNumber>{row.depth + 1}</LevelNumber>
          {row.levelName}
        </Level>
      </Td>
      <NumericTd>
        <FlashValue value={row.totalHeadcount}>{formatNumber(row.totalHeadcount)}</FlashValue>
      </NumericTd>
      <NumericTd>
        <FlashValue value={row.totalBudget}>{formatMoney(row.totalBudget)}</FlashValue>
      </NumericTd>
      <NumericTd>
        <FlashValue value={row.avgPerformance}>
          <PerformanceIndicator value={row.avgPerformance} />
        </FlashValue>
      </NumericTd>
    </Tr>
  );
};

// Rows are rebuilt for every model, so memo compares row fields instead of the object reference:
// a live patch re-renders only the rows of the changed node and its ancestors.
const areRowPropsEqual = (prev: OrgTableRowProps, next: OrgTableRowProps) =>
  prev.query === next.query &&
  prev.isSelected === next.isSelected &&
  prev.isActive === next.isActive &&
  prev.onSelect === next.onSelect &&
  prev.onFocusRow === next.onFocusRow &&
  isSameRow(prev.row, next.row);

export const OrgTableRow = memo(OrgTableRowBase, areRowPropsEqual);

const Tr = styled.tr<{ $selected: boolean }>`
  cursor: pointer;
  scroll-margin-top: 44px;

  & > td {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.accentSoft : 'transparent')};
    transition: background 120ms ease;
  }

  & > td:first-child {
    box-shadow: ${({ theme, $selected }) => ($selected ? `inset 3px 0 ${theme.colors.accent}` : 'none')};
  }

  &:hover > td {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.accentSoft : theme.colors.surfaceHover)};
  }

  &:focus {
    outline: none;
  }

  &:focus-visible > td {
    box-shadow:
      inset 0 2px ${({ theme }) => theme.colors.accent},
      inset 0 -2px ${({ theme }) => theme.colors.accent};
  }

  &:focus-visible > td:first-child {
    box-shadow:
      inset 2px 2px ${({ theme }) => theme.colors.accent},
      inset 0 -2px ${({ theme }) => theme.colors.accent};
  }

  &:focus-visible > td:last-child {
    box-shadow:
      inset -2px 2px ${({ theme }) => theme.colors.accent},
      inset 0 -2px ${({ theme }) => theme.colors.accent};
  }
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`;

const NumericTd = styled(Td)`
  text-align: right;
  white-space: nowrap;
  ${tabularNums}
`;

const Name = styled.div`
  font-weight: 500;
`;

const Path = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const Level = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;

  ${Array.from(
    { length: TINTED_LEVELS },
    (_, index) => css`
      &[data-level='${index + 1}'] > span {
        border-color: var(--color-indent-${index + 1});
        background: var(--color-indent-${index + 1}-band);
      }
    `,
  )}
`;

const LevelNumber = styled.span`
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid transparent;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.text};
  font-size: 11px;
  font-weight: 600;
  ${tabularNums}
`;
