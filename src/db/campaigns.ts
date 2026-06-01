import { supabase } from './supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type { CampaignCreate, CampaignListQuery, CampaignUpdate } from '../schemas/campaign.js';
import type { CampaignRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const listCampaigns = async (q: CampaignListQuery): Promise<ListResult<CampaignRow>> => {
  let query = supabase()
    .from('campaigns')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.category) query = query.eq('category', q.category);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Campaign');
  return { data: (data ?? []) as CampaignRow[], count: count ?? null };
};

export const getCampaign = async (id: string): Promise<CampaignRow> => {
  const { data, error } = await supabase()
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Campaign');
  if (!data) throw notFound('Campaign');
  return data as CampaignRow;
};

export const createCampaign = async (input: CampaignCreate): Promise<CampaignRow> => {
  const { data, error } = await supabase()
    .from('campaigns')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Campaign');
  return data as CampaignRow;
};

export const updateCampaign = async (id: string, patch: CampaignUpdate): Promise<CampaignRow> => {
  const { data, error } = await supabase()
    .from('campaigns')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Campaign');
  if (!data) throw notFound('Campaign');
  return data as CampaignRow;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('campaigns')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'Campaign');
  if (!count) throw notFound('Campaign');
};
