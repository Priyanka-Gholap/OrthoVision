import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export const requireInternalKey = (req: Request, res: Response, next: NextFunction): void => {
  const serviceKey = req.header('X-AI-SERVICE-KEY');

  if (!serviceKey || serviceKey !== env.AI_SERVICE_KEY) {
    const error: AppError = new Error('Unauthorized internal service access. Invalid or missing X-AI-SERVICE-KEY.');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED_SERVICE_CALL';
    return next(error);
  }

  next();
};
