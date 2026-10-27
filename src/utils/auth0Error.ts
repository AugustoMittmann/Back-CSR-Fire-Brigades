/**
 * Maps Auth0 Management API HTTP errors into our HttpError envelope, mirroring
 * utils/supabaseError.ts. Full detail is logged server-side; the client gets a
 * generic, non-leaking message. Used by lib/auth0Management.ts.
 */
import { logger } from '../config/logger.js';
import { HttpError, badRequest, conflict, notFound, tooMany } from '../errors/HttpError.js';

interface Auth0ErrorBody {
  message?: string;
  error?: string;
  errorCode?: string;
  [k: string]: unknown;
}

export const mapAuth0Error = (
  status: number,
  body: unknown,
  resource: string,
): HttpError => {
  const b = (body ?? {}) as Auth0ErrorBody;
  const msg = typeof b.message === 'string' && b.message ? b.message : undefined;
  switch (status) {
    case 400:
      // e.g. weak password, invalid payload. Surface the Auth0 message so the
      // admin sees why the signup failed.
      return badRequest('signup_failed', msg ?? 'Invalid request');
    case 401:
    case 403:
      // The backend's management credentials/scopes are wrong — a server
      // misconfiguration, not a client error. Never leak it.
      logger.error({ status, resource }, '[auth0] management auth/scope error');
      return new HttpError(500, 'internal_error', 'Internal Server Error');
    case 404:
      return notFound(resource);
    case 409:
      return conflict(`${resource} already exists`);
    case 429:
      return tooMany();
    default:
      logger.error({ status, body: b, resource }, '[auth0] unexpected management error');
      return new HttpError(500, 'internal_error', 'Internal Server Error');
  }
};
