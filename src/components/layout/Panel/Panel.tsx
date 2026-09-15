import type React from 'react';

import styled from 'styled-components';

import { panelBar } from 'src/styles/mixins';

interface PanelProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, actions, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {actions}
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

const Card = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};
`;

const CardHeader = styled.div`
  ${panelBar}
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

const CardBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;
