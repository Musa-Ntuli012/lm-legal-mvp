import { Request, Response, NextFunction } from 'express';

/**
 * In-memory store for sign-in rate limiting.
 * Key format: `ip:email`. Value: { count, resetTime }.
 *
 * WARNING: In-memory store does not survive restarts or scale across
 * multiple server instances. Production deployments should use Redis.
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Extracts a client identifier from the request.
 * Uses IP address combined with email (if present in body) so that multiple
 * users sharing an IP do not interfere with each other's sign-in attempts.
 *
 * @param req - Express request.
 * @returns Client identifier string.
 */
function getClientId(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body as any)?.email || '';
  return `${ip}:${email}`;
}

/**
 * Sign-in rate limit middleware.
 *
 * Limits authentication attempts to 5 per 5 minutes per IP+email combination.
 * Protects against brute-force password guessing without blocking legitimate
 * users who share an IP (e.g., behind a corporate NAT).
 *
 * Returns 429 `{ error: 'too_many_attempts', retryAfter }` when exceeded.
 *
 * @param req - Express request.
 * @param res - Express response.
 * @param next - Express next function.
 * @returns void | Response (returns 429 when rate-limited).
 */
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

/**
 * Submission rate limit middleware.
 *
 * Limits memo submissions to 30 per minute per IP address.
 * Prevents spam submissions while allowing normal student usage.
 *
 * @param req - Express request.
 * @param res - Express response.
 * @param next - Express next function.
 * @returns void | Response (returns 429 when rate-limited).
 */
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
