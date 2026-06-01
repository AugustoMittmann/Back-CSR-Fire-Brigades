/**
 * Auth0 RS256 JWT verification middleware.
 *
 * - Pins algorithms to RS256 (defends against alg-confusion attacks).
 * - Validates issuer + audience.
 * - 5-second clock tolerance for benign drift.
 * - jwks-rsa caches keys and rate-limits remote fetches so a flood of
 *   tokens with random `kid` values can't hammer Auth0 or DoS us.
 * - Returns a generic 401 to the client on any failure — the actual reason
 *   is logged server-side, never leaked.
 */
import type { JwtHeader, SigningKeyCallback, VerifyErrors } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { unauthorized } from '../errors/HttpError.js';

const jwks = jwksClient({
  jwksUri: `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

const getKey = (header: JwtHeader, cb: SigningKeyCallback): void => {
  if (!header.kid) {
    cb(new Error('Missing kid in token header'));
    return;
  }
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return cb(err ?? new Error('Signing key not found'));
    cb(null, key.getPublicKey());
  });
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('missing_token', 'Unauthorized'));
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) return next(unauthorized('missing_token', 'Unauthorized'));

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      audience: env.AUTH0_AUDIENCE,
      issuer: `https://${env.AUTH0_DOMAIN}/`,
      clockTolerance: 5,
    },
    (err: VerifyErrors | null, decoded) => {
      if (err || !decoded || typeof decoded === 'string') {
        // Log the precise reason; respond generically.
        logger.warn(
          { reqId: req.id, reason: err?.name ?? 'invalid' },
          '[auth] token verification failed',
        );
        return next(unauthorized('invalid_token', 'Unauthorized'));
      }
      req.auth = decoded as Express.Request['auth'];
      next();
    },
  );
};
