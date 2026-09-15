import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';

import { API_PATHS } from '../shared/api.ts';

import { state } from './data.ts';
import { sendJson } from './http.ts';
import { handleLiveUpgrade, startPatchTicker } from './live.ts';
import { handleSearchParse } from './search.ts';

const PORT = Number(process.env.PORT ?? 3001);
const SCENARIO = process.env.MOCK_SCENARIO || undefined;
const SLOW_DELAY_MS = 2_000;
const NO_STORE = { 'Cache-Control': 'no-store' };
// These scenarios replace the data, so live patches would target nodes the client never received.
const HAS_LIVE_PATCHES = SCENARIO !== 'empty' && SCENARIO !== 'error' && SCENARIO !== 'invalid';

const handleOrgTree = async (req: IncomingMessage, res: ServerResponse) => {
  if (SCENARIO === 'slow') await sleep(SLOW_DELAY_MS);
  if (SCENARIO === 'error') return sendJson(res, 500, { message: 'Mock server failure' }, NO_STORE);
  // Scenario bodies skip the ETag and caches: an empty or broken body shares version 1 with real data.
  if (SCENARIO === 'empty') return sendJson(res, 200, [], NO_STORE);
  if (SCENARIO === 'invalid') {
    return sendJson(
      res,
      200,
      state.nodes.map(({ id: _id, ...rest }) => rest),
      NO_STORE,
    );
  }

  const etag = `"${state.version}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag });
    return res.end();
  }
  sendJson(res, 200, state.nodes, { ETag: etag, 'Cache-Control': 'no-cache' });
};

const route = async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const isRead = req.method === 'GET' || req.method === 'HEAD';
  if (isRead && url.pathname === API_PATHS.health) {
    return sendJson(res, 200, { ok: true, version: state.version }, NO_STORE);
  }
  if (isRead && url.pathname === API_PATHS.orgTree) return handleOrgTree(req, res);
  if (req.method === 'POST' && url.pathname === API_PATHS.searchParse) {
    return handleSearchParse(req, res);
  }
  sendJson(res, 404, { message: 'Not found' });
};

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { message: 'Internal error' });
  }
});

server.on('upgrade', handleLiveUpgrade);
server.listen(PORT, () => {
  console.log(`Mock API: http://localhost:${PORT}${SCENARIO ? ` (scenario: ${SCENARIO})` : ''}`);
});

if (HAS_LIVE_PATCHES) startPatchTicker();
