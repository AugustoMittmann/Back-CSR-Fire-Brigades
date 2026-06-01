/**
 * Server entrypoint. Loads env (via importing app.ts → which transitively
 * imports config/env.ts), starts listening, and installs graceful shutdown
 * handlers for SIGTERM/SIGINT.
 */
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { buildApp } from './app.js';

const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    '[server] listening',
  );
});

const SHUTDOWN_TIMEOUT_MS = 10_000;

const shutdown = (signal: string): void => {
  logger.info({ signal }, '[server] shutdown requested');
  // Stop accepting new connections; in-flight finish naturally.
  server.close((err) => {
    if (err) {
      logger.error({ err }, '[server] error during close');
      process.exit(1);
    }
    logger.info('[server] closed cleanly');
    process.exit(0);
  });

  // Force-exit if shutdown drags.
  setTimeout(() => {
    logger.warn('[server] forced exit after timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Last-resort safety nets — log and exit. Letting these slide can corrupt
// state in subtle ways.
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, '[server] unhandled rejection');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, '[server] uncaught exception');
  process.exit(1);
});
