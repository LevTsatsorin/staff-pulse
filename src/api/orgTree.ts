import { ApiValidationError } from 'src/errors/ApiValidationError';
import type { OrgModel } from 'src/types/orgModel';
import { buildOrgModel } from 'src/utils/tree/buildOrgModel';

import { API_PATHS } from 'shared/api';
import { orgTreeResponseSchema } from 'shared/orgTree';

import { fetchJson } from './client';

const parseVersion = (etag: string | null): number => Number(etag?.replaceAll('"', '')) || 0;

export const getOrgTree = async (signal?: AbortSignal): Promise<OrgModel> => {
  const { body, etag } = await fetchJson(API_PATHS.orgTree, signal);
  const result = orgTreeResponseSchema.safeParse(body);
  if (!result.success) throw new ApiValidationError(result.error);
  return buildOrgModel(result.data, parseVersion(etag));
};
