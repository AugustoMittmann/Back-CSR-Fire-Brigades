/**
 * Pino logger singleton. Redacts auth headers, cookies, and any field path
 * that might carry tokens or the service role key. Used both as the
 * application logger and (via pino-http) as the request logger.
 */
import { pino } from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: undefined, // drop pid/hostname noise
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.serviceRoleKey',
      '*.SUPABASE_SERVICE_ROLE_KEY',
    ],
    censor: '[REDACTED]',
  },
});
