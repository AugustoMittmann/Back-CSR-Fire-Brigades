import { Router } from 'express';
import * as items from '../controllers/items.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Catalog-level routes mounted at /api/items.
 * Brigade-scoped routes (e.g. /api/brigades/:brigadeId/items/...) are wired
 * separately so they can sit under the brigades sub-tree.
 */
export const itemsRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(items.list));
  r.get('/:id', asyncHandler(items.get));
  r.post('/', requireAuth, requireAdmin, asyncHandler(items.create));
  r.put('/:id', requireAuth, requireAdmin, asyncHandler(items.update));
  r.delete('/:id', requireAuth, requireAdmin, asyncHandler(items.remove));
  return r;
};

/** Mounted under /api/brigades/:brigadeId/items. */
export const brigadeItemsRouter = (): Router => {
  const r = Router({ mergeParams: true });
  r.get('/', asyncHandler(items.listForBrigade));
  r.put('/:itemId', requireAuth, requireAdmin, asyncHandler(items.upsertForBrigade));
  r.delete('/:itemId', requireAuth, requireAdmin, asyncHandler(items.removeForBrigade));
  return r;
};
