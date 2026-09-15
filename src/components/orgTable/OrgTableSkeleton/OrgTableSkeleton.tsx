import type React from 'react';

import styled from 'styled-components';

import { TABLE_COLUMNS, TABLE_MIN_WIDTH_PX } from 'src/constants/table';
import { panelBar, skeletonFill } from 'src/styles/mixins';

// Tree pre-order like the real unsorted table: division, department, its teams.
const DEPTH_PATTERN = [0, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2];
const ROWS = DEPTH_PATTERN.map((depth, index) => ({
  id: `table-skeleton-${index}`,
  depth,
  variant: index % 3,
}));

export const OrgTableSkeleton: React.FC = () => (
  <Wrapper aria-busy="true" aria-label="Загрузка таблицы">
    <Toolbar aria-hidden="true">
      <Search />
      <Counter />
    </Toolbar>
    <Grid aria-hidden="true">
      {TABLE_COLUMNS.map(column => (
        <HeaderCell key={column.key} data-align={column.align}>
          <HeaderLabel />
        </HeaderCell>
      ))}
      {ROWS.map(row => (
        <Row key={row.id}>
          <Cell>
            <Stack>
              <Name data-variant={row.variant} />
              {row.depth > 0 && <Path data-variant={row.variant} />}
            </Stack>
          </Cell>
          <Cell>
            <LevelDot />
            <LevelLabel />
          </Cell>
          <Cell data-align="end">
            <Short />
          </Cell>
          <Cell data-align="end">
            <Long />
          </Cell>
          <Cell data-align="end">
            <Badge />
          </Cell>
        </Row>
      ))}
    </Grid>
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Toolbar = styled.div`
  ${panelBar}
  flex: none;
`;

const Search = styled.span`
  ${skeletonFill}
  flex: 1;
  max-width: 360px;
  height: 32px;
`;

const Counter = styled.span`
  ${skeletonFill}
  width: 44px;
  height: 10px;
  margin-left: auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${TABLE_COLUMNS.map(column => column.width ?? 'minmax(0, 1fr)').join(' ')};
  min-width: ${TABLE_MIN_WIDTH_PX}px;
`;

// Rows are transparent to the grid, so their cells line up with the header cells.
const Row = styled.div`
  display: contents;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &[data-align='end'] {
    justify-content: flex-end;
  }
`;

const HeaderCell = styled(Cell)`
  min-height: 40px;
`;

const HeaderLabel = styled.span`
  ${skeletonFill}
  width: 72px;
  height: 10px;
`;

const Stack = styled.span`
  display: grid;
  gap: 6px;
  width: 100%;
`;

const Name = styled.span`
  ${skeletonFill}
  height: 11px;

  &[data-variant='0'] {
    width: 58%;
  }

  &[data-variant='1'] {
    width: 42%;
  }

  &[data-variant='2'] {
    width: 66%;
  }
`;

const Path = styled.span`
  ${skeletonFill}
  height: 8px;
  opacity: 0.7;

  &[data-variant='0'] {
    width: 36%;
  }

  &[data-variant='1'] {
    width: 48%;
  }

  &[data-variant='2'] {
    width: 30%;
  }
`;

const LevelDot = styled.span`
  ${skeletonFill}
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const LevelLabel = styled.span`
  ${skeletonFill}
  width: 52px;
  height: 10px;
`;

const Short = styled.span`
  ${skeletonFill}
  width: 32px;
  height: 10px;
`;

const Long = styled.span`
  ${skeletonFill}
  width: 104px;
  height: 10px;
`;

const Badge = styled.span`
  ${skeletonFill}
  width: 56px;
  height: 20px;
  border-radius: 999px;
`;
