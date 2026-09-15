import type React from 'react';
import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { Button, EmptyState } from 'src/components/common';
import { FilterChips } from 'src/components/orgTable/FilterChips/FilterChips';
import { OrgTableRow } from 'src/components/orgTable/OrgTableRow/OrgTableRow';
import { OrgTableToolbar } from 'src/components/orgTable/OrgTableToolbar/OrgTableToolbar';
import { SortableHeader } from 'src/components/orgTable/SortableHeader/SortableHeader';
import { TABLE_COLUMNS, TABLE_MIN_WIDTH_PX } from 'src/constants/table';
import { SEARCH_DEBOUNCE_MS } from 'src/constants/ui';
import { useDebouncedValue, useRovingRows, useSelection } from 'src/hooks/common';
import { useAiSearch, useSortState, useTableRows } from 'src/hooks/orgTable';
import { useRevealNode } from 'src/hooks/orgTree';
import type { OrgModel } from 'src/types/orgModel';
import {
  type FilterCondition,
  getFilterChips,
  withoutCondition,
} from 'src/utils/table/structuredFilter';

import type { StructuredFilter } from 'shared/search';

interface OrgTableProps {
  model: OrgModel;
}

export const OrgTable: React.FC<OrgTableProps> = ({ model }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  // Typing is debounced, clearing is instant.
  const appliedQuery = query.trim() ? debouncedQuery : '';

  const [structuredFilter, setStructuredFilter] = useState<StructuredFilter | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const chips = useMemo(() => getFilterChips(structuredFilter), [structuredFilter]);
  const { submit, isParsing, isAiUnavailable, canParse } = useAiSearch();

  const { sort, changeSort, setSort } = useSortState();
  const { rows, totalCount } = useTableRows(model, appliedQuery, sort, structuredFilter);

  const { selectedId } = useSelection();
  const revealNode = useRevealNode(model);

  const rowIds = useMemo(() => rows.map(row => row.id), [rows]);
  const { activeId, setActiveId, containerRef, handleKeyDown } = useRovingRows(rowIds, revealNode);

  const changeQuery = (next: string) => {
    setQuery(next);
    setAiNotice(null);
  };

  const handleSubmit = () => {
    const text = query.trim();
    if (!text || isParsing) return;

    submit(text, filter => {
      if (filter.sort) setSort(filter.sort);

      // Nothing recognised: keep the typed text as a plain name filter and say so.
      const conditions = getFilterChips(filter).length > 0 ? { ...filter, sort: null } : null;
      if (!conditions && !filter.sort) {
        setAiNotice('AI не нашёл условий в запросе, работает поиск по названию');
        return;
      }

      setStructuredFilter(conditions);
      changeQuery('');
    });
  };

  const resetFilters = () => {
    changeQuery('');
    setStructuredFilter(null);
  };

  const removeCondition = (condition: FilterCondition) =>
    setStructuredFilter(prev => prev && withoutCondition(prev, condition));

  const highlightQuery = appliedQuery || structuredFilter?.text || '';
  const canSuggestAi =
    canParse && !structuredFilter && aiNotice === null && appliedQuery.trim().includes(' ');

  return (
    <Wrapper>
      <OrgTableToolbar
        query={query}
        onQueryChange={changeQuery}
        onSubmit={handleSubmit}
        isParsing={isParsing}
        canParse={canParse}
        isAiUnavailable={isAiUnavailable}
        notice={aiNotice}
        shownCount={rows.length}
        totalCount={totalCount}
      />
      {chips.length > 0 && (
        <FilterChips
          chips={chips}
          onRemove={removeCondition}
          onClear={() => setStructuredFilter(null)}
        />
      )}
      <Scroller>
        {rows.length === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            description={
              structuredFilter
                ? 'Нет подразделений, подходящих под условия фильтра'
                : `Нет подразделений, в названии которых есть «${appliedQuery.trim()}»`
            }
            action={
              <Actions>
                {canSuggestAi && (
                  <Button type="button" onClick={handleSubmit} disabled={isParsing}>
                    Разобрать запрос AI
                  </Button>
                )}
                <Button type="button" $variant="ghost" onClick={resetFilters}>
                  Сбросить фильтр
                </Button>
              </Actions>
            }
          />
        ) : (
          <Table>
            <colgroup>
              {TABLE_COLUMNS.map(column => (
                <col key={column.key} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {TABLE_COLUMNS.map(column => (
                  <SortableHeader
                    key={column.key}
                    column={column}
                    sort={sort}
                    onSort={changeSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody ref={containerRef} onKeyDown={handleKeyDown}>
              {rows.map(row => (
                <OrgTableRow
                  key={row.id}
                  row={row}
                  query={highlightQuery}
                  isSelected={row.id === selectedId}
                  isActive={row.id === activeId}
                  onSelect={revealNode}
                  onFocusRow={setActiveId}
                />
              ))}
            </tbody>
          </Table>
        )}
      </Scroller>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Scroller = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: ${TABLE_MIN_WIDTH_PX}px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;

  ${TABLE_COLUMNS.map((column, index) =>
    column.width ? `& col:nth-child(${index + 1}) { width: ${column.width}; }` : '',
  )}
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.space(2)};
`;
