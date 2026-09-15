import type React from 'react';
import { memo, useRef } from 'react';

import styled, { css } from 'styled-components';

import { HighlightedText, PerformanceIndicator } from 'src/components/common';
import { useScrollIntoView } from 'src/hooks/common';
import { tabularNums } from 'src/styles/mixins';
import type { TableRow } from 'src/types/table';
import { formatMoney, formatNumber } from 'src/utils/format/formatNumber';

interface OrgTableRowProps {
  row: TableRow;
  query: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Level chips reuse the tree indent colors; deeper levels share the last color.
const TINTED_LEVELS = 4;

const OrgTableRowBase: React.FC<OrgTableRowProps> = ({ row, query, isSelected, onSelect }) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  useScrollIntoView(rowRef, isSelected);

  return (
    <Tr ref={rowRef} $selected={isSelected} onClick={() => onSelect(row.id)}>
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
      <NumericTd>{formatNumber(row.totalHeadcount)}</NumericTd>
      <NumericTd>{formatMoney(row.totalBudget)}</NumericTd>
      <NumericTd>
        <PerformanceIndicator value={row.avgPerformance} />
      </NumericTd>
    </Tr>
  );
};

export const OrgTableRow = memo(OrgTableRowBase);

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
