/**
 * Brigade repository: every Supabase call for the `brigades` table lives here.
 * Returns DB rows (snake_case); the controller is responsible for camelCasing
 * the response and shaping the JSON envelope.
 */
import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type { BrigadeCreate, BrigadeListQuery, BrigadeUpdate } from '../schemas/brigade.js';
import type { BrigadeRow } from '../types/domain.js';

export interface ListResult<T> {
  data: T[];
  count: number | null;
}

export const listBrigades = async (q: BrigadeListQuery): Promise<ListResult<BrigadeRow>> => {
  let query = supabase()
    .from('brigades')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('created_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.state) query = query.eq('state', q.state);
  if (q.city) query = query.eq('city', q.city);
  if (q.search) query = query.ilike('name', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Brigade');
  return { data: (data ?? []) as BrigadeRow[], count: count ?? null };
};

export const getBrigade = async (id: string): Promise<BrigadeRow> => {
  const { data, error } = await supabase()
    .from('brigades')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Brigade');
  if (!data) throw notFound('Brigade');
  return data as BrigadeRow;
};

export const createBrigade = async (input: BrigadeCreate): Promise<BrigadeRow> => {
  const { data, error } = await supabase()
    .from('brigades')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Brigade');
  return data as BrigadeRow;
};

export const updateBrigade = async (id: string, patch: BrigadeUpdate): Promise<BrigadeRow> => {
  const { data, error } = await supabase()
    .from('brigades')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Brigade');
  if (!data) throw notFound('Brigade');
  return data as BrigadeRow;
};

export const deleteBrigade = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('brigades')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'Brigade');
  if (!count) throw notFound('Brigade');
};
