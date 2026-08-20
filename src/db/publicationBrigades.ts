import { supabase } from './supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import type { ParticipantBrigadeRow } from '../types/domain.js';

/**
 * Brigadas participantes de uma publicação (campanha, notícia ou artigo).
 *
 * As três entidades têm uma tabela de junção N:N para `participant_brigades`
 * (campaign_brigade / news_brigade / article_brigade). Este módulo lê o
 * cadastro completo das brigadas participantes via embedded select do FK.
 */

export type PublicationKind = 'campaign' | 'news' | 'article';

const JOIN: Record<PublicationKind, { table: string; fk: string }> = {
  campaign: { table: 'campaign_brigade', fk: 'campaign_id' },
  news: { table: 'news_brigade', fk: 'news_id' },
  article: { table: 'article_brigade', fk: 'article_id' },
};

interface JoinRow {
  participant: ParticipantBrigadeRow | null;
}

export const listPublicationBrigades = async (
  kind: PublicationKind,
  publicationId: string,
): Promise<ParticipantBrigadeRow[]> => {
  const { table, fk } = JOIN[kind];
  const { data, error } = await supabase()
    .from(table)
    .select('participant:participant_brigades(*)')
    .eq(fk, publicationId);
  if (error) throw mapSupabaseError(error, 'ParticipantBrigade');

  const rows = ((data ?? []) as unknown as JoinRow[])
    .map((r) => r.participant)
    .filter((p): p is ParticipantBrigadeRow => p != null);
  rows.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return rows;
};
