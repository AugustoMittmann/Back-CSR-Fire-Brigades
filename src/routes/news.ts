import { Router } from 'express';
import * as news from '../controllers/news.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const newsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(news.list));
  r.get('/:id', asyncHandler(news.get));
  r.post('/', requireAuth, requireAdmin, asyncHandler(news.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(news.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(news.remove));
  return r;
};
