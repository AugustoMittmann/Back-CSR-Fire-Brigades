import type { Request, Response } from 'express';
import {
  activityCreateSchema,
  activityListQuerySchema,
  activityUpdateSchema,
} from '../schemas/activity.js';
import { uuidSchema } from '../schemas/common.js';
import {
  addBrigadeActivity,
  createActivity,
  deleteActivity,
  getActivity,
  listActivities,
  listBrigadeActivities,
  removeBrigadeActivity,
  updateActivity,
  type BrigadeActivityJoined,
} from '../db/activities.js';
import type { ActivityRow } from '../types/domain.js';

interface ActivityApi {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: ActivityRow): ActivityApi => ({
  id: r.id,
  name: r.name,
  description: r.description,
  icon: r.icon,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

interface BrigadeActivityApi {
  activityId: string;
  name: string | null;
  description: string | null;
  icon: string | null;
}

const toBrigadeActivityApi = (r: BrigadeActivityJoined): BrigadeActivityApi => ({
  activityId: r.activity_id,
  name: r.activity?.name ?? null,
  description: r.activity?.description ?? null,
  icon: r.activity?.icon ?? null,
});

// ----- catalog -----

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = activityListQuerySchema.parse(req.query);
  const { data, count } = await listActivities(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getActivity(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = activityCreateSchema.parse(req.body);
  const row = await createActivity(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = activityUpdateSchema.parse(req.body);
  const row = await updateActivity(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteActivity(id);
  res.status(204).send();
};

// ----- nested under brigades -----

export const listForBrigade = async (req: Request, res: Response): Promise<void> => {
  const brigadeId = uuidSchema.parse(req.params.brigadeId);
  const rows = await listBrigadeActivities(brigadeId);
  res.json({ data: rows.map(toBrigadeActivityApi) });
};

export const addForBrigade = async (req: Request, res: Response): Promise<void> => {
  const brigadeId = uuidSchema.parse(req.params.brigadeId);
  const activityId = uuidSchema.parse(req.params.activityId);
  await addBrigadeActivity(brigadeId, activityId);
  res.status(204).send();
};

export const removeForBrigade = async (req: Request, res: Response): Promise<void> => {
  const brigadeId = uuidSchema.parse(req.params.brigadeId);
  const activityId = uuidSchema.parse(req.params.activityId);
  await removeBrigadeActivity(brigadeId, activityId);
  res.status(204).send();
};
