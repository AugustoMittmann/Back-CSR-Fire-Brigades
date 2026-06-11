import { z } from 'zod';
import { listQueryBase } from './common.js';

export const campaignCreateSchema = z
  .object({
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, 'kebab-case').optional(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2_000).optional(),
    body: z.string().trim().max(40_000).optional(),
    pix: z.string().trim().max(120).optional(),
    image_url: z.string().trim().url().max(2_000).optional(),
    start_date: z.string().datetime({ offset: true }).optional(),
    end_date: z.string().datetime({ offset: true }).optional(),
    published_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const campaignListQuerySchema = listQueryBase.extend({
  search: z.string().trim().max(100).optional(),
});

export type CampaignCreate = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
export type CampaignListQuery = z.infer<typeof campaignListQuerySchema>;
