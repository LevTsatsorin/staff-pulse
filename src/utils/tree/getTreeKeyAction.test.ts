import { describe, expect, it } from 'vitest';

import { makeOrgNodeDto as dto } from 'src/testing/orgFixtures';

import { buildOrgModel } from './buildOrgModel';
import { getTreeKeyAction } from './getTreeKeyAction';
import { getVisibleTreeIds } from './getVisibleTreeIds';

const model = buildOrgModel([
  dto('a', null),
  dto('a1', 'a'),
  dto('a11', 'a1'),
  dto('a2', 'a'),
  dto('b', null),
]);
const expanded = new Set(['a']);
const visible = getVisibleTreeIds(model, expanded);

const action = (activeId: string, key: string, open: ReadonlySet<string> = expanded) =>
  getTreeKeyAction(model, getVisibleTreeIds(model, open), open, activeId, key);

describe('getTreeKeyAction', () => {
  it('should move through visible nodes with Up, Down, Home and End', () => {
    expect(visible).toEqual(['a', 'a1', 'a2', 'b']);
    expect(action('a1', 'ArrowDown')).toEqual({ type: 'focus', id: 'a2' });
    expect(action('a1', 'ArrowUp')).toEqual({ type: 'focus', id: 'a' });
    expect(action('a2', 'End')).toEqual({ type: 'focus', id: 'b' });
    expect(action('b', 'Home')).toEqual({ type: 'focus', id: 'a' });
  });

  it('should return null at the edges and for unknown keys or nodes', () => {
    expect(action('b', 'ArrowDown')).toBeNull();
    expect(action('a', 'Home')).toBeNull();
    expect(action('a', 'Tab')).toBeNull();
    expect(action('ghost', 'ArrowDown')).toBeNull();
  });

  it('should expand a closed branch on Right, then step into it', () => {
    expect(action('a1', 'ArrowRight')).toEqual({ type: 'expand', id: 'a1' });
    expect(action('a1', 'ArrowRight', new Set(['a', 'a1']))).toEqual({ type: 'focus', id: 'a11' });
  });

  it('should do nothing on Right for a leaf', () => {
    expect(action('a2', 'ArrowRight')).toBeNull();
  });

  it('should collapse an open branch on Left, otherwise step up to the parent', () => {
    expect(action('a', 'ArrowLeft')).toEqual({ type: 'collapse', id: 'a' });
    expect(action('a2', 'ArrowLeft')).toEqual({ type: 'focus', id: 'a' });
    expect(action('b', 'ArrowLeft')).toBeNull();
  });
});
