import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export type ValidatorFn = (body: any) => string[] | null;

export const validateBody = (validator: ValidatorFn) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validator(req.body);
    if (errors && errors.length > 0) {
      const error: AppError = new Error('Input validation failed. Please check the requested fields.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = errors;
      return next(error);
    }
    next();
  };
};
