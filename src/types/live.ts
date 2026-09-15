export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

export type LiveConnection = { status: ConnectionStatus; retryAt: number | null };
