import { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { parseSearch } from 'src/api/searchParse';
import { AI_SEARCH_TIMEOUT_MS } from 'src/constants/ui';
import { ApiError } from 'src/errors/ApiError';

import type { StructuredFilter } from 'shared/search';

const NOT_CONFIGURED_STATUS = 503;

// Parsing runs on explicit submit, not per keystroke: each call is a paid model request.
export const useAiSearch = () => {
  const [isNotConfigured, setNotConfigured] = useState(false);
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (query: string) => parseSearch(query, AbortSignal.timeout(AI_SEARCH_TIMEOUT_MS)),
  });

  const submit = useCallback(
    (query: string, onParsed: (filter: StructuredFilter) => void) => {
      if (isNotConfigured) return;
      // Per-call callbacks fire only for the latest submit, so a slow earlier answer never wins.
      mutate(query, {
        onSuccess: onParsed,
        onError: error => {
          if (error instanceof ApiError && error.status === NOT_CONFIGURED_STATUS) {
            setNotConfigured(true);
          }
        },
      });
    },
    [isNotConfigured, mutate],
  );

  return {
    submit,
    isParsing: isPending,
    isAiUnavailable: isNotConfigured || isError,
    canParse: !isNotConfigured,
  };
};
