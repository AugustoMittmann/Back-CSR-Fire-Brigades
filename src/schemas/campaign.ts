import { z } from 'zod';
import { listQueryBase } from './common.js';

export const CAMPAIGN_CATEGORIES = [
  'Campanha',
  'Boas Práticas',
  'Artigo',
  'Notícia',
] as const;

export const campaignCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2_000).optional(),
    body: z.string().trim().max(40_000).optional(),
    category: z.enum(CAMPAIGN_CATEGORIES).optional(),
    category_color: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{3,8}$/, 'Expected hex color')
      .max(9)
      .optional(),
    image_url: z.string().trim().url().max(2_000).optional(),
    published_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const campaignListQuerySchema = listQueryBase.extend({
  category: z.enum(CAMPAIGN_CATEGORIES).optional(),
});

export type CampaignCreate = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
export type CampaignListQuery = z.infer<typeof campaignListQuerySchema>;
