import { Router } from 'express';
import * as participants from '../controllers/participantBrigades.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const participantBrigadesRouter = (): Router => {
  const r = Router();
  r.get('/', asyncHandler(participants.list));
  r.get('/:id', asyncHandler(participants.get));
  r.post('/', requireAuth, asyncHandler(participants.create));
  r.put('/:id', requireAuth, asyncHandler(participants.update));
  r.delete('/:id', requireAuth, asyncHandler(participants.remove));
  return r;
};
