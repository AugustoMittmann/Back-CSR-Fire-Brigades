/**
 * Auth0 access-token verification middleware (RS256 via JWKS).
 *
 * The frontend authenticates with Auth0 and sends the resulting access token
 * as `Authorization: Bearer <jwt>`. We verify it against the tenant's public
 * signing keys (JWKS), with:
 * - algorithms pinned to RS256 (Auth0 signs access tokens with RS256) — guards
 *   against alg-confusion downgrades.
 * - issuer pinned to the tenant URL (token `iss`).
 * - audience pinned to the API identifier the token was minted for.
 * - 5-second clock tolerance for benign drift.
 * - a generic 401 to the client on any failure — the real reason is logged
 *   server-side, never leaked.
 *
 * The remote key set is cached by `jose` (with rotation/cooldown handling), so
 * this does not fetch JWKS on every request.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { unauthorized } from '../errors/HttpError.js';

// Normalize to a trailing slash so it matches Auth0's `iss` exactly, and build
// the standard JWKS endpoint from it.
const issuer = env.AUTH0_ISSUER_BASE_URL.endsWith('/')
  ? env.AUTH0_ISSUER_BASE_URL
  : `${env.AUTH0_ISSUER_BASE_URL}/`;
const JWKS = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('missing_token', 'Unauthorized'));
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) return next(unauthorized('missing_token', 'Unauthorized'));

  jwtVerify(token, JWKS, {
    algorithms: ['RS256'],
    issuer,
    audience: env.AUTH0_AUDIENCE,
    clockTolerance: 5,
  })
    .then(({ payload }) => {
      req.auth = payload as Express.Request['auth'];
      next();
    })
    .catch((err: unknown) => {
      // Log the precise reason; respond generically.
      const reason =
        (err as { code?: string; name?: string })?.code ??
        (err as { name?: string })?.name ??
        'invalid';
      logger.warn(
        { reqId: req.id, reason },
        '[auth] token verification failed',
      );
      next(unauthorized('invalid_token', 'Unauthorized'));
    });
};
