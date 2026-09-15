import type React from 'react';

import styled from 'styled-components';

import { SPLIT_VIEW_MIN_WIDTH_PX } from 'src/constants/ui';
import { ViewMode } from 'src/types/view';

interface SplitViewProps {
  view: ViewMode;
  tree: React.ReactNode;
  table: React.ReactNode;
}

// Narrow screens hide the inactive slot with CSS; both slots stay mounted so their state survives.
// min-width: 0 on the grid and slots lets wide content scroll inside a panel instead of overflowing it.
export const SplitView: React.FC<SplitViewProps> = ({ view, tree, table }) => (
  <Split data-view={view}>
    <Slot data-slot={ViewMode.Tree}>{tree}</Slot>
    <Slot data-slot={ViewMode.Table}>{table}</Slot>
  </Split>
);

const Split = styled.div`
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  gap: ${({ theme }) => theme.space(5)};
  min-width: 0;
  min-height: 0;

  @media (width < ${SPLIT_VIEW_MIN_WIDTH_PX}px) {
    &[data-view='tree'] > [data-slot='table'],
    &[data-view='table'] > [data-slot='tree'] {
      display: none;
    }
  }

  @media (width >= ${SPLIT_VIEW_MIN_WIDTH_PX}px) {
    grid-template-columns: minmax(340px, 2fr) minmax(0, 3fr);
  }
`;

const Slot = styled.div`
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
`;
