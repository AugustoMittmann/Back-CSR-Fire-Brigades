import { supabase } from './supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import type {
  EventCountsQuery,
  EventCreate,
  EventListQuery,
} from '../schemas/event.js';
import type { EventRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const createEvent = async (input: EventCreate): Promise<EventRow> => {
  const { data, error } = await supabase()
    .from('events')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Event');
  return data as EventRow;
};

export const listEvents = async (q: EventListQuery): Promise<ListResult<EventRow>> => {
  let query = supabase()
    .from('events')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('occurred_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.event_type)  query = query.eq('event_type', q.event_type);
  if (q.target_type) query = query.eq('target_type', q.target_type);
  if (q.target_id)   query = query.eq('target_id', q.target_id);
  if (q.from)        query = query.gte('occurred_at', q.from);
  if (q.to)          query = query.lte('occurred_at', q.to);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Event');
  return { data: (data ?? []) as EventRow[], count: count ?? null };
};

export interface EventCountRow {
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  quantity: number;
}

/** Reads from the event_counts SQL view. */
export const getEventCounts = async (q: EventCountsQuery): Promise<EventCountRow[]> => {
  let query = supabase().from('event_counts').select('*');
  if (q.event_type)  query = query.eq('event_type', q.event_type);
  if (q.target_type) query = query.eq('target_type', q.target_type);
  if (q.target_id)   query = query.eq('target_id', q.target_id);

  const { data, error } = await query;
  if (error) throw mapSupabaseError(error, 'Event');
  return (data ?? []) as EventCountRow[];
};
