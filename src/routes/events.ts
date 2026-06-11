import { Router } from 'express';
import * as events from '../controllers/events.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const eventsRouter = (): Router => {
  const r = Router();
  // Public: tracking from frontend (campaign view, profile view, etc.).
  r.post('/', asyncHandler(events.create));
  // Admin-only reads.
  r.get('/', requireAuth, asyncHandler(events.list));
  r.get('/counts', requireAuth, asyncHandler(events.counts));
  return r;
};
