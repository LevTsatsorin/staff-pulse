import type { OrgModel } from 'src/types/orgModel';
import { applyPatch } from 'src/utils/tree/applyPatch';

import type { LiveMessage } from 'shared/live';

type LiveDecision = { type: 'ignore' } | { type: 'refetch' } | { type: 'apply'; model: OrgModel };

const IGNORE: LiveDecision = { type: 'ignore' };
const REFETCH: LiveDecision = { type: 'refetch' };

export const resolveLiveMessage = (
  model: OrgModel | undefined,
  message: LiveMessage,
): LiveDecision => {
  // Without a snapshot there is nothing to patch: the pending request brings the latest data.
  if (!model) return IGNORE;

  // On (re)connect any mismatch means missed patches or a restarted server.
  if (message.type === 'hello') return message.version === model.version ? IGNORE : REFETCH;

  if (message.version <= model.version) return IGNORE;
  if (message.version > model.version + 1) return REFETCH;

  const next = applyPatch(model, message.changes, message.version);
  return next ? { type: 'apply', model: next } : REFETCH;
};
