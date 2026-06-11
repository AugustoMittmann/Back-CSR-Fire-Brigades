import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type {
  ActivityCreate,
  ActivityListQuery,
  ActivityUpdate,
} from '../schemas/activity.js';
import type { ActivityRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

// ----- catalog -----

export const listActivities = async (q: ActivityListQuery): Promise<ListResult<ActivityRow>> => {
  let query = supabase()
    .from('activities')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('name', { ascending: true })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.search) query = query.ilike('name', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Activity');
  return { data: (data ?? []) as ActivityRow[], count: count ?? null };
};

export const getActivity = async (id: string): Promise<ActivityRow> => {
  const { data, error } = await supabase()
    .from('activities')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Activity');
  if (!data) throw notFound('Activity');
  return data as ActivityRow;
};

export const createActivity = async (input: ActivityCreate): Promise<ActivityRow> => {
  const { data, error } = await supabase()
    .from('activities')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Activity');
  return data as ActivityRow;
};

export const updateActivity = async (
  id: string,
  patch: ActivityUpdate,
): Promise<ActivityRow> => {
  const { data, error } = await supabase()
    .from('activities')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Activity');
  if (!data) throw notFound('Activity');
  return data as ActivityRow;
};

export const deleteActivity = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('activities')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'Activity');
  if (!count) throw notFound('Activity');
};

// ----- brigade <-> activity junction -----

export interface BrigadeActivityJoined {
  brigade_id: string;
  activity_id: string;
  activity: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
  } | null;
}

export const listBrigadeActivities = async (
  brigadeId: string,
): Promise<BrigadeActivityJoined[]> => {
  const { data, error } = await supabase()
    .from('activities_brigade')
    .select('brigade_id, activity_id, activity:activities(id,name,description,icon)')
    .eq('brigade_id', brigadeId);
  if (error) throw mapSupabaseError(error, 'Activity');
  return (data ?? []) as unknown as BrigadeActivityJoined[];
};

export const addBrigadeActivity = async (
  brigadeId: string,
  activityId: string,
): Promise<void> => {
  const { error } = await supabase()
    .from('activities_brigade')
    .upsert(
      { brigade_id: brigadeId, activity_id: activityId },
      { onConflict: 'brigade_id,activity_id' },
    );
  if (error) throw mapSupabaseError(error, 'Activity');
};

export const removeBrigadeActivity = async (
  brigadeId: string,
  activityId: string,
): Promise<void> => {
  const { error, count } = await supabase()
    .from('activities_brigade')
    .delete({ count: 'exact' })
    .eq('brigade_id', brigadeId)
    .eq('activity_id', activityId);
  if (error) throw mapSupabaseError(error, 'Activity');
  if (!count) throw notFound('Activity');
};
