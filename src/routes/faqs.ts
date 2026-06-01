import { Router } from 'express';
import * as faqs from '../controllers/faqs.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const faqsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(faqs.list));
  r.post('/', requireAuth, asyncHandler(faqs.create));
  r.put('/:id', requireAuth, asyncHandler(faqs.update));
  r.delete('/:id', requireAuth, asyncHandler(faqs.remove));
  return r;
};
