import { Router } from 'express';
import * as brigades from '../controllers/brigades.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const brigadesRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(brigades.list));
  r.get('/:id', asyncHandler(brigades.get));
  r.post('/', requireAuth, requireAdmin, asyncHandler(brigades.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(brigades.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(brigades.remove));
  return r;
};
