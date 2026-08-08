import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt/token';
import { AppError } from './errorHandler';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

// Helper to manually parse HttpOnly cookies from req.headers.cookie
const getCookie = (cookieHeader: string | undefined, name: string): string | null => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | null = null;

  // 1. Check for token in cookies
  if (req.headers.cookie) {
    token = getCookie(req.headers.cookie, 'token');
  }

  // 2. Fallback to Authorization Header (Postman/API Client calls)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error: AppError = new Error('Access denied. Authentication token is missing.');
    error.statusCode = 401;
    error.code = 'INVALID_TOKEN';
    return next(error);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user details (id, role) to request
    next();
  } catch (err: any) {
    const error: AppError = new Error(
      err.name === 'TokenExpiredError' 
        ? 'Your session has expired. Please log in again.' 
        : 'Invalid authentication token.'
    );
    error.statusCode = 401;
    error.code = err.name === 'TokenExpiredError' ? 'SESSION_EXPIRED' : 'INVALID_TOKEN';
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }
    next();
  };
};
