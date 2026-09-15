import type React from 'react';

import styled from 'styled-components';

import { skeletonFill } from 'src/styles/mixins';

// Mirrors the default view: every division expanded with its three departments.
const ROWS = Array.from({ length: 16 }, (_, index) => ({
  id: `tree-skeleton-${index}`,
  depth: index % 4 === 0 ? 0 : 1,
  variant: index % 3,
}));

export const OrgTreeSkeleton: React.FC = () => (
  <List aria-busy="true" aria-label="Загрузка структуры">
    {ROWS.map(row => (
      <Row key={row.id} data-depth={row.depth} aria-hidden="true">
        <Chevron />
        <Name data-variant={row.variant} />
        <Count />
        <Badge />
      </Row>
    ))}
  </List>
);

const Chevron = styled.span`
  ${skeletonFill}
  width: 10px;
  height: 10px;
  margin: 0 7px;
  border-radius: 3px;
`;

const Name = styled.span`
  ${skeletonFill}
  height: 10px;
  margin-right: auto;

  &[data-variant='0'] {
    width: 34%;
  }

  &[data-variant='1'] {
    width: 48%;
  }

  &[data-variant='2'] {
    width: 26%;
  }
`;

const Count = styled.span`
  ${skeletonFill}
  width: 40px;
  height: 10px;
`;

const Badge = styled.span`
  ${skeletonFill}
  width: 56px;
  height: 20px;
  border-radius: 999px;
`;

const List = styled.div`
  padding: ${({ theme }) => theme.space(1)};
`;

const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  height: ${({ theme }) => theme.rowHeight};
  padding: 0 ${({ theme }) => theme.space(2)};

  &[data-depth='0'] ${Name} {
    height: 12px;
  }

  &[data-depth='1'] {
    margin-left: 28px;
  }

  &[data-depth='1']::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -20px;
    border-left: 2px solid ${({ theme }) => theme.colors.skeleton};
  }
`;
