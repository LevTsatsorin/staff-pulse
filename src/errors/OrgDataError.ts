import type { ValueOf } from 'src/types/helpers';

export const OrgDataErrorCode = {
  DuplicateId: 'duplicate-id',
  Orphan: 'orphan',
  Cycle: 'cycle',
} as const;
export type OrgDataErrorCode = ValueOf<typeof OrgDataErrorCode>;

export class OrgDataError extends Error {
  readonly code: OrgDataErrorCode;
  readonly nodeId: string;

  constructor(code: OrgDataErrorCode, nodeId: string) {
    super(`Org data integrity error: ${code} at "${nodeId}"`);
    this.name = 'OrgDataError';
    this.code = code;
    this.nodeId = nodeId;
  }
}
