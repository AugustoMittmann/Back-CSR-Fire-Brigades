import { z } from 'zod';
import { listQueryBase, uuidSchema } from './common.js';

const TYPE_MAX = 80;

// Bound the free-form metadata blob so a public, unauthenticated caller can't
// persist deeply nested / oversized jsonb. Keys and string values are capped,
// values are restricted to JSON primitives, and the whole object is limited to
// a small number of entries plus a serialized-size ceiling.
const metadataSchema = z
  .record(
    z.string().max(64),
    z.union([z.string().max(500), z.number(), z.boolean(), z.null()]),
  )
  .refine((obj) => Object.keys(obj).length <= 30, {
    message: 'metadata has too many keys (max 30)',
  })
  .refine((obj) => JSON.stringify(obj).length <= 2048, {
    message: 'metadata is too large (max 2KB serialized)',
  });

export const eventCreateSchema = z
  .object({
    event_type: z.string().trim().min(1).max(TYPE_MAX),
    target_type: z.string().trim().max(TYPE_MAX).optional(),
    target_id: uuidSchema.optional(),
    session_id: uuidSchema.optional(),
    metadata: metadataSchema.optional(),
  })
  .strict();

export const eventListQuerySchema = listQueryBase.extend({
  event_type: z.string().trim().max(TYPE_MAX).optional(),
  target_type: z.string().trim().max(TYPE_MAX).optional(),
  target_id: uuidSchema.optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export const eventCountsQuerySchema = z
  .object({
    event_type: z.string().trim().max(TYPE_MAX).optional(),
    target_type: z.string().trim().max(TYPE_MAX).optional(),
    target_id: uuidSchema.optional(),
  })
  .strict();

export type EventCreate = z.infer<typeof eventCreateSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
export type EventCountsQuery = z.infer<typeof eventCountsQuerySchema>;
