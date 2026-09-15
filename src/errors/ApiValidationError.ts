import type { ZodError } from 'zod';

export class ApiValidationError extends Error {
  readonly issues: ZodError['issues'];

  constructor(error: ZodError) {
    super('API response failed validation');
    this.name = 'ApiValidationError';
    this.issues = error.issues;
  }
}
