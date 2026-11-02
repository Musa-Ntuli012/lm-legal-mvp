import { Request, Response, NextFunction } from 'express';

// In-memory store for development - production should use Redis or database
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getClientId(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body as any)?.email || '';
  return `${ip}:${email}`;
}

export function signInRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const key = getClientId(req);
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + 5 * 60 * 1000 });
    return next();
  }

  if (entry.count >= 5) {
    return res.status(429).json({
      error: 'too_many_attempts',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
  }

  entry.count++;
  next();
}

export function submissionRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `submission:${ip}`;
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + 60 * 1000 });
    return next();
  }

  if (entry.count >= 30) {
    return res.status(429).json({
      error: 'too_many_submissions',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
  }

  entry.count++;
  next();
}
