/**
 * Admin gates. Load the calling user's profile by JWT sub and 401/403 if the
 * profile isn't a validated admin. Use AFTER requireAuth.
 *
 * Both guards attach the resolved profile to `req.profile` so downstream
 * controllers can make role-aware decisions (e.g. only a super_admin may
 * change another profile's role) without a second DB round-trip.
 *
 * - requireAdmin       → role in ('admin', 'super_admin') and is_validated.
 * - requireSuperAdmin  → role === 'super_admin' and is_validated. Reserved for
 *   privilege-management operations (creating/promoting admins, toggling
 *   validation), so a plain admin cannot escalate their own tier.
 */
import type { RequestHandler } from 'express';
import { supabase } from '../db/supabase.js';
import { unauthorized, forbidden } from '../errors/HttpError.js';
import { logger } from '../config/logger.js';

type ProfileTier = 'user' | 'admin' | 'super_admin';

/**
 * Shared profile lookup + validation. Resolves the caller's profile, enforces
 * is_validated, attaches it to req.profile, and returns the role — or forwards
 * an appropriate 401/403 via `next` and returns null.
 */
const loadValidatedProfile = async (
  req: Parameters<RequestHandler>[0],
  next: Parameters<RequestHandler>[2],
): Promise<ProfileTier | null> => {
  const sub = req.auth?.sub;
  if (!sub) {
    next(unauthorized('missing_token', 'Unauthorized'));
    return null;
  }

  const { data, error } = await supabase()
    .from('profiles')
    .select('role, is_validated')
    .eq('id', sub)
    .maybeSingle();

  if (error) {
    logger.warn({ err: error, sub }, '[admin] profile lookup failed');
    next(forbidden('Admin lookup failed'));
    return null;
  }
  if (!data) {
    next(forbidden('No profile found'));
    return null;
  }
  if (!data.is_validated) {
    next(forbidden('Profile not validated'));
    return null;
  }

  req.profile = { role: data.role as ProfileTier, isValidated: data.is_validated };
  return data.role as ProfileTier;
};

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  const role = await loadValidatedProfile(req, next);
  if (role === null) return; // response already forwarded
  if (role !== 'admin' && role !== 'super_admin') {
    return next(forbidden('Admin role required'));
  }
  next();
};

export const requireSuperAdmin: RequestHandler = async (req, _res, next) => {
  const role = await loadValidatedProfile(req, next);
  if (role === null) return; // response already forwarded
  if (role !== 'super_admin') {
    return next(forbidden('Super admin role required'));
  }
  next();
};
