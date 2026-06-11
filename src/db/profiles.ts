import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type { ProfileListQuery, ProfileUpdate } from '../schemas/profile.js';
import type { ProfileRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const listProfiles = async (
  q: ProfileListQuery,
): Promise<ListResult<ProfileRow>> => {
  let query = supabase()
    .from('profiles')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('created_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.role) query = query.eq('role', q.role);
  if (q.is_validated !== undefined) query = query.eq('is_validated', q.is_validated);
  if (q.search) query = query.ilike('email', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Profile');
  return { data: (data ?? []) as ProfileRow[], count: count ?? null };
};

export const getProfile = async (id: string): Promise<ProfileRow> => {
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Profile');
  if (!data) throw notFound('Profile');
  return data as ProfileRow;
};

/**
 * Generic patch (display_name, role, is_validated). Validation marks
 * (validated_by/validated_at) live on validateProfile so the admin's identity
 * is recorded explicitly.
 */
export const updateProfile = async (
  id: string,
  patch: ProfileUpdate,
): Promise<ProfileRow> => {
  const { data, error } = await supabase()
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Profile');
  if (!data) throw notFound('Profile');
  return data as ProfileRow;
};

/** Mark a profile as validated, recording who did it and when. */
export const validateProfile = async (
  id: string,
  validatorId: string,
): Promise<ProfileRow> => {
  const { data, error } = await supabase()
    .from('profiles')
    .update({
      is_validated: true,
      validated_by: validatorId,
      validated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Profile');
  if (!data) throw notFound('Profile');
  return data as ProfileRow;
};

/** Revoke validation (e.g. on misuse). */
export const revokeProfile = async (id: string): Promise<ProfileRow> => {
  const { data, error } = await supabase()
    .from('profiles')
    .update({
      is_validated: false,
      validated_by: null,
      validated_at: null,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Profile');
  if (!data) throw notFound('Profile');
  return data as ProfileRow;
};
