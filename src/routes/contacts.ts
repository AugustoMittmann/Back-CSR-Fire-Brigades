import { Router } from 'express';
import * as contacts from '../controllers/contacts.js';
import { requireAuth } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const contactsRouter = (): Router => {
  const r = Router();
  // Public submission, but rate-limited. The route-level limiter runs BEFORE
  // body parsing in middleware order — express-rate-limit happens after the
  // global json parser already loaded, but it still gates the controller.
  r.post('/', contactLimiter, asyncHandler(contacts.create));
  // Authenticated-only: the list returns submitter PII (name/email/phone/message).
  r.get('/', requireAuth, asyncHandler(contacts.list));
  return r;
};
