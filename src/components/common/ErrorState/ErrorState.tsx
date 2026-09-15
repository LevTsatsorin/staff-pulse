import type React from 'react';

import styled from 'styled-components';

import { Button } from 'src/components/common/Button/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <Wrapper role="alert">
    <Icon aria-hidden="true">!</Icon>
    <Title>Не удалось загрузить данные</Title>
    <Message>{message}</Message>
    {onRetry && (
      <Button type="button" onClick={onRetry}>
        Повторить
      </Button>
    )}
  </Wrapper>
);

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(10)} ${({ theme }) => theme.space(4)};
  text-align: center;
`;

const Icon = styled.span`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-tone-low-bg);
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 700;
  font-size: 20px;
`;

const Title = styled.p`
  margin: 0;
  font-weight: 600;
`;

const Message = styled.p`
  margin: 0 0 ${({ theme }) => theme.space(2)};
  color: ${({ theme }) => theme.colors.textMuted};
`;
