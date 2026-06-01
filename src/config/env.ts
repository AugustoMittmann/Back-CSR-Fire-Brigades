/**
 * Loads .env, validates required environment variables with zod, and exports
 * a single `env` object. Importing this module is the first thing the server
 * does — if anything is missing or malformed, we crash at boot rather than
 * later in a request handler.
 */
import 'dotenv/config';
import { z } from 'zod';

// JWT shape sanity check — service role keys are JWTs (header.payload.signature).
const jwtLike = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// Auth0 tenant domains: anything ending in .auth0.com (region-prefixed or not),
// or a custom domain. We accept any hostname-like string with at least one dot.
const hostLike = /^(?!-)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

// Note: NOT .strict() — process.env always contains many unrelated keys
// (PATH, HOME, etc.). We only validate the keys we care about.
const Schema = z.object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info'),

    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z
      .string()
      .min(20, 'SUPABASE_SERVICE_ROLE_KEY looks too short')
      .regex(jwtLike, 'SUPABASE_SERVICE_ROLE_KEY must be a JWT'),

    AUTH0_DOMAIN: z.string().regex(hostLike, 'AUTH0_DOMAIN must be a hostname'),
    AUTH0_AUDIENCE: z.string().min(1),

    FRONTEND_ORIGIN_DEV: z.string().url().optional(),
    FRONTEND_ORIGIN_PROD: z.string().url().optional(),

    // 0 = no trust (default), 1 = trust first proxy, "loopback"/CIDR also valid.
    TRUST_PROXY: z.string().default('0'),
  });

const parsed = Schema.safeParse(process.env);
if (!parsed.success) {
  // Print the validation issues to stderr (no values, only field names + messages)
  // and exit. We never log the env object itself.
  // eslint-disable-next-line no-console
  console.error(
    '[env] Invalid environment variables:\n' +
      parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n'),
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

// Convenience: list of allowed CORS origins (deduped, falsy filtered).
export const allowedOrigins: string[] = Array.from(
  new Set([env.FRONTEND_ORIGIN_DEV, env.FRONTEND_ORIGIN_PROD].filter(Boolean) as string[]),
);

// trust proxy can be a number or a string (e.g. "loopback"). Coerce to number
// when possible so app.set('trust proxy', N) gets the right type.
export const trustProxy: number | string = (() => {
  const v = env.TRUST_PROXY;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
})();
