import { ApiValidationError } from 'src/errors/ApiValidationError';

import { API_PATHS } from 'shared/api';
import { type StructuredFilter, structuredFilterSchema } from 'shared/search';

import { fetchJson } from './client';

export const parseSearch = async (
  query: string,
  signal?: AbortSignal,
): Promise<StructuredFilter> => {
  const { body } = await fetchJson(API_PATHS.searchParse, { signal, body: { query } });
  const result = structuredFilterSchema.safeParse(body);
  if (!result.success) throw new ApiValidationError(result.error);
  return result.data;
};
