import type { Request, Response } from 'express';
import { faqCreateSchema, faqUpdateSchema } from '../schemas/faq.js';
import { uuidSchema } from '../schemas/common.js';
import { createFaq, deleteFaq, listFaqs, updateFaq } from '../db/faqs.js';
import type { FaqRow } from '../types/domain.js';

interface FaqApi {
  id: string;
  question: string;
  answer: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: FaqRow): FaqApi => ({
  id: r.id,
  question: r.question,
  answer: r.answer,
  position: r.position,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (_req: Request, res: Response): Promise<void> => {
  const rows = await listFaqs();
  res.json({ data: rows.map(toApi) });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = faqCreateSchema.parse(req.body);
  const row = await createFaq(body);
  res.status(201).json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  const patch = faqUpdateSchema.parse(req.body);
  const row = await updateFaq(id, patch);
  res.json({ data: toApi(row) });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = uuidSchema.parse(req.params.id);
  await deleteFaq(id);
  res.status(204).send();
};
