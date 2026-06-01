/**
 * Contact controllers.
 *
 * POST is public. We:
 *  1. validate the camelCase input from the frontend form,
 *  2. silently drop honeypot hits with a 201 (no DB write, no signal to bots),
 *  3. transform to snake_case via the schema,
 *  4. insert.
 *
 * GET is admin-only (auth on the route).
 */
import type { Request, Response } from 'express';
import {
  contactCreateInputSchema,
  contactCreateSchema,
  contactListQuerySchema,
} from '../schemas/contact.js';
import { insertContact, listContacts } from '../db/contacts.js';
import { logger } from '../config/logger.js';
import type { ContactRow } from '../types/domain.js';

interface ContactApi {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  contactReason: string;
  brigadeId: string | null;
  message: string;
  termsAccepted: boolean;
  createdAt: string;
}

const toApi = (r: ContactRow): ContactApi => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  state: r.state,
  city: r.city,
  contactReason: r.contact_reason,
  brigadeId: r.brigade_id,
  message: r.message,
  termsAccepted: r.terms_accepted,
  createdAt: r.created_at,
});

export const create = async (req: Request, res: Response): Promise<void> => {
  // Validate the raw camelCase input first so we can detect honeypot hits
  // before the snake_case transform strips the field.
  const input = contactCreateInputSchema.parse(req.body);

  if (input.website && input.website.length > 0) {
    logger.warn(
      { reqId: req.id, ip: req.ip },
      '[contacts] honeypot hit — silently dropping submission',
    );
    res.status(201).json({ data: { id: 'ok' } });
    return;
  }

  const row = await insertContact(contactCreateSchema.parse(input));
  res.status(201).json({ data: { id: row.id } });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = contactListQuerySchema.parse(req.query);
  const { data, count } = await listContacts(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};
