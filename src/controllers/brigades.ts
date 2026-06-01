/**
 * Brigade controllers. Validate input with zod, call the repo, shape the
 * response. The response converts snake_case rows to camelCase API shape.
 */
import type { Request, Response } from 'express';
import {
  brigadeCreateSchema,
  brigadeListQuerySchema,
  brigadeUpdateSchema,
} from '../schemas/brigade.js';
import { uuidSchema } from '../schemas/common.js';
import {
  createBrigade,
  deleteBrigade,
  getBrigade,
  listBrigades,
  updateBrigade,
} from '../db/brigades.js';
import type { BrigadeRow } from '../types/domain.js';

interface BrigadeApi {
  id: string;
  name: string;
  description: string | null;
  presentation: string | null;
  email: string | null;
  phoneNumber: string | null;
  instagram: string | null;
  pix: string | null;
  actingArea: string | null;
  volunteers: number;
  foundation: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  brigadeId: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: BrigadeRow): BrigadeApi => ({
  id: r.id,
  name: r.name,
  description: r.description,
  presentation: r.presentation,
  email: r.email,
  phoneNumber: r.phone_number,
  instagram: r.instagram,
  pix: r.pix,
  actingArea: r.acting_area,
  volunteers: r.volunteers,
  foundation: r.foundation,
  address: r.address,
  state: r.state,
  city: r.city,
  latitude: r.latitude,
  longitude: r.longitude,
  imageUrl: r.image_url,
  brigadeId: r.brigade_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = brigadeListQuerySchema.parse(req.query);
  const { data, count } = await listBrigades(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const row = await getBrigade(id);
  res.json({ data: toApi(row) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = brigadeCreateSchema.parse(req.body);
  const row = await createBrigade(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = brigadeUpdateSchema.parse(req.body);
  const row = await updateBrigade(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteBrigade(id);
  res.status(204).send();
};
