import type React from 'react';

import styled from 'styled-components';

import { Button } from 'src/components/common';
import { focusRing, panelBar, tabularNums } from 'src/styles/mixins';

interface OrgTableToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  isParsing: boolean;
  canParse: boolean;
  isAiUnavailable: boolean;
  notice: string | null;
  shownCount: number;
  totalCount: number;
}

// Typing filters by name in real time; Enter or the button sends the same text to AI parsing.
export const OrgTableToolbar: React.FC<OrgTableToolbarProps> = ({
  query,
  onQueryChange,
  onSubmit,
  isParsing,
  canParse,
  isAiUnavailable,
  notice,
  shownCount,
  totalCount,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Bar>
      <SearchForm role="search" onSubmit={handleSubmit}>
        <SearchField>
          <SearchInput
            type="search"
            value={query}
            enterKeyHint="search"
            placeholder="Название или запрос для AI"
            aria-label="Фильтр по названию или запрос для AI-разбора"
            onChange={event => onQueryChange(event.target.value)}
          />
          {query && (
            <ClearButton
              type="button"
              aria-label="Очистить фильтр"
              onClick={() => onQueryChange('')}
            />
          )}
        </SearchField>
        <Button
          type="submit"
          $variant="ghost"
          disabled={!canParse || isParsing || !query.trim()}
          title="Enter — разобрать запрос на естественном языке"
        >
          {isParsing ? 'Разбираю…' : 'AI-разбор'}
        </Button>
      </SearchForm>
      {isAiUnavailable && (
        <AiBadge role="status" title="Работает обычный поиск по названию">
          AI недоступен
        </AiBadge>
      )}
      {notice && <Notice role="status">{notice}</Notice>}
      <Counter aria-live="polite">
        {shownCount} из {totalCount}
      </Counter>
    </Bar>
  );
};

const Bar = styled.div`
  ${panelBar}
  flex: none;
`;

const SearchForm = styled.form`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.space(2)};
  max-width: 520px;
  margin: 0;
`;

const SearchField = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 11px;
    width: 9px;
    height: 9px;
    border: 1.5px solid ${({ theme }) => theme.colors.textMuted};
    border-radius: 50%;
    transform: translateY(-60%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 20px;
    width: 1.5px;
    height: 5px;
    background: ${({ theme }) => theme.colors.textMuted};
    transform: translateY(10%) rotate(-45deg);
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 32px 0 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  transition: border-color 120ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &::-webkit-search-cancel-button {
    appearance: none;
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    outline: none;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 6px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transform: translateY(-50%);
  ${focusRing}

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 1.5px;
    background: currentColor;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const AiBadge = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-tone-mid-bg);
  color: var(--color-tone-mid-text);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const Notice = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const Counter = styled.span`
  margin-left: auto;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  white-space: nowrap;
  ${tabularNums}
`;
