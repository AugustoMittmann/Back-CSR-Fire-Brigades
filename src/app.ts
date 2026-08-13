/**
 * Express app factory. Order matters here:
 *
 *   1. trust proxy            → req.ip is correct before rate limiters use it
 *   2. helmet                 → security headers on every response
 *   3. requestId              → req.id available for all subsequent logs
 *   4. pino-http              → structured request logs (with redaction)
 *   5. /health, /ready        → BEFORE cors + rate limit so probes (which send
 *                               no Origin header) aren't 403'd or throttled
 *   6. cors                   → preflight handled before any auth
 *   7. express.json (10kb)    → small payload limit defends contact endpoint
 *   8. apiLimiter             → global, after IP is trustworthy
 *   9. /api routes
 *  10. notFound               → catches unmatched
 *  11. errorHandler           → MUST be last (Express 4 four-arg middleware)
 */
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { allowedOrigins, env, trustProxy } from './config/env.js';
import { logger } from './config/logger.js';
import { requestId } from './middleware/requestId.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { supabasePing } from './db/supabase.js';
import { apiRouter } from './routes/index.js';

export const buildApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);

  app.use(
    helmet({
      // We're a JSON API; CSP is irrelevant and easy to misconfigure.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.use(requestId);

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as express.Request).id,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      // pino's redact config in logger.ts handles auth headers; pino-http
      // serializers respect it.
    }),
  );

  // Health/readiness are mounted BEFORE cors and the rate limiter: orchestrator
  // probes send no Origin header (which cors rejects in production) and should
  // never be throttled.
  //
  // Liveness — no DB, no auth, no rate limit surprises.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Readiness — pings Supabase. Returns 503 if DB unreachable.
  app.get(
    '/ready',
    asyncHandler(async (_req, res) => {
      const ok = await supabasePing();
      res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'unavailable' });
    }),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        // No-origin (curl, server-to-server). Allow only in development —
        // production should always have a valid Origin header from the SPA.
        if (!origin) {
          if (env.NODE_ENV !== 'production') return cb(null, true);
          return cb(new Error('Not allowed by CORS'));
        }
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: '10kb' }));

  app.use(apiLimiter);

  app.use('/api', apiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
