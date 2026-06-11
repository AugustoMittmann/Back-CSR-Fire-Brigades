import { Router } from 'express';
import * as profiles from '../controllers/profiles.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profilesRouter = (): Router => {
  const r = Router();
  // Self
  r.get('/me', requireAuth, asyncHandler(profiles.me));
  // Admin-only
  r.get('/', requireAuth, requireAdmin, asyncHandler(profiles.list));
  r.post('/', requireAuth, requireAdmin, asyncHandler(profiles.createUser));
  r.get('/:id', requireAuth, requireAdmin, asyncHandler(profiles.get));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(profiles.update));
  r.post('/:id/validate', requireAuth, requireAdmin, asyncHandler(profiles.validate));
  r.post('/:id/revoke',   requireAuth, requireAdmin, asyncHandler(profiles.revoke));
  return r;
};
