import { describe, expect, it } from 'vitest';

import { OrgDataError } from 'src/errors/OrgDataError';
import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';

import { buildOrgModel } from './buildOrgModel';

describe('buildOrgModel', () => {
  it('should build an empty model from an empty response', () => {
    const model = buildOrgModel([], 7);

    expect(model).toEqual({
      nodes: {},
      childrenIds: {},
      rootIds: [],
      aggregates: {},
      version: 7,
    });
  });

  it('should treat a single node as a root with depth 0', () => {
    const model = buildOrgModel([dto('a', null)]);

    expect(model.rootIds).toEqual(['a']);
    expect(model.nodes.a?.depth).toBe(0);
    expect(model.childrenIds).toEqual({});
  });

  it('should keep root order and compute depth for a forest', () => {
    const input = [
      dto('b', null),
      dto('a', null),
      dto('a1', 'a'),
      dto('a11', 'a1'),
      dto('b1', 'b'),
    ];

    const model = buildOrgModel(input);

    expect(model.rootIds).toEqual(['b', 'a']);
    expect(model.childrenIds).toEqual({ a: ['a1'], a1: ['a11'], b: ['b1'] });
    expect(model.nodes.a11?.depth).toBe(2);
    expect(model.nodes.b1?.depth).toBe(1);
  });

  it('should resolve depth when a child appears before its parent', () => {
    const model = buildOrgModel([dto('a11', 'a1'), dto('a1', 'a'), dto('a', null)]);

    expect(model.nodes.a11?.depth).toBe(2);
    expect(model.nodes.a1?.depth).toBe(1);
    expect(model.nodes.a?.depth).toBe(0);
  });

  it('should throw on duplicate id', () => {
    expect(() => buildOrgModel([dto('a', null), dto('a', null)])).toThrow(OrgDataError);
    expect(() => buildOrgModel([dto('a', null), dto('a', null)])).toThrow(/duplicate-id/);
  });

  it('should throw on orphan parentId', () => {
    expect(() => buildOrgModel([dto('a', 'missing')])).toThrow(/orphan/);
  });

  it('should throw on a cycle', () => {
    expect(() => buildOrgModel([dto('a', 'b'), dto('b', 'a')])).toThrow(/cycle/);
    expect(() => buildOrgModel([dto('self', 'self')])).toThrow(/cycle/);
  });
});
