import type React from 'react';

import styled from 'styled-components';

import { focusRing } from 'src/styles/mixins';
import type { FilterChip, FilterCondition } from 'src/utils/table/structuredFilter';

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (condition: FilterCondition) => void;
  onClear: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ chips, onRemove, onClear }) => (
  <Row aria-label="Условия AI-фильтра">
    <Caption>AI-фильтр:</Caption>
    {chips.map(chip => (
      <Chip
        key={chip.condition}
        type="button"
        aria-label={`Убрать условие «${chip.label}»`}
        onClick={() => onRemove(chip.condition)}
      >
        {chip.label}
        <Cross aria-hidden="true" />
      </Chip>
    ))}
    <ClearAll type="button" onClick={onClear}>
      Сбросить
    </ClearAll>
  </Row>
);

const Row = styled.div`
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(4)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceHover};
`;

const Caption = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 8px 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: 12px;
  cursor: pointer;
  ${focusRing}

  &:hover {
    filter: brightness(0.97);
  }
`;

const Cross = styled.span`
  position: relative;
  width: 10px;
  height: 10px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 10px;
    height: 1.5px;
    background: currentColor;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }
`;

const ClearAll = styled.button`
  margin-left: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  cursor: pointer;
  ${focusRing}
`;
