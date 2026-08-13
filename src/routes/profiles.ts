import { Router } from 'express';
import * as profiles from '../controllers/profiles.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profilesRouter = (): Router => {
  const r = Router();
  // Self
  r.get('/me', requireAuth, asyncHandler(profiles.me));
  // Authenticated staff endpoints (no role tiers).
  r.get('/', requireAuth, asyncHandler(profiles.list));
  r.get('/:id', requireAuth, asyncHandler(profiles.get));
  r.post('/', requireAuth, asyncHandler(profiles.createUser));
  r.put('/:id', requireAuth, asyncHandler(profiles.update));
  r.post('/:id/validate', requireAuth, asyncHandler(profiles.validate));
  r.post('/:id/revoke', requireAuth, asyncHandler(profiles.revoke));
  return r;
};
