import type React from 'react';

import styled from 'styled-components';

import { Button } from 'src/components/common/Button/Button';
import { StateMessage } from 'src/components/common/StateMessage/StateMessage';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, isRetrying = false }) => (
  <StateMessage
    role="alert"
    icon={<Icon aria-hidden="true">!</Icon>}
    title="Не удалось загрузить данные"
    description={message}
    action={
      onRetry && (
        <Button type="button" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? 'Повторяем…' : 'Повторить'}
        </Button>
      )
    }
  />
);

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
