/**
 * Rate limiters.
 *
 * - apiLimiter: a permissive global limiter; mostly defends against runaway
 *   clients and trivial flooding.
 * - contactLimiter: strict limiter on POST /api/contacts — the only public
 *   write endpoint, and a magnet for spam.
 *
 * Express must have `trust proxy` set correctly (see TRUST_PROXY env) before
 * these are mounted, otherwise req.ip is the load-balancer's address and the
 * limit becomes effectively global.
 */
import rateLimit from 'express-rate-limit';
import { tooMany } from '../errors/HttpError.js';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(tooMany()),
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(tooMany('Please try again later')),
});
