import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';

import { API_PATHS } from '../shared/api.ts';

import { state } from './data.ts';
import { handleLiveUpgrade, startPatchTicker } from './live.ts';

const PORT = Number(process.env.PORT ?? 3001);
const SCENARIO = process.env.MOCK_SCENARIO || undefined;
const SLOW_DELAY_MS = 2_000;
// These scenarios replace the data, so live patches would target nodes the client never received.
const HAS_LIVE_PATCHES = SCENARIO !== 'empty' && SCENARIO !== 'error' && SCENARIO !== 'invalid';

const sendJson = (
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
};

const handleOrgTree = async (req: IncomingMessage, res: ServerResponse) => {
  if (SCENARIO === 'slow') await sleep(SLOW_DELAY_MS);
  if (SCENARIO === 'error') return sendJson(res, 500, { message: 'Mock server failure' });
  if (SCENARIO === 'invalid') {
    return sendJson(
      res,
      200,
      state.nodes.map(({ id: _id, ...rest }) => rest),
    );
  }

  const etag = `"${state.version}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag });
    return res.end();
  }
  const body = SCENARIO === 'empty' ? [] : state.nodes;
  sendJson(res, 200, body, { ETag: etag, 'Cache-Control': 'no-cache' });
};

const route = async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const isRead = req.method === 'GET' || req.method === 'HEAD';
  if (isRead && url.pathname === API_PATHS.orgTree) return handleOrgTree(req, res);
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
