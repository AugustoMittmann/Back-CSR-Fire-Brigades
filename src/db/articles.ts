import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type { ArticleCreate, ArticleListQuery, ArticleUpdate } from '../schemas/article.js';
import type { ArticleRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const listArticles = async (q: ArticleListQuery): Promise<ListResult<ArticleRow>> => {
  let query = supabase()
    .from('articles')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.category) query = query.eq('category', q.category);
  if (q.search) query = query.ilike('title', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Article');
  return { data: (data ?? []) as ArticleRow[], count: count ?? null };
};

export const getArticle = async (id: string): Promise<ArticleRow> => {
  const { data, error } = await supabase()
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Article');
  if (!data) throw notFound('Article');
  return data as ArticleRow;
};

export const createArticle = async (input: ArticleCreate): Promise<ArticleRow> => {
  const { data, error } = await supabase()
    .from('articles')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Article');
  return data as ArticleRow;
};

export const updateArticle = async (id: string, patch: ArticleUpdate): Promise<ArticleRow> => {
  const { data, error } = await supabase()
    .from('articles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Article');
  if (!data) throw notFound('Article');
  return data as ArticleRow;
};

export const deleteArticle = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('articles')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'Article');
  if (!count) throw notFound('Article');
};
