import { Router } from 'express';
import * as activities from '../controllers/activities.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Mounted at /api/activities. */
export const activitiesRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(activities.list));
  r.get('/:id', asyncHandler(activities.get));
  r.post('/', requireAuth, requireAdmin, asyncHandler(activities.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(activities.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(activities.remove));
  return r;
};

/** Mounted at /api/brigades/:brigadeId/activities. */
export const brigadeActivitiesRouter = (): Router => {
  const r = Router({ mergeParams: true });
  r.get('/', asyncHandler(activities.listForBrigade));
  r.put('/:activityId', requireAuth, requireAdmin, asyncHandler(activities.addForBrigade));
  r.delete('/:activityId', requireAuth, requireAdmin, asyncHandler(activities.removeForBrigade));
  return r;
};
