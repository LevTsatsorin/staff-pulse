import type React from 'react';

import styled from 'styled-components';

import { StateMessage } from 'src/components/common/StateMessage/StateMessage';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <StateMessage
    icon={
      <Illustration aria-hidden="true">
        <span />
        <span />
        <span />
      </Illustration>
    }
    title={title}
    description={description}
    action={action}
  />
);

const Illustration = styled.div`
  display: grid;
  gap: 4px;
  width: 48px;
  margin-bottom: ${({ theme }) => theme.space(2)};

  span {
    height: 8px;
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.skeleton};
  }

  span:nth-child(2) {
    width: 70%;
    margin-left: 15%;
  }

  span:nth-child(3) {
    width: 40%;
    margin-left: 30%;
  }
`;
