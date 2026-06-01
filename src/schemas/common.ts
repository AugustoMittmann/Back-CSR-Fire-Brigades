/**
 * Shared zod helpers and BR-specific enums used across resource schemas.
 */
import { z } from 'zod';

/**
 * Brazilian states (UFs). Used as an enum so any other value is rejected.
 */
export const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

export const stateSchema = z.enum(BR_STATES);

/**
 * Phone format used by the frontend: "(99) 99999-9999" (mobile) or
 * "(99) 9999-9999" (landline). We accept both, with optional + prefix.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^\+?[0-9 ()\-]{8,20}$/, 'Invalid phone format');

export const uuidSchema = z.string().uuid();

export const listQueryBase = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
  withCount: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
});
