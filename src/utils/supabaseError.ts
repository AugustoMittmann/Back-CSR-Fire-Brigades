/**
 * Helpers shared by controllers when interacting with Supabase.
 *
 * - mapSupabaseError: turn a PostgrestError into an HttpError with a generic,
 *   non-leaking message. Maps a few well-known codes; everything else falls
 *   through to a logged 500.
 *
 * - escapeIlike: defang user-supplied search input before passing to .ilike(),
 *   so `%` and `_` don't enable wildcard or enumeration attacks.
 */
import type { PostgrestError } from '@supabase/supabase-js';
import { logger } from '../config/logger.js';
import { HttpError, badRequest, conflict, notFound } from '../errors/HttpError.js';

export const mapSupabaseError = (err: PostgrestError, resource: string): HttpError => {
  switch (err.code) {
    case '23505': // unique_violation
      return conflict(`${resource} already exists`);
    case '23503': // foreign_key_violation
      return badRequest('invalid_reference', 'Referenced resource does not exist');
    case 'PGRST116': // no rows when single() expected
      return notFound(resource);
    default:
      // Log full error server-side; client gets a generic 500.
      logger.error({ err, resource }, '[supabase] unexpected error');
      return new HttpError(500, 'internal_error', 'Internal Server Error');
  }
};

/**
 * Escape the wildcard characters that Postgres ILIKE treats specially. Run on
 * any user-supplied value used in a `.ilike()` filter.
 */
export const escapeIlike = (s: string): string => s.replace(/[\\%_]/g, '\\$&');
