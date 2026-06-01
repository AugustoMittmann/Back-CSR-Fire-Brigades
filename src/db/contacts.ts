/**
 * Contact repository — Supabase calls for the `contacts` table.
 */
import { supabase } from './supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import type { ContactCreate, ContactListQuery } from '../schemas/contact.js';
import type { ContactRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

export const insertContact = async (input: ContactCreate): Promise<ContactRow> => {
  // Build the insert object explicitly — never spread arbitrary input.
  const row = {
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    state: input.state ?? null,
    city: input.city ?? null,
    contact_reason: input.contact_reason,
    brigade_id: input.brigade_id ?? null,
    message: input.message,
    terms_accepted: input.terms_accepted,
  };
  const { data, error } = await supabase()
    .from('contacts')
    .insert(row)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Contact');
  return data as ContactRow;
};

export const listContacts = async (q: ContactListQuery): Promise<ListResult<ContactRow>> => {
  let query = supabase()
    .from('contacts')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('created_at', { ascending: false })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.contact_reason) query = query.eq('contact_reason', q.contact_reason);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Contact');
  return { data: (data ?? []) as ContactRow[], count: count ?? null };
};
