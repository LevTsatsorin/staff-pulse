import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';
import { buildOrgModel } from 'src/utils/tree/buildOrgModel';

import type { LiveMessage } from 'shared/live';

import { resolveLiveMessage } from './resolveLiveMessage';

const model = buildOrgModel([dto('div', null), dto('team', 'div', { headcount: 4 })], 10);

const patch = (version: number, id = 'team'): LiveMessage => ({
  type: 'patch',
  version,
  changes: [{ id, fields: { headcount: 9 }, updatedAt: '2026-09-15T10:00:00.000Z' }],
});

describe('resolveLiveMessage', () => {
  it('should ignore everything before the first snapshot arrives', () => {
    expect(resolveLiveMessage(undefined, patch(1))).toEqual({ type: 'ignore' });
    expect(resolveLiveMessage(undefined, { type: 'hello', version: 3 })).toEqual({
      type: 'ignore',
    });
  });

  it('should ignore hello with the same version', () => {
    expect(resolveLiveMessage(model, { type: 'hello', version: 10 })).toEqual({ type: 'ignore' });
  });

  it('should refetch when hello reports a newer or an older version', () => {
    expect(resolveLiveMessage(model, { type: 'hello', version: 12 })).toEqual({ type: 'refetch' });
    expect(resolveLiveMessage(model, { type: 'hello', version: 1 })).toEqual({ type: 'refetch' });
  });

  it('should ignore replayed or stale patches', () => {
    expect(resolveLiveMessage(model, patch(10))).toEqual({ type: 'ignore' });
    expect(resolveLiveMessage(model, patch(9))).toEqual({ type: 'ignore' });
  });

  it('should refetch when a version is skipped', () => {
    expect(resolveLiveMessage(model, patch(12))).toEqual({ type: 'refetch' });
  });

  it('should refetch when the next patch targets an unknown node', () => {
    expect(resolveLiveMessage(model, patch(11, 'ghost'))).toEqual({ type: 'refetch' });
  });

  it('should apply the next consecutive patch', () => {
    const decision = resolveLiveMessage(model, patch(11));

    expect(decision.type).toBe('apply');
    if (decision.type !== 'apply') return;
    expect(decision.model.version).toBe(11);
    expect(decision.model.aggregates.div?.totalHeadcount).toBe(10);
  });
});
