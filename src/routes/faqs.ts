import { Router } from 'express';
import * as faqs from '../controllers/faqs.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const faqsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(faqs.list));
  r.post('/', requireAuth, requireAdmin, asyncHandler(faqs.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(faqs.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(faqs.remove));
  return r;
};
