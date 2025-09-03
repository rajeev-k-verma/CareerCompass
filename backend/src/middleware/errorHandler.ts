import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types/api';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { statusCode = 500, message, stack } = err;

  // Log the error
  logger.error({
    error: message,
    stack: stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  const response: ApiResponse = {
    success: false,
    error: message || 'Internal Server Error',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.data = { stack };
  }

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route not found - ${req.originalUrl}`,
  };

  res.status(404).json(response);
};

export const createError = (
  message: string, 
  statusCode: number = 500
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Async error handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
