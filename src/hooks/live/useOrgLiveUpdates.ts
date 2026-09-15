import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { ORG_TREE_QUERY_KEY } from 'src/constants/cache';
import type { LiveConnection } from 'src/types/live';
import type { OrgModel } from 'src/types/orgModel';
import { getBackoffDelay } from 'src/utils/live/getBackoffDelay';
import { resolveLiveMessage } from 'src/utils/live/resolveLiveMessage';

import { API_PATHS } from 'shared/api';
import { liveMessageSchema } from 'shared/live';

const getLiveUrl = () =>
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${API_PATHS.live}`;

const parseJson = (data: unknown): unknown => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : undefined;
  } catch {
    return undefined;
  }
};

export const useOrgLiveUpdates = (): LiveConnection => {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<LiveConnection>({
    status: 'connecting',
    retryAt: null,
  });

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    // StrictMode runs this effect twice in dev: a late close event of the discarded socket
    // must not schedule a reconnect, otherwise every patch would be applied twice.
    let isDisposed = false;

    const handleMessage = (event: MessageEvent) => {
      const message = liveMessageSchema.safeParse(parseJson(event.data));
      if (!message.success) return;

      const model = queryClient.getQueryData<OrgModel>(ORG_TREE_QUERY_KEY);
      const decision = resolveLiveMessage(model, message.data);

      if (decision.type === 'apply') queryClient.setQueryData(ORG_TREE_QUERY_KEY, decision.model);
      if (decision.type === 'refetch') {
        // cancelRefetch: false keeps an in-flight snapshot request instead of restarting it.
        void queryClient.invalidateQueries(
          { queryKey: ORG_TREE_QUERY_KEY },
          { cancelRefetch: false },
        );
      }
    };

    const connect = () => {
      clearTimeout(retryTimer);
      if (isDisposed || socket?.readyState === WebSocket.OPEN) return;
      socket?.close();

      const current = new WebSocket(getLiveUrl());
      socket = current;
      current.onmessage = handleMessage;

      current.onopen = () => {
        attempt = 0;
        setConnection({ status: 'live', retryAt: null });
      };

      current.onclose = () => {
        if (isDisposed || socket !== current) return;
        if (!navigator.onLine) {
          setConnection({ status: 'offline', retryAt: null });
          return;
        }

        const delay = getBackoffDelay(attempt);
        attempt += 1;
        setConnection({ status: 'reconnecting', retryAt: Date.now() + delay });
        retryTimer = setTimeout(connect, delay);
      };
    };

    const handleOnline = () => {
      attempt = 0;
      connect();
    };

    const handleOffline = () => {
      clearTimeout(retryTimer);
      setConnection({ status: 'offline', retryAt: null });
      socket?.close();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Deferred so the StrictMode test unmount cancels the timer before any socket exists.
    retryTimer = setTimeout(connect, 0);

    return () => {
      isDisposed = true;
      clearTimeout(retryTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket?.close();
    };
  }, [queryClient]);

  return connection;
};
