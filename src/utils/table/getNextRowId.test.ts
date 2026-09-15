import { describe, expect, it } from 'vitest';

import { getNextRowId } from './getNextRowId';

const IDS = ['a', 'b', 'c', 'd'];

describe('getNextRowId', () => {
  it('should move down and up by one row', () => {
    expect(getNextRowId(IDS, 'b', 'ArrowDown')).toBe('c');
    expect(getNextRowId(IDS, 'b', 'ArrowUp')).toBe('a');
  });

  it('should stay on the edge rows', () => {
    expect(getNextRowId(IDS, 'd', 'ArrowDown')).toBe('d');
    expect(getNextRowId(IDS, 'a', 'ArrowUp')).toBe('a');
  });

  it('should jump to the first and the last row', () => {
    expect(getNextRowId(IDS, 'c', 'Home')).toBe('a');
    expect(getNextRowId(IDS, 'b', 'End')).toBe('d');
  });

  it('should start from the first row when the active row is gone', () => {
    expect(getNextRowId(IDS, 'removed', 'ArrowDown')).toBe('a');
    expect(getNextRowId(IDS, null, 'ArrowUp')).toBe('a');
  });

  it('should ignore other keys and empty tables', () => {
    expect(getNextRowId(IDS, 'a', 'Tab')).toBeNull();
    expect(getNextRowId([], null, 'ArrowDown')).toBeNull();
  });
});
