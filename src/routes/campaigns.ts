import { Router } from 'express';
import * as campaigns from '../controllers/campaigns.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const campaignsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(campaigns.list));
  r.get('/:id', asyncHandler(campaigns.get));
  r.post('/', requireAuth, asyncHandler(campaigns.create));
  r.put('/:id', requireAuth, asyncHandler(campaigns.update));
  r.delete('/:id', requireAuth, asyncHandler(campaigns.remove));
  return r;
};
