import { z } from 'zod';
import { listQueryBase } from './common.js';

export const ARTICLE_CATEGORIES = ['Artigo', 'Boas Práticas'] as const;

const TITLE_MAX = 200;
const SUBTITLE_MAX = 300;
const TEXT_LONG = 40_000;
const URL_MAX = 2_000;

export const articleCreateSchema = z
  .object({
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, 'kebab-case').optional(),
    title: z.string().trim().min(1).max(TITLE_MAX),
    subtitle: z.string().trim().max(SUBTITLE_MAX).optional(),
    summary: z.string().trim().max(2_000).optional(),
    body: z.string().trim().max(TEXT_LONG).optional(),
    author: z.string().trim().max(120).optional(),
    category: z.enum(ARTICLE_CATEGORIES).optional(),
    image_url: z.string().trim().url().max(URL_MAX).optional(),
    published_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const articleUpdateSchema = articleCreateSchema.partial();

export const articleListQuerySchema = listQueryBase.extend({
  category: z.enum(ARTICLE_CATEGORIES).optional(),
  search: z.string().trim().max(100).optional(),
});

export type ArticleCreate = z.infer<typeof articleCreateSchema>;
export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;
export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;
