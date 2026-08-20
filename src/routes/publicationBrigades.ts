import { Router } from 'express';
import { listFor } from '../controllers/publicationBrigades.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { PublicationKind } from '../db/publicationBrigades.js';

/**
 * Router aninhado read-only para as brigadas participantes de uma publicação.
 * Montado em /api/campaigns/:campaignId/brigades (e news/articles análogos).
 */
export const publicationBrigadesRouter = (
  kind: PublicationKind,
  paramName: string,
): Router => {
  const r = Router({ mergeParams: true });
  r.get('/', asyncHandler(listFor(kind, paramName)));
  return r;
};
