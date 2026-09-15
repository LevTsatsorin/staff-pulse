import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';

import { API_PATHS } from '../shared/api.ts';

import { state } from './data.ts';

const PORT = Number(process.env.PORT ?? 3001);
const SCENARIO = process.env.MOCK_SCENARIO || undefined;
const SLOW_DELAY_MS = 2_000;

const sendJson = (
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
};

const scenarioBody = () => {
  if (SCENARIO === 'empty') return [];
  if (SCENARIO === 'invalid') return state.nodes.map(({ id: _id, ...rest }) => rest);
  return state.nodes;
};

const handleOrgTree = async (req: IncomingMessage, res: ServerResponse) => {
  if (SCENARIO === 'slow') await sleep(SLOW_DELAY_MS);
  if (SCENARIO === 'error') return sendJson(res, 500, { message: 'Mock server failure' });
  if (SCENARIO) return sendJson(res, 200, scenarioBody());

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
  if (isRead && url.pathname === API_PATHS.orgTree) return handleOrgTree(req, res);
  sendJson(res, 404, { message: 'Not found' });
};

createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { message: 'Internal error' });
  }
}).listen(PORT, () => {
  console.log(`Mock API: http://localhost:${PORT}${SCENARIO ? ` (scenario: ${SCENARIO})` : ''}`);
});
