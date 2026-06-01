import { Router } from 'express';
import { brigadesRouter } from './brigades.js';
import { contactsRouter } from './contacts.js';
import { campaignsRouter } from './campaigns.js';
import { faqsRouter } from './faqs.js';
import { statsRouter } from './stats.js';

export const apiRouter = (): Router => {
  const r = Router();
  r.use('/brigades', brigadesRouter());
  r.use('/contacts', contactsRouter());
  r.use('/campaigns', campaignsRouter());
  r.use('/faqs', faqsRouter());
  r.use('/stats', statsRouter());
  return r;
};
