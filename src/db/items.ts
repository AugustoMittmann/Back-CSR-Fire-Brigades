import { supabase } from './supabase.js';
import { mapSupabaseError, escapeIlike } from '../utils/supabaseError.js';
import { notFound } from '../errors/HttpError.js';
import type {
  ItemCreate,
  ItemListQuery,
  ItemUpdate,
  ItemBrigadeUpsert,
} from '../schemas/item.js';
import type { ItemRow, ItemBrigadeRow } from '../types/domain.js';
import type { ListResult } from './brigades.js';

// ----- catalog -----

export const listItems = async (q: ItemListQuery): Promise<ListResult<ItemRow>> => {
  let query = supabase()
    .from('items')
    .select('*', q.withCount ? { count: 'exact' } : {})
    .order('name', { ascending: true })
    .range(q.offset, q.offset + q.limit - 1);

  if (q.search) query = query.ilike('name', `%${escapeIlike(q.search)}%`);

  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error, 'Item');
  return { data: (data ?? []) as ItemRow[], count: count ?? null };
};

export const getItem = async (id: string): Promise<ItemRow> => {
  const { data, error } = await supabase()
    .from('items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Item');
  if (!data) throw notFound('Item');
  return data as ItemRow;
};

export const createItem = async (input: ItemCreate): Promise<ItemRow> => {
  const { data, error } = await supabase()
    .from('items')
    .insert(input)
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Item');
  return data as ItemRow;
};

export const updateItem = async (id: string, patch: ItemUpdate): Promise<ItemRow> => {
  const { data, error } = await supabase()
    .from('items')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw mapSupabaseError(error, 'Item');
  if (!data) throw notFound('Item');
  return data as ItemRow;
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('items')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw mapSupabaseError(error, 'Item');
  if (!count) throw notFound('Item');
};

// ----- brigade <-> item junction -----

/**
 * Joined row used by listBrigadeItems: pulls catalog name/default_value/unit
 * via the FK so the API can return everything in one call.
 */
export interface BrigadeItemJoined {
  brigade_id: string;
  item_id: string;
  value: number | null;
  quantity_needed: number | null;
  item: {
    id: string;
    name: string;
    default_value: number | null;
    unit: string | null;
  } | null;
}

export const listBrigadeItems = async (brigadeId: string): Promise<BrigadeItemJoined[]> => {
  const { data, error } = await supabase()
    .from('items_brigade')
    .select('brigade_id, item_id, value, quantity_needed, item:items(id,name,default_value,unit)')
    .eq('brigade_id', brigadeId);
  if (error) throw mapSupabaseError(error, 'Item');
  return (data ?? []) as unknown as BrigadeItemJoined[];
};

/** Insert or update the (brigade_id, item_id) entry. */
export const upsertBrigadeItem = async (
  brigadeId: string,
  itemId: string,
  patch: ItemBrigadeUpsert,
): Promise<ItemBrigadeRow> => {
  const { data, error } = await supabase()
    .from('items_brigade')
    .upsert({ brigade_id: brigadeId, item_id: itemId, ...patch }, {
      onConflict: 'brigade_id,item_id',
    })
    .select('*')
    .single();
  if (error) throw mapSupabaseError(error, 'Item');
  return data as ItemBrigadeRow;
};

export const removeBrigadeItem = async (brigadeId: string, itemId: string): Promise<void> => {
  const { error, count } = await supabase()
    .from('items_brigade')
    .delete({ count: 'exact' })
    .eq('brigade_id', brigadeId)
    .eq('item_id', itemId);
  if (error) throw mapSupabaseError(error, 'Item');
  if (!count) throw notFound('Item');
};
