import { z } from 'zod';

import { orgNodeSchema } from './orgTree.ts';

const liveChangeSchema = z.object({
  id: z.string().min(1),
  fields: orgNodeSchema.pick({ headcount: true, budget: true, performance: true }).partial(),
  updatedAt: z.iso.datetime(),
});

export const liveMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hello'), version: z.int().min(0) }),
  z.object({
    type: z.literal('patch'),
    version: z.int().min(1),
    changes: z.array(liveChangeSchema).min(1),
  }),
]);

export type LiveChange = z.infer<typeof liveChangeSchema>;
export type LiveMessage = z.infer<typeof liveMessageSchema>;
