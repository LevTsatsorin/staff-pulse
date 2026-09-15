import { OrgDataError, OrgDataErrorCode } from 'src/errors/OrgDataError';
import type { OrgModel, OrgNode } from 'src/types/orgModel';

import type { OrgNodeDto } from 'shared/orgTree';

import { computeAggregates } from './aggregate';

type DtoMap = Record<string, OrgNodeDto>;

export const buildOrgModel = (dtos: readonly OrgNodeDto[], version = 0): OrgModel => {
  const byId: DtoMap = {};
  for (const dto of dtos) {
    if (byId[dto.id]) throw new OrgDataError(OrgDataErrorCode.DuplicateId, dto.id);
    byId[dto.id] = dto;
  }

  const depth: Record<string, number> = {};
  const nodes: Record<string, OrgNode> = {};
  const childrenIds: Record<string, string[]> = {};
  const rootIds: string[] = [];

  for (const dto of dtos) {
    nodes[dto.id] = { ...dto, depth: resolveDepth(dto, byId, depth) };
    if (dto.parentId === null) {
      rootIds.push(dto.id);
    } else {
      const siblings = childrenIds[dto.parentId] ?? [];
      siblings.push(dto.id);
      childrenIds[dto.parentId] = siblings;
    }
  }

  const aggregates = computeAggregates(nodes, childrenIds, rootIds);
  return { nodes, childrenIds, rootIds, aggregates, version };
};

// Walks up to the first ancestor with a known depth (or a root), then assigns depths down the path.
// Detects orphans and cycles on the way.
const resolveDepth = (start: OrgNodeDto, byId: DtoMap, depth: Record<string, number>): number => {
  const path: string[] = [];
  let node: OrgNodeDto | null = start;
  let known = -1;

  while (node) {
    const cached = depth[node.id];
    if (cached !== undefined) {
      known = cached;
      break;
    }

    if (path.includes(node.id)) throw new OrgDataError(OrgDataErrorCode.Cycle, node.id);
    path.push(node.id);
    if (node.parentId === null) break;

    const parent: OrgNodeDto | undefined = byId[node.parentId];
    if (!parent) throw new OrgDataError(OrgDataErrorCode.Orphan, node.id);
    node = parent;
  }

  for (const id of path.toReversed()) {
    known += 1;
    depth[id] = known;
  }
  return depth[start.id] ?? 0;
};
