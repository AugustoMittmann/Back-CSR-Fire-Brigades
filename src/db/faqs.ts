import { supabase } from './supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type { FaqCreate, FaqUpdate } from '../schemas/faq.js';
import type { FaqRow } from '../types/domain.js';

export const listFaqs = async (): Promise<FaqRow[]> => {
  const { data, error } = await supabase()
    .from('faqs')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw mapSupabaseError(error, 'FAQ');
  return (data ?? []) as FaqRow[];
};

export const createFaq = async (input: FaqCreate): Promise<FaqRow> => {
  const { data, error } = await supabase()
    .from('faqs')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'FAQ');
  return data as FaqRow;
};

export const updateFaq = async (id: string, patch: FaqUpdate): Promise<FaqRow> => {
  const { data, error } = await supabase()
    .from('faqs')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'FAQ');
  if (!data) throw notFound('FAQ');
  return data as FaqRow;
};

export const deleteFaq = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('faqs')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'FAQ');
  if (!count) throw notFound('FAQ');
};
