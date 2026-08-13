import { Router } from 'express';
import * as profiles from '../controllers/profiles.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profilesRouter = (): Router => {
  const r = Router();
  // Self
  r.get('/me', requireAuth, asyncHandler(profiles.me));
  // Admin-readable
  r.get('/', requireAuth, requireAdmin, asyncHandler(profiles.list));
  r.get('/:id', requireAuth, requireAdmin, asyncHandler(profiles.get));
  // Privilege management is super_admin-only. createUser and update also
  // enforce, in-controller, that only a super_admin may set a privileged role
  // or toggle is_validated, and that no one may change their own role.
  r.post('/', requireAuth, requireAdmin, asyncHandler(profiles.createUser));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(profiles.update));
  r.post('/:id/validate', requireAuth, requireSuperAdmin, asyncHandler(profiles.validate));
  r.post('/:id/revoke', requireAuth, requireSuperAdmin, asyncHandler(profiles.revoke));
  return r;
};
