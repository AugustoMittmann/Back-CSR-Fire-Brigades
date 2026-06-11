import type { Request, Response } from 'express';
import {
  campaignResultCreateSchema,
  campaignResultUpdateSchema,
} from '../schemas/campaignResult.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createCampaignResult,
  deleteCampaignResult,
  listCampaignResults,
  updateCampaignResult,
} from '../db/campaignResults.js';
import type { CampaignResultRow } from '../types/domain.js';

interface CampaignResultApi {
  id: string;
  campaignId: string;
  label: string;
  value: string;
  position: number;
  createdAt: string;
}

const toApi = (r: CampaignResultRow): CampaignResultApi => ({
  id: r.id,
  campaignId: r.campaign_id,
  label: r.label,
  value: r.value,
  position: r.position,
  createdAt: r.created_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const campaignId = uuidSchema.parse(req.params.campaignId);
  const rows = await listCampaignResults(campaignId);
  res.json({ data: rows.map(toApi) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const campaignId = uuidSchema.parse(req.params.campaignId);
  const body = campaignResultCreateSchema.parse(req.body);
  const row = await createCampaignResult(campaignId, body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = campaignResultUpdateSchema.parse(req.body);
  const row = await updateCampaignResult(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteCampaignResult(id);
  res.status(204).send();
};
