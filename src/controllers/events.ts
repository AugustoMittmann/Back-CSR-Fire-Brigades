import type { Request, Response } from 'express';
import {
  eventCountsQuerySchema,
  eventCreateSchema,
  eventListQuerySchema,
} from '../schemas/event.js';
import {
  createEvent,
  getEventCounts,
  listEvents,
  type EventCountRow,
} from '../db/events.js';
import type { EventRow } from '../types/domain.js';

interface EventApi {
  id: string;
  eventType: string;
  targetType: string | null;
  targetId: string | null;
  sessionId: string | null;
  occurredAt: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const toApi = (r: EventRow): EventApi => ({
  id: r.id,
  eventType: r.event_type,
  targetType: r.target_type,
  targetId: r.target_id,
  sessionId: r.session_id,
  occurredAt: r.occurred_at,
  metadata: r.metadata,
  createdAt: r.created_at,
});

interface EventCountApi {
  eventType: string;
  targetType: string | null;
  targetId: string | null;
  quantity: number;
}

const toCountApi = (r: EventCountRow): EventCountApi => ({
  eventType: r.event_type,
  targetType: r.target_type,
  targetId: r.target_id,
  quantity: r.quantity,
});

/** Public: anyone can fire tracking events. Always returns 202 quickly. */
export const create = async (req: Request, res: Response): Promise<void> => {
  const body = eventCreateSchema.parse(req.body);
  await createEvent(body);
  res.status(202).json({ accepted: true });
};

/** Admin-only: full event list with filters. */
export const list = async (req: Request, res: Response): Promise<void> => {
  const q = eventListQuerySchema.parse(req.query);
  const { data, count } = await listEvents(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

/** Admin-only: aggregated counts via the event_counts view. */
export const counts = async (req: Request, res: Response): Promise<void> => {
  const q = eventCountsQuerySchema.parse(req.query);
  const rows = await getEventCounts(q);
  res.json({ data: rows.map(toCountApi) });
};
