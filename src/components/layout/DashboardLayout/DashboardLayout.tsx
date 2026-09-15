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
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.space(5)};
  display: grid;
  gap: ${({ theme }) => theme.space(5)};
`;
