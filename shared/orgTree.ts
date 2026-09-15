import { z } from 'zod';

export const orgNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().min(1).nullable(),
  headcount: z.int().min(0),
  budget: z.number().min(0),
  performance: z.number().min(0).max(100),
  updatedAt: z.iso.datetime(),
});

export const orgTreeResponseSchema = z.array(orgNodeSchema);

export type OrgNodeDto = z.infer<typeof orgNodeSchema>;
