import type { ValueOf } from 'src/types/helpers';

export const ViewMode = { Tree: 'tree', Table: 'table' } as const;
export type ViewMode = ValueOf<typeof ViewMode>;
