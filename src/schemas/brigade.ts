/**
 * Brigade zod schemas. Inbound bodies use snake_case (matches DB) for both
 * brigade and campaign because no frontend form posts these directly — they
 * are admin-only and the API client can adopt the canonical column shape.
 *
 * (The /api/contacts schema is the only one that bridges the frontend's
 * camelCase form fields to DB snake_case, and lives in schemas/contact.ts.)
 */
import { z } from 'zod';
import { listQueryBase, stateSchema } from './common.js';

const NAME_MAX = 200;
const TEXT_LONG = 4_000;
const URL_MAX = 2_000;

export const brigadeCreateSchema = z
  .object({
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, 'kebab-case').optional(),
    name: z.string().trim().min(1).max(NAME_MAX),
    description: z.string().trim().max(TEXT_LONG).optional(),
    presentation: z.string().trim().max(TEXT_LONG).optional(),
    email: z.string().trim().email().max(254).optional(),
    phone_number: z.string().trim().max(40).optional(),
    instagram: z.string().trim().max(120).optional(),
    pix: z.string().trim().max(120).optional(),
    acting_area: z.string().trim().max(200).optional(),
    volunteers: z.coerce.number().int().min(0).max(1_000_000).optional(),
    foundation: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD').optional(),
    address: z.string().trim().max(300).optional(),
    state: stateSchema.optional(),
    city: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    image_url: z.string().trim().url().max(URL_MAX).optional(),
    external_code: z.string().trim().max(64).optional(),
  })
  .strict();

export const brigadeUpdateSchema = brigadeCreateSchema.partial();

export const brigadeListQuerySchema = listQueryBase.extend({
  state: stateSchema.optional(),
  city: z.string().trim().max(120).optional(),
  search: z.string().trim().max(100).optional(),
});

export type BrigadeCreate = z.infer<typeof brigadeCreateSchema>;
export type BrigadeUpdate = z.infer<typeof brigadeUpdateSchema>;
export type BrigadeListQuery = z.infer<typeof brigadeListQuerySchema>;
