import type { Request, Response } from 'express';
import {
  participantBrigadeCreateSchema,
  participantBrigadeListQuerySchema,
  participantBrigadeUpdateSchema,
} from '../schemas/participantBrigade.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createParticipantBrigade,
  deleteParticipantBrigade,
  getParticipantBrigade,
  listParticipantBrigades,
  updateParticipantBrigade,
} from '../db/participantBrigades.js';
import type { ParticipantBrigadeRow } from '../types/domain.js';

interface ParticipantBrigadeApi {
  id: string;
  name: string;
  imageUrl: string | null;
  brigadeId: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: ParticipantBrigadeRow): ParticipantBrigadeApi => ({
  id: r.id,
  name: r.name,
  imageUrl: r.image_url,
  brigadeId: r.brigade_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = participantBrigadeListQuerySchema.parse(req.query);
  const { data, count } = await listParticipantBrigades(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getParticipantBrigade(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = participantBrigadeCreateSchema.parse(req.body);
  const row = await createParticipantBrigade(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = participantBrigadeUpdateSchema.parse(req.body);
  const row = await updateParticipantBrigade(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteParticipantBrigade(id);
  res.status(204).send();
};
