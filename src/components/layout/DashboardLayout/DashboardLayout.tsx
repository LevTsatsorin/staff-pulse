import type React from 'react';

import styled from 'styled-components';

interface DashboardLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ header, children }) => (
  <Shell>
    {header}
    <Main>{children}</Main>
  </Shell>
);

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Main = styled.main`
  display: grid;
  flex: 1;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;
  padding: ${({ theme }) => theme.space(5)};
`;
