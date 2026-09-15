import type React from 'react';

import styled, { keyframes } from 'styled-components';

import { useCountdown } from 'src/hooks/common';
import type { ConnectionStatus, LiveConnection } from 'src/types/live';

interface ConnectionBadgeProps {
  connection: LiveConnection;
}

const LABELS: Record<ConnectionStatus, string> = {
  connecting: 'подключение',
  live: 'live',
  reconnecting: 'переподключение',
  offline: 'офлайн',
};

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ connection }) => {
  const secondsLeft = useCountdown(connection.retryAt);
  const label = getLabel(connection.status, secondsLeft);

  return (
    <Badge data-status={connection.status} title="Соединение с live-обновлениями">
      <Dot aria-hidden="true" />
      {label}
    </Badge>
  );
};

// At zero the attempt is already running, so the countdown gives way to an ellipsis.
const getLabel = (status: ConnectionStatus, secondsLeft: number): string => {
  if (status !== 'reconnecting') return LABELS[status];
  return secondsLeft > 0
    ? `${LABELS.reconnecting} через ${secondsLeft} с`
    : `${LABELS.reconnecting}…`;
};

const pulse = keyframes`
  from { opacity: 0.35; }
  to { opacity: 1; }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;

  &[data-status='live'] {
    background: var(--color-tone-high-bg);
    color: var(--color-tone-high-text);
  }

  &[data-status='connecting'],
  &[data-status='reconnecting'] {
    background: var(--color-tone-mid-bg);
    color: var(--color-tone-mid-text);
  }

  &[data-status='offline'] {
    background: var(--color-tone-low-bg);
    color: var(--color-tone-low-text);
  }

  &[data-status='connecting'] ${Dot}, &[data-status='reconnecting'] ${Dot} {
    animation: ${pulse} 700ms ease-in-out infinite alternate;
  }
`;
