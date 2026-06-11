/**
 * News zod schemas. Inbound bodies use snake_case (matches DB) — admin-only,
 * same convention as brigades/campaigns.
 */
import { z } from 'zod';
import { listQueryBase } from './common.js';

const TITLE_MAX = 200;
const SUBTITLE_MAX = 300;
const TEXT_LONG = 40_000;
const URL_MAX = 2_000;

export const newsCreateSchema = z
  .object({
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, 'kebab-case').optional(),
    title: z.string().trim().min(1).max(TITLE_MAX),
    subtitle: z.string().trim().max(SUBTITLE_MAX).optional(),
    summary: z.string().trim().max(2_000).optional(),
    body: z.string().trim().max(TEXT_LONG).optional(),
    author: z.string().trim().max(120).optional(),
    source_url: z.string().trim().url().max(URL_MAX).optional(),
    image_url: z.string().trim().url().max(URL_MAX).optional(),
    published_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const newsUpdateSchema = newsCreateSchema.partial();

export const newsListQuerySchema = listQueryBase.extend({
  search: z.string().trim().max(100).optional(),
});

export type NewsCreate = z.infer<typeof newsCreateSchema>;
export type NewsUpdate = z.infer<typeof newsUpdateSchema>;
export type NewsListQuery = z.infer<typeof newsListQuerySchema>;
