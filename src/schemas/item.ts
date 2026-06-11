import { z } from 'zod';
import { listQueryBase, uuidSchema } from './common.js';

const NAME_MAX = 200;

export const itemCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(NAME_MAX),
    default_value: z.coerce.number().min(0).max(1_000_000_000).optional(),
    unit: z.string().trim().max(40).optional(),
  })
  .strict();

export const itemUpdateSchema = itemCreateSchema.partial();

export const itemListQuerySchema = listQueryBase.extend({
  search: z.string().trim().max(100).optional(),
});

/** Body for POST/PUT /api/brigades/:id/items/:itemId */
export const itemBrigadeUpsertSchema = z
  .object({
    value: z.coerce.number().min(0).max(1_000_000_000).optional(),
    quantity_needed: z.coerce.number().int().min(0).max(1_000_000).optional(),
  })
  .strict();

/** Catalog item id used in URL params. */
export const itemIdSchema = uuidSchema;

export type ItemCreate = z.infer<typeof itemCreateSchema>;
export type ItemUpdate = z.infer<typeof itemUpdateSchema>;
export type ItemListQuery = z.infer<typeof itemListQuerySchema>;
export type ItemBrigadeUpsert = z.infer<typeof itemBrigadeUpsertSchema>;
