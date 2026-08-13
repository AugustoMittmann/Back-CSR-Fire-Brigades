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
    // HS256 secret used to verify Supabase Auth JWTs sent by the frontend.
    // Found in: Supabase Dashboard → Project Settings → API → JWT Secret.
    SUPABASE_JWT_SECRET: z
      .string()
      .min(20, 'SUPABASE_JWT_SECRET looks too short'),

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

// trust proxy can be a number or a string (e.g. "loopback"). Coerce to number
// when possible so app.set('trust proxy', N) gets the right type.
export const trustProxy: number | string = (() => {
  const v = env.TRUST_PROXY;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
})();

/**
 * Convenience: list of allowed CORS origins. Each configured value is
 * normalized to its scheme+host+port via `new URL(v).origin`, which strips any
 * path/trailing slash — a browser's `Origin` header never includes a path, so
 * a configured "https://app.example.com/home" would otherwise never match.
 */
export const allowedOrigins: string[] = (() => {
  const configured = [env.FRONTEND_ORIGIN_DEV, env.FRONTEND_ORIGIN_PROD].filter(
    Boolean,
  ) as string[];
  const normalized: string[] = [];
  for (const value of configured) {
    try {
      normalized.push(new URL(value).origin);
    } catch {
      // Should be unreachable — zod already validated .url() — but never let a
      // malformed origin silently widen or crash the allowlist.
      // eslint-disable-next-line no-console
      console.warn(`[env] Ignoring malformed FRONTEND_ORIGIN value: ${value}`);
    }
  }
  return Array.from(new Set(normalized));
})();

// ---------------------------------------------------------------------------
// Boot-time posture checks. These run once at import. In production we fail
// fast on misconfiguration that would otherwise fail silently or insecurely;
// in dev we only warn so local iteration isn't blocked.
// ---------------------------------------------------------------------------

/** Decode a JWT's payload `role` claim without verifying the signature. */
const jwtRoleClaim = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return (JSON.parse(json) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
};

{
  const isProd = env.NODE_ENV === 'production';

  // The service-role key must actually carry role='service_role'. An anon key
  // in this slot passes the JWT shape check but silently loses server
  // privileges — dangerous with RLS disabled.
  const serviceRole = jwtRoleClaim(env.SUPABASE_SERVICE_ROLE_KEY);
  if (serviceRole !== 'service_role') {
    const msg = `[env] SUPABASE_SERVICE_ROLE_KEY carries role='${serviceRole ?? 'unknown'}', expected 'service_role'.`;
    if (isProd) {
      // eslint-disable-next-line no-console
      console.error(msg);
      process.exit(1);
    } else {
      // eslint-disable-next-line no-console
      console.warn(msg);
    }
  }

  // A production deploy with no prod origin yields an empty CORS allowlist,
  // silently 403-ing every browser request.
  if (isProd && !env.FRONTEND_ORIGIN_PROD) {
    // eslint-disable-next-line no-console
    console.error('[env] FRONTEND_ORIGIN_PROD is required when NODE_ENV=production.');
    process.exit(1);
  }

  // Behind a reverse proxy/LB (typical in production), trust proxy = 0 makes
  // express-rate-limit key on the proxy IP, collapsing all clients into one
  // bucket. Warn loudly rather than exit (some deploys terminate TLS directly).
  if (isProd && trustProxy === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[env] TRUST_PROXY=0 in production: rate limiting keys on the proxy IP, not the client. Set TRUST_PROXY to the number of proxy hops (e.g. 1).',
    );
  }
}
