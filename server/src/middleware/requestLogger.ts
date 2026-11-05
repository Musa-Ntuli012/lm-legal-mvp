import { Request, Response, NextFunction } from 'express';

/**
 * Structured request logging middleware.
 *
 * Logs each incoming request with method, path, status code, response time,
 * and client IP. Useful for debugging and basic audit trails.
 *
 * Log format (console):
 *   [2026-11-02T10:00:00.000Z] GET /api/health 200 5ms 127.0.0.1
 *
 * @param req - Express request.
 * @param res - Express response (used to capture status code and timing).
 * @param next - Express next function.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  // Capture the finish event to log after the response is sent.
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms ${req.ip}`
    );
  });

  next();
}
