import { Router } from 'express';
import * as news from '../controllers/news.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const newsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(news.list));
  r.get('/:id', asyncHandler(news.get));
  r.post('/', requireAuth, asyncHandler(news.create));
  r.put('/:id', requireAuth, asyncHandler(news.update));
  r.delete('/:id', requireAuth, asyncHandler(news.remove));
  return r;
};
