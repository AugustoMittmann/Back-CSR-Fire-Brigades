import { Router } from 'express';
import * as events from '../controllers/events.js';
import { requireAuth } from '../middleware/auth.js';
import { eventsLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const eventsRouter = (): Router => {
  const r = Router();
  // Public: tracking from frontend (campaign view, profile view, etc.).
  // Rate-limited below the global ceiling since it persists a row per call.
  r.post('/', eventsLimiter, asyncHandler(events.create));
  // Authenticated reads (analytics).
  r.get('/', requireAuth, asyncHandler(events.list));
  r.get('/counts', requireAuth, asyncHandler(events.counts));
  return r;
};
