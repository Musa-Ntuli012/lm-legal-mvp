import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: 'server_error',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
