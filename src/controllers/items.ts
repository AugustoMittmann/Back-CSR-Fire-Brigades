import type { Request, Response } from 'express';
import {
  itemBrigadeUpsertSchema,
  itemCreateSchema,
  itemListQuerySchema,
  itemUpdateSchema,
} from '../schemas/item.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createItem,
  deleteItem,
  getItem,
  listBrigadeItems,
  listItems,
  removeBrigadeItem,
  updateItem,
  upsertBrigadeItem,
  type BrigadeItemJoined,
} from '../db/items.js';
import type { ItemBrigadeRow, ItemRow } from '../types/domain.js';

interface ItemApi {
  id: string;
  name: string;
  defaultValue: number | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: ItemRow): ItemApi => ({
  id: r.id,
  name: r.name,
  defaultValue: r.default_value,
  unit: r.unit,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

interface BrigadeItemApi {
  itemId: string;
  name: string | null;
  unit: string | null;
  /** Effective value: brigade override if set, otherwise catalog default. */
  value: number | null;
  /** Brigade-specific override (null when using catalog default). */
  overrideValue: number | null;
  defaultValue: number | null;
  quantityNeeded: number | null;
}

const toBrigadeItemApi = (r: BrigadeItemJoined): BrigadeItemApi => ({
  itemId: r.item_id,
  name: r.item?.name ?? null,
  unit: r.item?.unit ?? null,
  value: r.value ?? r.item?.default_value ?? null,
  overrideValue: r.value,
  defaultValue: r.item?.default_value ?? null,
  quantityNeeded: r.quantity_needed,
});

// ----- catalog -----

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = itemListQuerySchema.parse(req.query);
  const { data, count } = await listItems(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getItem(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = itemCreateSchema.parse(req.body);
  const row = await createItem(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = itemUpdateSchema.parse(req.body);
  const row = await updateItem(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteItem(id);
  res.status(204).send();
};

// ----- nested under brigades -----

export const listForBrigade = async (req: Request, res: Response): Promise<void> => {
  const brigadeId = uuidSchema.parse(req.params.brigadeId);
  const rows = await listBrigadeItems(brigadeId);
  res.json({ data: rows.map(toBrigadeItemApi) });
};

export const upsertForBrigade = async (req: Request, res: Response): Promise<void> => {
  const brigadeId = uuidSchema.parse(req.params.brigadeId);
  const itemId = uuidSchema.parse(req.params.itemId);
  const body = itemBrigadeUpsertSchema.parse(req.body);
  const row: ItemBrigadeRow = await upsertBrigadeItem(brigadeId, itemId, body);
  res.status(200).json({
    data: {
      brigadeId: row.brigade_id,
      itemId: row.item_id,
      value: row.value,
      quantityNeeded: row.quantity_needed,
    },
  });
};

export const removeForBrigade = async (req: Request, res: Response): Promise<void> => {
  const brigadeId = uuidSchema.parse(req.params.brigadeId);
  const itemId = uuidSchema.parse(req.params.itemId);
  await removeBrigadeItem(brigadeId, itemId);
  res.status(204).send();
};
