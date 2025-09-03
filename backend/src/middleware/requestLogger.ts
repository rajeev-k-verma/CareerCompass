import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const start = Date.now();

  // Log request
  logger.http(`${req.method} ${req.url} - ${req.ip}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
    originalEnd.call(this, chunk, encoding);
  };

  next();
};
