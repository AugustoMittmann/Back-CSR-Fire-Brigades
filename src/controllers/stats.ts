/**
 * Stats — aggregate counts for the home-page dashboard.
 *
 * Prefers a Postgres RPC `stats_summary()` (defined in the DDL) which returns
 * the entire object in one round-trip. If the RPC is missing (e.g. user
 * skipped that part of the DDL), falls back to four parallel HEAD count
 * queries plus a Node-side volunteers sum. The fallback is logged at WARN.
 */
import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { logger } from '../config/logger.js';

interface StatsApi {
  brigades: number;
  volunteersTotal: number;
  contacts: number;
  campaigns: number;
}

const fromRpc = (raw: unknown): StatsApi | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const brigades = Number(r.brigades);
  const volunteers_total = Number(r.volunteers_total);
  const contacts = Number(r.contacts);
  const campaigns = Number(r.campaigns);
  if ([brigades, volunteers_total, contacts, campaigns].some((n) => !Number.isFinite(n))) {
    return null;
  }
  return {
    brigades,
    volunteersTotal: volunteers_total,
    contacts,
    campaigns,
  };
};

const fallback = async (): Promise<StatsApi> => {
  const sb = supabase();
  const [brigadesC, contactsC, campaignsC, volunteersRows] = await Promise.all([
    sb.from('brigades').select('id', { head: true, count: 'exact' }),
    sb.from('contacts').select('id', { head: true, count: 'exact' }),
    sb.from('campaigns').select('id', { head: true, count: 'exact' }),
    sb.from('brigades').select('volunteers'),
  ]);
  const sum = (volunteersRows.data ?? []).reduce(
    (acc, r) => acc + (typeof r.volunteers === 'number' ? r.volunteers : 0),
    0,
  );
  return {
    brigades: brigadesC.count ?? 0,
    volunteersTotal: sum,
    contacts: contactsC.count ?? 0,
    campaigns: campaignsC.count ?? 0,
  };
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase().rpc('stats_summary');
  const parsed = error ? null : fromRpc(data);
  if (!parsed) {
    if (error) {
      logger.warn(
        { reqId: req.id, code: error.code },
        '[stats] rpc unavailable, using fallback',
      );
    }
    const result = await fallback();
    res.json({ data: result });
    return;
  }
  res.json({ data: parsed });
};
