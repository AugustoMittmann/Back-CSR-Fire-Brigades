import type { Request, Response } from 'express';
import { uuidSchema } from '../schemas/common.js';
import {
  listPublicationBrigades,
  type PublicationKind,
} from '../db/publicationBrigades.js';
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

/**
 * Handler read-only para GET /api/{campaigns|news|articles}/:id/brigades.
 * `paramName` é o nome do param mesclado pelo router aninhado (mergeParams).
 */
export const listFor =
  (kind: PublicationKind, paramName: string) =>
  async (req: Request, res: Response): Promise<void> => {
    const id = uuidSchema.parse(req.params[paramName]);
    const rows = await listPublicationBrigades(kind, id);
    res.json({ data: rows.map(toApi) });
  };
