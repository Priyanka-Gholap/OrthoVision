import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any[];
}

export const errorHandlerMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const userMessage = err.message || 'An unexpected error occurred. Please try again or contact support.';

  // Output detailed error logs for developers in non-production, omit PHI context
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ERROR (HANDLER): [${errorCode}]`, err.stack);
  } else {
    console.error(`[${new Date().toISOString()}] ERROR (HANDLER): [${errorCode}] ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: userMessage,
      details: err.details || [],
    },
  });
};
