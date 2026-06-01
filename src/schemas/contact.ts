/**
 * Contact zod schemas.
 *
 * Frontend posts camelCase fields directly from the contactPage form. We
 * accept those names and transform to snake_case before the controller
 * touches them, so the repo only ever sees the canonical DB shape.
 *
 * - terms is z.literal(true): the form-side checkbox MUST be checked.
 * - website is a honeypot: any non-empty value is treated as a bot signal
 *   by the controller (silent 200, no DB write).
 */
import { z } from 'zod';
import { listQueryBase, phoneSchema, stateSchema } from './common.js';

export const CONTACT_REASONS = [
  'VOLUNTARIO',
  'DOACAO',
  'FALAR_BRIGADA',
  'CADASTRO',
  'ADMINISTRADOR',
] as const;

export const contactCreateInputSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: phoneSchema.optional(),
    state: stateSchema.optional(),
    city: z.string().trim().max(120).optional(),
    contactReason: z.enum(CONTACT_REASONS),
    brigade: z.string().trim().uuid().optional(),
    message: z.string().trim().min(1).max(2000),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Terms must be accepted' }),
    }),
    /** Honeypot — must be empty or omitted. Bots will fill it. */
    website: z.string().max(0).optional(),
  })
  .strict();

/** Post-transform shape: camelCase mapped to DB snake_case columns. */
export const contactCreateSchema = contactCreateInputSchema.transform((v) => ({
  name: v.name,
  email: v.email,
  phone: v.phone,
  state: v.state,
  city: v.city,
  contact_reason: v.contactReason,
  brigade_id: v.brigade,
  message: v.message,
  terms_accepted: v.terms,
}));

export const contactListQuerySchema = listQueryBase.extend({
  contact_reason: z.enum(CONTACT_REASONS).optional(),
});

export type ContactCreate = z.infer<typeof contactCreateSchema>;
export type ContactListQuery = z.infer<typeof contactListQuerySchema>;
