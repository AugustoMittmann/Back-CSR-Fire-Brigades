import { z } from 'zod';

export const faqCreateSchema = z
  .object({
    question: z.string().trim().min(1).max(500),
    answer: z.string().trim().min(1).max(5_000),
    position: z.coerce.number().int().min(0).max(10_000).optional(),
  })
  .strict();

export const faqUpdateSchema = faqCreateSchema.partial();

export type FaqCreate = z.infer<typeof faqCreateSchema>;
export type FaqUpdate = z.infer<typeof faqUpdateSchema>;
