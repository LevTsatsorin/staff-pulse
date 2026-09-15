import { describe, expect, it } from 'vitest';

import { searchParseRequestSchema, structuredFilterSchema } from './search.ts';

const EMPTY_FILTER = {
  text: null,
  levels: null,
  headcount: null,
  budget: null,
  performance: null,
  sort: null,
};

describe('searchParseRequestSchema', () => {
  it('should trim the query and reject blank or oversized input', () => {
    expect(searchParseRequestSchema.parse({ query: '  продажи ' })).toEqual({ query: 'продажи' });
    expect(searchParseRequestSchema.safeParse({ query: '   ' }).success).toBe(false);
    expect(searchParseRequestSchema.safeParse({ query: 'a'.repeat(301) }).success).toBe(false);
    expect(searchParseRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe('structuredFilterSchema', () => {
  it('should accept a filter where every condition is null', () => {
    expect(structuredFilterSchema.parse(EMPTY_FILTER)).toEqual(EMPTY_FILTER);
  });

  it('should require every key so strict structured outputs stay explicit', () => {
    const { text: _text, ...withoutText } = EMPTY_FILTER;

    expect(structuredFilterSchema.safeParse(withoutText).success).toBe(false);
  });

  it('should reject levels outside 1..3 and unknown sort keys', () => {
    expect(structuredFilterSchema.safeParse({ ...EMPTY_FILTER, levels: [4] }).success).toBe(false);
    expect(structuredFilterSchema.safeParse({ ...EMPTY_FILTER, levels: [1.5] }).success).toBe(
      false,
    );
    expect(
      structuredFilterSchema.safeParse({
        ...EMPTY_FILTER,
        sort: { key: 'budget', direction: 'asc' },
      }).success,
    ).toBe(false);
  });

  it('should accept ranges with one open bound', () => {
    const filter = { ...EMPTY_FILTER, performance: { min: null, max: 50 } };

    expect(structuredFilterSchema.parse(filter)).toEqual(filter);
  });
});
