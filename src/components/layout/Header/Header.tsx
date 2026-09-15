import type React from 'react';

import styled, { keyframes } from 'styled-components';

import { BUILD_VERSION } from 'src/config';

interface HeaderProps {
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isRefreshing }) => (
  <Bar>
    <Brand>
      <Title>Staff Pulse</Title>
      <Subtitle>Мониторинг орг-структуры</Subtitle>
    </Brand>
    <Status>
      {isRefreshing && (
        <Hint role="status">
          <Dot aria-hidden="true" />
          обновляется…
        </Hint>
      )}
      <Version title="Версия сборки">{BUILD_VERSION}</Version>
    </Status>
  </Bar>
);

const pulse = keyframes`
  from { opacity: 0.3; }
  to { opacity: 1; }
`;

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(4)};
  height: 56px;
  padding: 0 ${({ theme }) => theme.space(5)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const Brand = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.space(3)};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
`;

const Subtitle = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(4)};
`;

const Hint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  animation: ${pulse} 800ms ease-in-out infinite alternate;
`;

const Version = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  font-family: ui-monospace, monospace;
`;
