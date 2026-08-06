import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Audit Logs constraint - exclude query string parameters or body fields that may contain PHI (patient names, medical ids)
  const auditUrl = originalUrl.split('?')[0];

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log format matching ERROR_HANDLING.md specifications
    const logString = `[${new Date().toISOString()}] INFO (HTTP): ${method} ${auditUrl} - Status: ${statusCode} - Time: ${duration}ms`;
    
    if (statusCode >= 400) {
      console.warn(`\x1b[33m%s\x1b[0m`, logString); // Warning color for errors
    } else {
      console.log(logString);
    }
  });

  next();
};
