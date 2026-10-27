/**
 * Auth0 Management API client (server-side only).
 *
 * The admin "Gerenciar usuários" screen manages users directly in Auth0 (the
 * app's identity provider), so the backend talks to the Management API with a
 * machine-to-machine (client_credentials) token.
 *
 * - getMgmtToken(): fetches and caches a management token until shortly before
 *   it expires, so we don't mint one per request.
 * - mgmtFetch(): thin wrapper around `fetch` (native on Node >= 18) that
 *   attaches the token, builds the /api/v2 URL + query string, parses JSON, and
 *   converts non-2xx responses into our HttpError envelope via mapAuth0Error.
 *
 * Never expose the management client id/secret to the frontend.
 */
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { mapAuth0Error } from '../utils/auth0Error.js';

// Tenant base URL, trailing-slash-normalized so `${issuer}oauth/token` and
// `${issuer}api/v2/...` are well-formed.
const issuer = env.AUTH0_ISSUER_BASE_URL.endsWith('/')
  ? env.AUTH0_ISSUER_BASE_URL
  : `${env.AUTH0_ISSUER_BASE_URL}/`;

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}
let cache: CachedToken | null = null;

const fetchMgmtToken = async (): Promise<string> => {
  const res = await fetch(`${issuer}oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: env.AUTH0_MGMT_CLIENT_ID,
      client_secret: env.AUTH0_MGMT_CLIENT_SECRET,
      audience: env.AUTH0_MGMT_AUDIENCE,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!res.ok || !body.access_token) {
    logger.error({ status: res.status }, '[auth0] failed to obtain management token');
    throw mapAuth0Error(res.status, body, 'Auth0 Management token');
  }
  // Refresh 60s before expiry; floor at 30s so a tiny expires_in still caches.
  const ttlMs = Math.max(((body.expires_in ?? 3600) - 60) * 1000, 30_000);
  cache = { token: body.access_token, expiresAt: Date.now() + ttlMs };
  return body.access_token;
};

export const getMgmtToken = async (): Promise<string> => {
  if (cache && cache.expiresAt > Date.now()) return cache.token;
  return fetchMgmtToken();
};

export interface MgmtFetchOptions {
  method?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

/**
 * Call a Management API v2 endpoint. `path` starts with `/` (e.g. `/users`).
 * Returns parsed JSON (or undefined for 204). Throws HttpError on non-2xx.
 */
export const mgmtFetch = async <T = unknown>(
  path: string,
  opts: MgmtFetchOptions = {},
): Promise<T> => {
  const token = await getMgmtToken();
  const url = new URL(`${issuer}api/v2${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : {};
  if (!res.ok) throw mapAuth0Error(res.status, json, 'Profile');
  return json as T;
};
