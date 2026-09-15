import { ApiError } from 'src/errors/ApiError';

type JsonResponse = { body: unknown; etag: string | null };

export const fetchJson = async (url: string, signal?: AbortSignal): Promise<JsonResponse> => {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new ApiError(response.status);
  return { body: await response.json(), etag: response.headers.get('etag') };
};
