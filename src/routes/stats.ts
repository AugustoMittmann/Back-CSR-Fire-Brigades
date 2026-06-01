import { Router } from 'express';
import * as stats from '../controllers/stats.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const statsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(stats.get));
  return r;
};
