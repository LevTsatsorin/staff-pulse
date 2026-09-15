import type React from 'react';

import styled from 'styled-components';

interface StateMessageProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  role?: 'alert' | 'status';
}

export const StateMessage: React.FC<StateMessageProps> = ({
  icon,
  title,
  description,
  action,
  role,
}) => (
  <Wrapper role={role}>
    {icon}
    <Title>{title}</Title>
    {description && <Description>{description}</Description>}
    {action}
  </Wrapper>
);

// Fills the panel body and centers the message vertically.
const Wrapper = styled.div`
  display: grid;
  align-content: center;
  justify-items: center;
  min-height: 100%;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(10)} ${({ theme }) => theme.space(4)};
  text-align: center;
`;

const Title = styled.p`
  margin: 0;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0 0 ${({ theme }) => theme.space(2)};
  color: ${({ theme }) => theme.colors.textMuted};
`;
