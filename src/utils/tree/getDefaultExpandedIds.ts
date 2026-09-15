import { DEFAULT_EXPANDED_DEPTH } from 'src/constants/ui';
import type { OrgModel } from 'src/types/orgModel';

export const getDefaultExpandedIds = (model: OrgModel): ReadonlySet<string> =>
  new Set(
    Object.values(model.nodes)
      .filter(node => node.depth <= DEFAULT_EXPANDED_DEPTH && model.childrenIds[node.id])
      .map(node => node.id),
  );
