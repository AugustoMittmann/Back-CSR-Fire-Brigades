import { Router } from 'express';
import * as campaigns from '../controllers/campaigns.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const campaignsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(campaigns.list));
  r.get('/:id', asyncHandler(campaigns.get));
  r.post('/', requireAuth, requireAdmin, asyncHandler(campaigns.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(campaigns.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(campaigns.remove));
  return r;
};
