import type { Request, Response } from 'express';
import {
  articleCreateSchema,
  articleListQuerySchema,
  articleUpdateSchema,
} from '../schemas/article.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  updateArticle,
} from '../db/articles.js';
import type { ArticleRow } from '../types/domain.js';

interface ArticleApi {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  body: string | null;
  author: string | null;
  category: 'Artigo' | 'Boas Práticas';
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: ArticleRow): ArticleApi => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  summary: r.summary,
  body: r.body,
  author: r.author,
  category: r.category,
  imageUrl: r.image_url,
  publishedAt: r.published_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = articleListQuerySchema.parse(req.query);
  const { data, count } = await listArticles(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getArticle(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = articleCreateSchema.parse(req.body);
  const row = await createArticle(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = articleUpdateSchema.parse(req.body);
  const row = await updateArticle(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteArticle(id);
  res.status(204).send();
};
