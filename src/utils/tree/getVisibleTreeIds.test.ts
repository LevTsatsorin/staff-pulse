import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';

import { buildOrgModel } from './buildOrgModel';
import { getVisibleTreeIds } from './getVisibleTreeIds';

const model = buildOrgModel([
  dto('a', null),
  dto('a1', 'a'),
  dto('a11', 'a1'),
  dto('a2', 'a'),
  dto('b', null),
  dto('b1', 'b'),
]);

describe('getVisibleTreeIds', () => {
  it('should list only roots when nothing is expanded', () => {
    expect(getVisibleTreeIds(model, new Set())).toEqual(['a', 'b']);
  });

  it('should walk expanded branches in tree order and skip collapsed subtrees', () => {
    expect(getVisibleTreeIds(model, new Set(['a']))).toEqual(['a', 'a1', 'a2', 'b']);
    expect(getVisibleTreeIds(model, new Set(['a', 'a1', 'b']))).toEqual([
      'a',
      'a1',
      'a11',
      'a2',
      'b',
      'b1',
    ]);
  });

  it('should ignore an expanded node whose parent is collapsed', () => {
    expect(getVisibleTreeIds(model, new Set(['a1']))).toEqual(['a', 'b']);
  });
});
