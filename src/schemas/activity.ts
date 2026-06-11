import { z } from 'zod';
import { listQueryBase } from './common.js';

const NAME_MAX = 200;

export const activityCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(NAME_MAX),
    description: z.string().trim().max(2_000).optional(),
    icon: z.string().trim().max(60).optional(),
  })
  .strict();

export const activityUpdateSchema = activityCreateSchema.partial();

export const activityListQuerySchema = listQueryBase.extend({
  search: z.string().trim().max(100).optional(),
});

export type ActivityCreate = z.infer<typeof activityCreateSchema>;
export type ActivityUpdate = z.infer<typeof activityUpdateSchema>;
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
