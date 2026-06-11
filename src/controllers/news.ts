import type { Request, Response } from 'express';
import {
  newsCreateSchema,
  newsListQuerySchema,
  newsUpdateSchema,
} from '../schemas/news.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createNews,
  deleteNews,
  getNews,
  listNews,
  updateNews,
} from '../db/news.js';
import type { NewsRow } from '../types/domain.js';

interface NewsApi {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  body: string | null;
  author: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: NewsRow): NewsApi => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  summary: r.summary,
  body: r.body,
  author: r.author,
  sourceUrl: r.source_url,
  imageUrl: r.image_url,
  publishedAt: r.published_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = newsListQuerySchema.parse(req.query);
  const { data, count } = await listNews(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getNews(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = newsCreateSchema.parse(req.body);
  const row = await createNews(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = newsUpdateSchema.parse(req.body);
  const row = await updateNews(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteNews(id);
  res.status(204).send();
};
