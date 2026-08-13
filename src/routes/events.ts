import { Router } from 'express';
import * as events from '../controllers/events.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { eventsLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const eventsRouter = (): Router => {
  const r = Router();
  // Public: tracking from frontend (campaign view, profile view, etc.).
  // Rate-limited below the global ceiling since it persists a row per call.
  r.post('/', eventsLimiter, asyncHandler(events.create));
  // Admin-only reads (analytics).
  r.get('/', requireAuth, requireAdmin, asyncHandler(events.list));
  r.get('/counts', requireAuth, requireAdmin, asyncHandler(events.counts));
  return r;
};
