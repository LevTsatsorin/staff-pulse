import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';

import { buildOrgModel } from './buildOrgModel';
import { getAncestorIds } from './getAncestorIds';

const model = buildOrgModel([dto('div', null), dto('dep', 'div'), dto('team', 'dep')]);

describe('getAncestorIds', () => {
  it('should return no ancestors for a root', () => {
    expect(getAncestorIds(model, 'div')).toEqual([]);
  });

  it('should list ancestors from the nearest parent up to the root', () => {
    expect(getAncestorIds(model, 'team')).toEqual(['dep', 'div']);
  });

  it('should return no ancestors for an unknown id', () => {
    expect(getAncestorIds(model, 'missing')).toEqual([]);
  });
});
