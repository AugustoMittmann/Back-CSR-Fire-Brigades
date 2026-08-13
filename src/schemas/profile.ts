import { z } from 'zod';
import { listQueryBase } from './common.js';

/**
 * POST /api/profiles — creates a new user via Supabase Auth admin API.
 * The user is auto-confirmed (no email verification flow). Password rules
 * follow Supabase defaults; project min is 12 to discourage weak passwords.
 */
export const profileCreateSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(12).max(72),
    display_name: z.string().trim().max(120).optional(),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    display_name: z.string().trim().max(120).optional(),
    is_validated: z.boolean().optional(),
  })
  .strict();

export const profileListQuerySchema = listQueryBase.extend({
  is_validated: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
  search: z.string().trim().max(100).optional(),
});

export type ProfileCreate = z.infer<typeof profileCreateSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type ProfileListQuery = z.infer<typeof profileListQuerySchema>;
