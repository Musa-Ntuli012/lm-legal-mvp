import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handler middleware.
 *
 * Catches errors thrown anywhere in the application and returns a
 * consistent JSON error response. In production, error details are
 * suppressed to prevent leaking stack traces or internal information
 * to clients.
 *
 * If headers have already been sent (e.g., error occurred after response
 * started), the handler defers to Express's default error handling.
 *
 * @param err - The caught error.
 * @param _req - Express request (unused).
 * @param res - Express response (error JSON is sent here).
 * @param _next - Express next function (unused — this is the terminal handler).
 */
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

  // If the response has already started, we cannot modify it.
  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: 'server_error',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
