import type React from 'react';

import styled from 'styled-components';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <Wrapper>
    <Illustration aria-hidden="true">
      <span />
      <span />
      <span />
    </Illustration>
    <Title>{title}</Title>
    {description && <Description>{description}</Description>}
    {action}
  </Wrapper>
);

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(10)} ${({ theme }) => theme.space(4)};
  text-align: center;
`;

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

const Title = styled.p`
  margin: 0;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0 0 ${({ theme }) => theme.space(2)};
  color: ${({ theme }) => theme.colors.textMuted};
`;
