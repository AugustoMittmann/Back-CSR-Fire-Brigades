/**
 * Admin gate. Loads the calling user's profile by JWT sub and 401/403s if the
 * profile isn't a validated admin. Use AFTER requireAuth.
 */
import type { RequestHandler } from 'express';
import { supabase } from '../db/supabase.js';
import { unauthorized, forbidden } from '../errors/HttpError.js';
import { logger } from '../config/logger.js';

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  const sub = req.auth?.sub;
  if (!sub) return next(unauthorized('missing_token', 'Unauthorized'));

  const { data, error } = await supabase()
    .from('profiles')
    .select('role, is_validated')
    .eq('id', sub)
    .maybeSingle();

  if (error) {
    logger.warn({ err: error, sub }, '[admin] profile lookup failed');
    return next(forbidden('Admin lookup failed'));
  }
  if (!data) return next(forbidden('No profile found'));
  if (!data.is_validated) return next(forbidden('Profile not validated'));
  if (data.role !== 'admin' && data.role !== 'super_admin') {
    return next(forbidden('Admin role required'));
  }

  next();
};
