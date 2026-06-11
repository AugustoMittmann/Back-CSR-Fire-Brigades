/**
 * Supabase Auth JWT verification middleware (HS256).
 *
 * - Validates with the project JWT secret (env.SUPABASE_JWT_SECRET).
 * - Pins algorithms to HS256 — defends against alg-confusion attacks where
 *   an attacker tries to swap RS256 for HS256 with the public key.
 * - Validates issuer matches the project's auth endpoint.
 * - 5-second clock tolerance for benign drift.
 * - Returns a generic 401 to the client on any failure — the actual reason
 *   is logged server-side, never leaked.
 */
import jwt, { type VerifyErrors } from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { unauthorized } from '../errors/HttpError.js';

const issuer = `${env.SUPABASE_URL.replace(/\/+$/, '')}/auth/v1`;

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('missing_token', 'Unauthorized'));
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) return next(unauthorized('missing_token', 'Unauthorized'));

  jwt.verify(
    token,
    env.SUPABASE_JWT_SECRET,
    {
      algorithms: ['HS256'],
      issuer,
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
