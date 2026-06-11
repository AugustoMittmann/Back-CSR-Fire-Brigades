import { z } from 'zod';
import { listQueryBase, uuidSchema } from './common.js';

const TYPE_MAX = 80;

export const eventCreateSchema = z
  .object({
    event_type: z.string().trim().min(1).max(TYPE_MAX),
    target_type: z.string().trim().max(TYPE_MAX).optional(),
    target_id: uuidSchema.optional(),
    session_id: uuidSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
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
