/**
 * Generates a UUID per request and attaches it to req.id. The same id is
 * echoed in the X-Request-Id response header and included in error responses,
 * so a user-reported error can be traced in the logs.
 */
import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

export const requestId: RequestHandler = (req, res, next) => {
  // Honour client-provided id only if it looks safe (UUID-shaped). Otherwise
  // mint a fresh one — never trust arbitrary header content.
  const incoming = req.header('x-request-id');
  const safe =
    incoming && /^[0-9a-fA-F-]{8,64}$/.test(incoming) ? incoming : randomUUID();
  req.id = safe;
  res.setHeader('X-Request-Id', safe);
  next();
};
