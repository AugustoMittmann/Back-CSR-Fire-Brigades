/**
 * Wraps async route handlers so thrown errors flow into the central error
 * middleware via next(err).
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (fn: AsyncHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
