import type { IncomingMessage, ServerResponse } from 'node:http';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import { searchParseRequestSchema, structuredFilterSchema } from '../shared/search.ts';

import { readJsonBody, sendJson } from './http.ts';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
const TIMEOUT_MS = 5_000;
const MAX_OUTPUT_TOKENS = 2_000;

const INSTRUCTIONS = `You turn a search request about a company org structure into a table filter.
The structure has divisions (level 1), departments (level 2) and teams (level 3).
Every unit has a name, a total headcount, a total budget in rubles and an average performance from 0 to 100.
Rules:
- text: a word or stem that should appear in the unit name, in the user's language; null if the request names no unit.
- levels: 1 for divisions («дивизион»), 2 for departments («отдел»), 3 for teams («команда»); null if not mentioned.
- headcount, budget, performance: inclusive ranges; use null for a bound or a whole range the request does not mention.
- Budget is in rubles: expand «5 млн» to 5000000 and «1,5 млрд» to 1500000000.
- sort: only when the request asks for ordering or for top or best units; keys are name, level, totalHeadcount, totalBudget, avgPerformance.
- If the request is not about filtering the org structure, return every field as null.`;

// Without a key the endpoint answers 503 and the client falls back to plain text search.
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ timeout: TIMEOUT_MS, maxRetries: 0 })
  : null;

const parseSearchQuery = async (query: string, model = DEFAULT_MODEL) => {
  if (!client) throw new Error('OPENAI_API_KEY is not set');
  const response = await client.responses.parse({
    model,
    instructions: INSTRUCTIONS,
    input: query,
    reasoning: { effort: 'low' },
    max_output_tokens: MAX_OUTPUT_TOKENS,
    text: { format: zodTextFormat(structuredFilterSchema, 'org_filter') },
  });
  return { filter: response.output_parsed, usage: response.usage };
};

export const handleSearchParse = async (req: IncomingMessage, res: ServerResponse) => {
  if (!client) return sendJson(res, 503, { message: 'AI search is not configured' });

  const request = searchParseRequestSchema.safeParse(await readJsonBody(req));
  if (!request.success)
    return sendJson(res, 400, { message: 'Expected { "query": non-empty string }' });

  try {
    const { filter } = await parseSearchQuery(request.data.query);
    if (!filter) return sendJson(res, 502, { message: 'The model returned no filter' });
    sendJson(res, 200, filter);
  } catch (error) {
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      return sendJson(res, 504, { message: 'AI search timed out' });
    }
    console.error('AI search failed:', error instanceof Error ? error.message : error);
    sendJson(res, 502, { message: 'AI search failed' });
  }
};
