/**
 * Catches requests that didn't match any route and forwards a 404 HttpError
 * to the central error handler. Mounted as the last route.
 */
import type { RequestHandler } from 'express';
import { HttpError } from '../errors/HttpError.js';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'not_found', 'Route not found'));
};
