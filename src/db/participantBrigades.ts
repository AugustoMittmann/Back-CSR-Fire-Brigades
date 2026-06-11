import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type {
  ParticipantBrigadeCreate,
  ParticipantBrigadeListQuery,
  ParticipantBrigadeUpdate,
} from '../schemas/participantBrigade.js';
import type { ParticipantBrigadeRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const listParticipantBrigades = async (
  q: ParticipantBrigadeListQuery,
): Promise<ListResult<ParticipantBrigadeRow>> => {
  let query = supabase()
    .from('participant_brigades')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('name', { ascending: true })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.search) query = query.ilike('name', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'ParticipantBrigade');
  return { data: (data ?? []) as ParticipantBrigadeRow[], count: count ?? null };
};

export const getParticipantBrigade = async (id: string): Promise<ParticipantBrigadeRow> => {
  const { data, error } = await supabase()
    .from('participant_brigades')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'ParticipantBrigade');
  if (!data) throw notFound('ParticipantBrigade');
  return data as ParticipantBrigadeRow;
};

export const createParticipantBrigade = async (
  input: ParticipantBrigadeCreate,
): Promise<ParticipantBrigadeRow> => {
  const { data, error } = await supabase()
    .from('participant_brigades')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'ParticipantBrigade');
  return data as ParticipantBrigadeRow;
};

export const updateParticipantBrigade = async (
  id: string,
  patch: ParticipantBrigadeUpdate,
): Promise<ParticipantBrigadeRow> => {
  const { data, error } = await supabase()
    .from('participant_brigades')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'ParticipantBrigade');
  if (!data) throw notFound('ParticipantBrigade');
  return data as ParticipantBrigadeRow;
};

export const deleteParticipantBrigade = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('participant_brigades')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'ParticipantBrigade');
  if (!count) throw notFound('ParticipantBrigade');
};
