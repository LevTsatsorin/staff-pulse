import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';

import { buildOrgModel } from './buildOrgModel';
import { getDefaultExpandedIds } from './getDefaultExpandedIds';

describe('getDefaultExpandedIds', () => {
  it('should expand only roots that have children', () => {
    const model = buildOrgModel([
      dto('div', null),
      dto('lonely', null),
      dto('dep', 'div'),
      dto('team', 'dep'),
    ]);

    const result = getDefaultExpandedIds(model);

    expect([...result]).toEqual(['div']);
  });
});
