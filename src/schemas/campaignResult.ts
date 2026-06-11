import { z } from 'zod';

export const campaignResultCreateSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    value: z.string().trim().min(1).max(200),
    position: z.coerce.number().int().min(0).max(10_000).optional(),
  })
  .strict();

export const campaignResultUpdateSchema = campaignResultCreateSchema.partial();

export type CampaignResultCreate = z.infer<typeof campaignResultCreateSchema>;
export type CampaignResultUpdate = z.infer<typeof campaignResultUpdateSchema>;
