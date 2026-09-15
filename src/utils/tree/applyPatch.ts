import type { Aggregate, OrgModel, OrgNode } from 'src/types/orgModel';

import type { LiveChange } from 'shared/live';

import { aggregateNode } from './aggregate';

// Copies only the changed nodes and their ancestor chains, every other reference is kept,
// so memoized rows of untouched nodes skip rendering. Returns null when a change targets
// an unknown node: the caller resyncs from a fresh snapshot.
export const applyPatch = (
  model: OrgModel,
  changes: readonly LiveChange[],
  version: number,
): OrgModel | null => {
  const nodes: Record<string, OrgNode> = { ...model.nodes };
  const dirtyIds = new Set<string>();

  for (const { id, fields, updatedAt } of changes) {
    const node = nodes[id];
    if (!node) return null;
    nodes[id] = { ...node, ...fields, updatedAt };

    let current: string | null = id;
    while (current !== null && !dirtyIds.has(current)) {
      dirtyIds.add(current);
      current = nodes[current]?.parentId ?? null;
    }
  }

  const aggregates: Record<string, Aggregate> = { ...model.aggregates };
  // Deepest first, so each parent is rebuilt from children that are already up to date.
  const byDepthDesc = [...dirtyIds].sort((a, b) => (nodes[b]?.depth ?? 0) - (nodes[a]?.depth ?? 0));
  for (const id of byDepthDesc) {
    const node = nodes[id];
    if (!node) continue;
    const children = (model.childrenIds[id] ?? []).flatMap(childId => aggregates[childId] ?? []);
    aggregates[id] = aggregateNode(node, children);
  }

  return { ...model, nodes, aggregates, version };
};
