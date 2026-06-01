/**
 * Lazy singleton Supabase client built with the service role key.
 *
 * IMPORTANT: the service role key bypasses Row Level Security. All access
 * must be mediated by the API. Never expose this client (or the key) to the
 * frontend.
 *
 * Lazy init keeps module import order safe — env validation runs first.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let client: SupabaseClient | null = null;

export const supabase = (): SupabaseClient => {
  if (!client) {
    // Log the host only — never the key.
    const host = new URL(env.SUPABASE_URL).host;
    logger.info({ host }, '[supabase] initializing client');
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        // Server-side service-role client has no user session to persist or
        // refresh. The default true causes spurious warnings.
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
};

/**
 * Cheap readiness ping: select 1 row at most from a known table. Used by the
 * /ready endpoint. Returns true if Supabase responded without error.
 */
export const supabasePing = async (): Promise<boolean> => {
  const { error } = await supabase()
    .from('brigades')
    .select('id', { head: true, count: 'exact' })
    .limit(1);
  return !error;
};
