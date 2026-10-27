/**
 * User data layer backed by the Auth0 Management API (not Supabase).
 *
 * The app authenticates with Auth0, so users live in Auth0. Validation state
 * and display name are kept in each user's `app_metadata`; the `id` is the
 * Auth0 `user_id` (e.g. `auth0|...`). The exported functions keep the same
 * signatures/return shapes (ProfileRow / ListResult<ProfileRow>) the controller
 * already expects, so the HTTP contract is unchanged.
 */
import { mgmtFetch } from '../lib/auth0Management.js';
import { env } from '../config/env.js';
import { notFound } from '../errors/HttpError.js';
import type {
  ProfileCreate,
  ProfileListQuery,
  ProfileUpdate,
} from '../schemas/profile.js';
import type { ProfileRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

interface Auth0User {
  user_id?: string;
  email?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  app_metadata?: {
    display_name?: string | null;
    is_validated?: boolean;
    validated_by?: string | null;
    validated_at?: string | null;
    [k: string]: unknown;
  };
}

/** Auth0 user → the snake_case ProfileRow the controller's toApi() maps. */
const toRow = (u: Auth0User): ProfileRow => {
  const m = u.app_metadata ?? {};
  return {
    id: u.user_id ?? '',
    email: u.email ?? '',
    display_name: m.display_name ?? u.name ?? null,
    is_validated: m.is_validated === true,
    validated_by: m.validated_by ?? null,
    validated_at: m.validated_at ?? null,
    created_at: u.created_at ?? '',
    updated_at: u.updated_at ?? '',
  };
};

/**
 * Build a Lucene query (search_engine=v3) from the list filters. Quotes/backslashes
 * in the free-text search are escaped so they can't break out of the term.
 */
const buildQuery = (q: ProfileListQuery): string | undefined => {
  const parts: string[] = [];
  if (q.search) {
    const safe = q.search.replace(/["\\]/g, '\\$&');
    parts.push(`email:*${safe}*`);
  }
  if (q.is_validated !== undefined) {
    parts.push(`app_metadata.is_validated:${q.is_validated ? 'true' : 'false'}`);
  }
  return parts.length ? parts.join(' AND ') : undefined;
};

export const listProfiles = async (
  q: ProfileListQuery,
): Promise<ListResult<ProfileRow>> => {
  const page = Math.floor(q.offset / q.limit);
  const q0 = buildQuery(q);
  const query = {
    per_page: q.limit,
    page,
    search_engine: 'v3',
    sort: 'created_at:-1',
    q: q0,
  };

  if (q.withCount) {
    const res = await mgmtFetch<{ users: Auth0User[]; total: number }>('/users', {
      query: { ...query, include_totals: true },
    });
    return { data: (res.users ?? []).map(toRow), count: res.total ?? null };
  }
  const users = await mgmtFetch<Auth0User[]>('/users', { query });
  return { data: (users ?? []).map(toRow), count: null };
};

export const getProfile = async (id: string): Promise<ProfileRow> => {
  const user = await mgmtFetch<Auth0User | null>(
    `/users/${encodeURIComponent(id)}`,
  );
  if (!user || !user.user_id) throw notFound('Profile');
  return toRow(user);
};

/**
 * Patch display_name and/or is_validated. Both live in app_metadata (which the
 * Management API merges). We keep the Auth0 `name` in sync when a non-empty
 * display name is given, and move validated_at/by alongside is_validated.
 */
export const updateProfile = async (
  id: string,
  patch: ProfileUpdate,
): Promise<ProfileRow> => {
  const appMetadata: Record<string, unknown> = {};
  const body: Record<string, unknown> = {};

  if (patch.display_name !== undefined) {
    appMetadata.display_name = patch.display_name ?? null;
    // Auth0 rejects an empty `name`; only set it when there's a value.
    if (patch.display_name) body.name = patch.display_name;
  }
  if (patch.is_validated !== undefined) {
    appMetadata.is_validated = patch.is_validated;
    appMetadata.validated_at = patch.is_validated
      ? new Date().toISOString()
      : null;
    if (!patch.is_validated) appMetadata.validated_by = null;
  }
  body.app_metadata = appMetadata;

  const user = await mgmtFetch<Auth0User>(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  });
  return toRow(user);
};

export const validateProfile = async (
  id: string,
  validatorId: string,
): Promise<ProfileRow> => {
  const user = await mgmtFetch<Auth0User>(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: {
      app_metadata: {
        is_validated: true,
        validated_by: validatorId,
        validated_at: new Date().toISOString(),
      },
    },
  });
  return toRow(user);
};

export const revokeProfile = async (id: string): Promise<ProfileRow> => {
  const user = await mgmtFetch<Auth0User>(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: {
      app_metadata: { is_validated: false, validated_by: null, validated_at: null },
    },
  });
  return toRow(user);
};

/**
 * Provision a new user in the configured Auth0 database connection. Manually
 * created users are pre-validated (is_validated=true), recording the acting
 * admin's Auth0 subject in validated_by. The user can then log in via the same
 * Universal Login screen with this email/password.
 */
export const createUser = async (
  input: ProfileCreate,
  validatorId: string,
): Promise<ProfileRow> => {
  const nowIso = new Date().toISOString();
  const body: Record<string, unknown> = {
    connection: env.AUTH0_DB_CONNECTION,
    email: input.email,
    password: input.password,
    email_verified: true,
    app_metadata: {
      is_validated: true,
      validated_by: validatorId,
      validated_at: nowIso,
      display_name: input.display_name ?? null,
    },
  };
  if (input.display_name) body.name = input.display_name;

  const user = await mgmtFetch<Auth0User>('/users', { method: 'POST', body });
  return toRow(user);
};
