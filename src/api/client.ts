import { ApiError } from 'src/errors/ApiError';

type JsonResponse = { body: unknown; etag: string | null };
type JsonRequestOptions = { signal?: AbortSignal; body?: unknown };

// A body turns the request into a JSON POST.
export const fetchJson = async (
  url: string,
  { signal, body }: JsonRequestOptions = {},
): Promise<JsonResponse> => {
  const response = await fetch(url, {
    signal,
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status);
  return { body: await response.json(), etag: response.headers.get('etag') };
};
