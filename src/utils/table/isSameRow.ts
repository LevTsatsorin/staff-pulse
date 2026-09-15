import type { TableRow } from 'src/types/table';

// Rows are rebuilt from every new model; equal fields mean nothing on screen changes.
export const isSameRow = (a: TableRow, b: TableRow): boolean =>
  a === b || (Object.keys(a) as (keyof TableRow)[]).every(key => a[key] === b[key]);
