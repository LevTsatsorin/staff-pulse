import type React from 'react';
import { useState } from 'react';

import styled from 'styled-components';

import { Button, EmptyState } from 'src/components/common';
import { OrgTableRow } from 'src/components/orgTable/OrgTableRow/OrgTableRow';
import { OrgTableToolbar } from 'src/components/orgTable/OrgTableToolbar/OrgTableToolbar';
import { SortableHeader } from 'src/components/orgTable/SortableHeader/SortableHeader';
import { TABLE_COLUMNS } from 'src/constants/table';
import { SEARCH_DEBOUNCE_MS } from 'src/constants/ui';
import { useDebouncedValue, useSelection } from 'src/hooks/common';
import { useSortState, useTableRows } from 'src/hooks/orgTable';
import { useRevealNode } from 'src/hooks/orgTree';
import type { OrgModel } from 'src/types/orgModel';

interface OrgTableProps {
  model: OrgModel;
}

export const OrgTable: React.FC<OrgTableProps> = ({ model }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  // Typing is debounced, clearing is instant.
  const appliedQuery = query.trim() ? debouncedQuery : '';

  const { sort, changeSort } = useSortState();
  const { rows, totalCount } = useTableRows(model, appliedQuery, sort);
  const { selectedId } = useSelection();
  const revealNode = useRevealNode(model);

  return (
    <Wrapper>
      <OrgTableToolbar
        query={query}
        onQueryChange={setQuery}
        shownCount={rows.length}
        totalCount={totalCount}
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          description={`Нет подразделений, в названии которых есть «${appliedQuery.trim()}»`}
          action={
            <Button type="button" $variant="ghost" onClick={() => setQuery('')}>
              Сбросить фильтр
            </Button>
          }
        />
      ) : (
        <Scroller>
          <Table>
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
            <tbody>
              {rows.map(row => (
                <OrgTableRow
                  key={row.id}
                  row={row}
                  query={appliedQuery}
                  isSelected={row.id === selectedId}
                  onSelect={revealNode}
                />
              ))}
            </tbody>
          </Table>
        </Scroller>
      )}
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
  border-collapse: separate;
  border-spacing: 0;
`;
