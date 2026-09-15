import { z } from 'zod';

// Strict structured outputs require every key, so a condition the query does not mention is null.
const rangeSchema = z.object({ min: z.number().nullable(), max: z.number().nullable() });

const SORT_KEYS = ['name', 'level', 'totalHeadcount', 'totalBudget', 'avgPerformance'] as const;

export const structuredFilterSchema = z.object({
  text: z.string().nullable(),
  levels: z.array(z.int().min(1).max(3)).nullable(),
  headcount: rangeSchema.nullable(),
  budget: rangeSchema.nullable(),
  performance: rangeSchema.nullable(),
  sort: z.object({ key: z.enum(SORT_KEYS), direction: z.enum(['asc', 'desc']) }).nullable(),
});

export const searchParseRequestSchema = z.object({ query: z.string().trim().min(1).max(300) });

export type StructuredFilter = z.infer<typeof structuredFilterSchema>;
export type FilterRange = z.infer<typeof rangeSchema>;
