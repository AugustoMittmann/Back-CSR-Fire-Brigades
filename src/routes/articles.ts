import { Router } from 'express';
import * as articles from '../controllers/articles.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const articlesRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(articles.list));
  r.get('/:id', asyncHandler(articles.get));
  r.post('/', requireAuth, asyncHandler(articles.create));
  r.put('/:id', requireAuth, asyncHandler(articles.update));
  r.delete('/:id', requireAuth, asyncHandler(articles.remove));
  return r;
};
