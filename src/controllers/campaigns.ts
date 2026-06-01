import type { Request, Response } from 'express';
import {
  campaignCreateSchema,
  campaignListQuerySchema,
  campaignUpdateSchema,
} from '../schemas/campaign.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
} from '../db/campaigns.js';
import type { CampaignRow } from '../types/domain.js';

interface CampaignApi {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  category: string | null;
  categoryColor: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: CampaignRow): CampaignApi => ({
  id: r.id,
  title: r.title,
  description: r.description,
  body: r.body,
  category: r.category,
  categoryColor: r.category_color,
  imageUrl: r.image_url,
  publishedAt: r.published_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = campaignListQuerySchema.parse(req.query);
  const { data, count } = await listCampaigns(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getCampaign(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = campaignCreateSchema.parse(req.body);
  const row = await createCampaign(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = campaignUpdateSchema.parse(req.body);
  const row = await updateCampaign(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteCampaign(id);
  res.status(204).send();
};
