import { z } from 'zod';
import { listQueryBase, uuidSchema } from './common.js';

export const participantBrigadeCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    image_url: z.string().trim().url().max(2_000).optional(),
    /** Optional: link this participant to a fully-registered brigade. */
    brigade_id: uuidSchema.optional(),
  })
  .strict();

export const participantBrigadeUpdateSchema = participantBrigadeCreateSchema.partial();

export const participantBrigadeListQuerySchema = listQueryBase.extend({
  search: z.string().trim().max(100).optional(),
});

export type ParticipantBrigadeCreate = z.infer<typeof participantBrigadeCreateSchema>;
export type ParticipantBrigadeUpdate = z.infer<typeof participantBrigadeUpdateSchema>;
export type ParticipantBrigadeListQuery = z.infer<typeof participantBrigadeListQuerySchema>;
