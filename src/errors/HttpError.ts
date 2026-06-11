/**
 * HttpError + factories. Throw these from controllers; the central error
 * handler converts them into the JSON error envelope. Keeps stack traces and
 * preserves `instanceof` for clean discrimination.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (code: string, message: string, details?: unknown): HttpError =>
  new HttpError(400, code, message, details);

export const unauthorized = (
  code: 'missing_token' | 'invalid_token' | 'unauthorized' = 'unauthorized',
  message = 'Unauthorized',
): HttpError => new HttpError(401, code, message);

export const notFound = (resource: string): HttpError =>
  new HttpError(404, 'not_found', `${resource} not found`);

export const forbidden = (message = 'Forbidden'): HttpError =>
  new HttpError(403, 'forbidden', message);

export const conflict = (message = 'Conflict'): HttpError =>
  new HttpError(409, 'conflict', message);

export const tooLarge = (message = 'Payload too large'): HttpError =>
  new HttpError(413, 'payload_too_large', message);

export const tooMany = (message = 'Too many requests'): HttpError =>
  new HttpError(429, 'rate_limited', message);
