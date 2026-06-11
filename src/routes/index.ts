import { Router } from 'express';
import { activitiesRouter, brigadeActivitiesRouter } from './activities.js';
import { articlesRouter } from './articles.js';
import { brigadesRouter } from './brigades.js';
import { campaignsRouter } from './campaigns.js';
import { campaignResultsRouter } from './campaignResults.js';
import { contactsRouter } from './contacts.js';
import { eventsRouter } from './events.js';
import { faqsRouter } from './faqs.js';
import { brigadeItemsRouter, itemsRouter } from './items.js';
import { newsRouter } from './news.js';
import { participantBrigadesRouter } from './participantBrigades.js';
import { profilesRouter } from './profiles.js';
import { statsRouter } from './stats.js';

export const apiRouter = (): Router => {
  const r = Router();

  // Brigades + nested resources (items/activities per brigade)
  const brigades = brigadesRouter();
  brigades.use('/:brigadeId/items', brigadeItemsRouter());
  brigades.use('/:brigadeId/activities', brigadeActivitiesRouter());
  r.use('/brigades', brigades);

  // Campaigns + nested results
  const campaigns = campaignsRouter();
  campaigns.use('/:campaignId/results', campaignResultsRouter());
  r.use('/campaigns', campaigns);

  r.use('/news', newsRouter());
  r.use('/articles', articlesRouter());
  r.use('/items', itemsRouter());
  r.use('/activities', activitiesRouter());
  r.use('/participant-brigades', participantBrigadesRouter());
  r.use('/profiles', profilesRouter());
  r.use('/events', eventsRouter());

  // Existing
  r.use('/contacts', contactsRouter());
  r.use('/faqs', faqsRouter());
  r.use('/stats', statsRouter());

  return r;
};
