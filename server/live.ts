import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';

import { WebSocket, WebSocketServer } from 'ws';

import { API_PATHS } from '../shared/api.ts';
import type { LiveChange, LiveMessage } from '../shared/live.ts';
import type { OrgNodeDto } from '../shared/orgTree.ts';

import { createRandomInt, state } from './data.ts';

const PATCH_INTERVAL_MS = Number(process.env.PATCH_INTERVAL_MS) || 2_000;
const BATCH_EVERY_TICKS = 5;

const wss = new WebSocketServer({ noServer: true });

const serialize = (message: LiveMessage) => JSON.stringify(message);
const randomInt = createRandomInt(Math.random);
const signedDelta = (max: number) => randomInt(1, max) * (Math.random() < 0.5 ? -1 : 1);

const NEXT_VALUE = {
  headcount: (node: OrgNodeDto) => Math.max(1, node.headcount + signedDelta(2)),
  budget: (node: OrgNodeDto) =>
    Math.round((node.budget * (100 + signedDelta(5))) / 100_000) * 1_000,
  performance: (node: OrgNodeDto) => Math.min(100, Math.max(0, node.performance + signedDelta(6))),
};
type PatchField = keyof typeof NEXT_VALUE;
const PATCH_FIELDS = Object.keys(NEXT_VALUE) as PatchField[];

const mutateFields = (node: OrgNodeDto): LiveChange['fields'] => {
  const picked = PATCH_FIELDS.filter(() => Math.random() < 0.4);
  const fields = picked.length > 0 ? picked : [PATCH_FIELDS[randomInt(0, 2)] ?? 'performance'];
  return Object.fromEntries(fields.map(field => [field, NEXT_VALUE[field](node)]));
};

const broadcastChanges = (count: number) => {
  const indexes = new Set<number>();
  while (indexes.size < count) indexes.add(randomInt(0, state.nodes.length - 1));

  const updatedAt = new Date().toISOString();
  const changes: LiveChange[] = [];
  for (const index of indexes) {
    const node = state.nodes[index];
    if (!node) continue;

    const fields = mutateFields(node);
    state.nodes[index] = { ...node, ...fields, updatedAt };
    changes.push({ id: node.id, fields, updatedAt });
  }

  state.version += 1;
  const payload = serialize({ type: 'patch', version: state.version, changes });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
};

export const handleLiveUpgrade = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (pathname !== API_PATHS.live) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, client => {
    client.send(serialize({ type: 'hello', version: state.version }));
  });
};

// Every PATCH_INTERVAL_MS ± 50% one node changes; every fifth tick a batch of 2–4 nodes.
export const startPatchTicker = () => {
  let ticks = 0;
  const schedule = () =>
    setTimeout(
      () => {
        ticks += 1;
        broadcastChanges(ticks % BATCH_EVERY_TICKS === 0 ? randomInt(2, 4) : 1);
        schedule();
      },
      PATCH_INTERVAL_MS * (0.5 + Math.random()),
    );
  schedule();
};
