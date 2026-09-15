import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';

import type { OrgNodeDto } from 'shared/orgTree';

import { applyPatch } from './applyPatch';
import { buildOrgModel } from './buildOrgModel';

const UPDATED_AT = '2026-09-15T10:00:00.000Z';

const TREE = [
  dto('div', null, { headcount: 5, budget: 500, performance: 60 }),
  dto('dep-a', 'div', { headcount: 2, budget: 200, performance: 80 }),
  dto('dep-b', 'div', { headcount: 3, budget: 300, performance: 40 }),
  dto('team-a1', 'dep-a', { headcount: 10, budget: 1000, performance: 90 }),
  dto('team-b1', 'dep-b', { headcount: 4, budget: 400, performance: 50 }),
];

const createRandom = (seed: number) => () => {
  seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296;
  return seed / 4_294_967_296;
};

const buildWideTree = (): OrgNodeDto[] => {
  const nodes = [dto('root', null)];
  for (let a = 0; a < 3; a += 1) {
    nodes.push(dto(`a${a}`, 'root'));
    for (let b = 0; b < 3; b += 1) {
      nodes.push(dto(`a${a}b${b}`, `a${a}`));
      for (let c = 0; c < 3; c += 1) nodes.push(dto(`a${a}b${b}c${c}`, `a${a}b${b}`));
    }
  }
  return nodes;
};

describe('applyPatch', () => {
  it('should update the node and the aggregates of its ancestors only', () => {
    const model = buildOrgModel(TREE, 1);

    const next = applyPatch(
      model,
      [{ id: 'team-a1', fields: { headcount: 20 }, updatedAt: UPDATED_AT }],
      2,
    );

    expect(next?.version).toBe(2);
    expect(next?.nodes['team-a1']).toMatchObject({ headcount: 20, updatedAt: UPDATED_AT });
    expect(next?.aggregates['team-a1']?.totalHeadcount).toBe(20);
    expect(next?.aggregates['dep-a']?.totalHeadcount).toBe(22);
    expect(next?.aggregates.div?.totalHeadcount).toBe(34);
  });

  it('should keep references of untouched nodes, aggregates and structure', () => {
    const model = buildOrgModel(TREE, 1);

    const next = applyPatch(
      model,
      [{ id: 'team-a1', fields: { budget: 1 }, updatedAt: UPDATED_AT }],
      2,
    );

    expect(next?.nodes['dep-b']).toBe(model.nodes['dep-b']);
    expect(next?.aggregates['dep-b']).toBe(model.aggregates['dep-b']);
    expect(next?.aggregates['team-b1']).toBe(model.aggregates['team-b1']);
    expect(next?.childrenIds).toBe(model.childrenIds);
    expect(next?.rootIds).toBe(model.rootIds);
    expect(next?.aggregates['dep-a']).not.toBe(model.aggregates['dep-a']);
  });

  it('should apply a batch of changes in one pass', () => {
    const model = buildOrgModel(TREE, 1);

    const next = applyPatch(
      model,
      [
        { id: 'team-a1', fields: { performance: 10 }, updatedAt: UPDATED_AT },
        { id: 'team-b1', fields: { headcount: 0 }, updatedAt: UPDATED_AT },
      ],
      2,
    );

    expect(next?.aggregates['dep-b']?.totalHeadcount).toBe(3);
    expect(next?.aggregates['dep-a']?.avgPerformance).toBeCloseTo((80 * 2 + 10 * 10) / 12);
    expect(next?.aggregates.div?.totalHeadcount).toBe(20);
  });

  it('should return null when a change targets an unknown node', () => {
    const model = buildOrgModel(TREE, 1);

    const next = applyPatch(
      model,
      [{ id: 'ghost', fields: { headcount: 1 }, updatedAt: UPDATED_AT }],
      2,
    );

    expect(next).toBeNull();
  });

  it('should match a full rebuild after 1000 random patches', () => {
    const random = createRandom(2026);
    const pick = <TItem>(items: readonly TItem[]) =>
      items[Math.floor(random() * items.length)] as TItem;
    let dtos = buildWideTree();
    let model = buildOrgModel(dtos, 0);

    for (let version = 1; version <= 1000; version += 1) {
      const changes = Array.from({ length: 1 + Math.floor(random() * 3) }, () => ({
        id: pick(dtos).id,
        fields: pick([
          { headcount: Math.floor(random() * 15) },
          { budget: Math.round(random() * 1e7) / 100 },
          { performance: Math.round(random() * 10_000) / 100 },
          { headcount: Math.floor(random() * 3), performance: random() * 100 },
        ]),
        updatedAt: UPDATED_AT,
      }));
      dtos = changes.reduce(
        (acc, change) =>
          acc.map(node =>
            node.id === change.id ? { ...node, ...change.fields, updatedAt: UPDATED_AT } : node,
          ),
        dtos,
      );
      model = applyPatch(model, changes, version) ?? model;
    }

    const rebuilt = buildOrgModel(dtos, 1000);
    expect(model.version).toBe(1000);
    expect(model.nodes).toEqual(rebuilt.nodes);
    expect(model.aggregates).toEqual(rebuilt.aggregates);
  });
});
