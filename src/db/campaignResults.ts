import { supabase } from './supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type {
  CampaignResultCreate,
  CampaignResultUpdate,
} from '../schemas/campaignResult.js';
import type { CampaignResultRow } from '../types/domain.js';

export const listCampaignResults = async (campaignId: string): Promise<CampaignResultRow[]> => {
  const { data, error } = await supabase()
    .from('campaign_results')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw mapSupabaseError(error, 'CampaignResult');
  return (data ?? []) as CampaignResultRow[];
};

export const createCampaignResult = async (
  campaignId: string,
  input: CampaignResultCreate,
): Promise<CampaignResultRow> => {
  const { data, error } = await supabase()
    .from('campaign_results')
    .insert({ campaign_id: campaignId, position: 0, ...input })
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'CampaignResult');
  return data as CampaignResultRow;
};

export const updateCampaignResult = async (
  id: string,
  patch: CampaignResultUpdate,
): Promise<CampaignResultRow> => {
  const { data, error } = await supabase()
    .from('campaign_results')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'CampaignResult');
  if (!data) throw notFound('CampaignResult');
  return data as CampaignResultRow;
};

export const deleteCampaignResult = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('campaign_results')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'CampaignResult');
  if (!count) throw notFound('CampaignResult');
};
