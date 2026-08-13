import { Router } from 'express';
import * as campaignResults from '../controllers/campaignResults.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Mounted at /api/campaigns/:campaignId/results. */
export const campaignResultsRouter = (): Router => {
  const r = Router({ mergeParams: true });
  r.get('/', asyncHandler(campaignResults.list));
  r.post('/', requireAuth, requireAdmin, asyncHandler(campaignResults.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(campaignResults.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(campaignResults.remove));
  return r;
};
