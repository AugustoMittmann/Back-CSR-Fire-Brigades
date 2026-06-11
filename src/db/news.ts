import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type { NewsCreate, NewsListQuery, NewsUpdate } from '../schemas/news.js';
import type { NewsRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const listNews = async (q: NewsListQuery): Promise<ListResult<NewsRow>> => {
  let query = supabase()
    .from('news')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.search) query = query.ilike('title', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'News');
  return { data: (data ?? []) as NewsRow[], count: count ?? null };
};

export const getNews = async (id: string): Promise<NewsRow> => {
  const { data, error } = await supabase()
    .from('news')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'News');
  if (!data) throw notFound('News');
  return data as NewsRow;
};

export const createNews = async (input: NewsCreate): Promise<NewsRow> => {
  const { data, error } = await supabase()
    .from('news')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'News');
  return data as NewsRow;
};

export const updateNews = async (id: string, patch: NewsUpdate): Promise<NewsRow> => {
  const { data, error } = await supabase()
    .from('news')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'News');
  if (!data) throw notFound('News');
  return data as NewsRow;
};

export const deleteNews = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('news')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'News');
  if (!count) throw notFound('News');
};
