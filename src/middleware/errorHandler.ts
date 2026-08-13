/**
 * Central error middleware. The ONLY place that formats error responses.
 *
 * - HttpError → its status/code/message, plus optional details.
 * - ZodError  → 400 validation_error with field-level issue list.
 * - Anything else → generic 500. Server-side log captures the full error.
 *
 * Never leaks: stack traces, internal codes, env values, Supabase details.
 */
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError.js';
import { logger } from '../config/logger.js';

interface ErrorBody {
  error: {
    message: string;
    code: string;
    requestId: string;
    details?: unknown;
  };
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // pino-http widens req.id to (string | number | object); ours is always a
  // string by virtue of the requestId middleware running first.
  const requestId = String(req.id);

  // CORS rejections (both preflight and actual cross-origin requests) come
  // through as plain Errors with our message.
  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    res.status(403).json({
      error: { message: 'Origin not allowed', code: 'cors_denied', requestId },
    } satisfies ErrorBody);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Invalid request',
        code: 'validation_error',
        requestId,
        details: err.flatten(),
      },
    } satisfies ErrorBody);
    return;
  }

  if (err instanceof HttpError) {
    const body: ErrorBody = {
      error: { message: err.message, code: err.code, requestId },
    };
    if (err.details !== undefined) body.error.details = err.details;
    res.status(err.status).json(body);
    return;
  }

  // Body-parser size limit produces an error with type 'entity.too.large'.
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.too.large') {
    res.status(413).json({
      error: { message: 'Payload too large', code: 'payload_too_large', requestId },
    } satisfies ErrorBody);
    return;
  }

  // Last resort. Log the real error; respond generically.
  logger.error({ err, reqId: requestId }, '[error] unhandled');
  res.status(500).json({
    error: { message: 'Internal Server Error', code: 'internal_error', requestId },
  } satisfies ErrorBody);
};
