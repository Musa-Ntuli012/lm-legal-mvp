import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * In-memory store for per-IP request counts.
 * Key format: `req:<ip>`. Value: { count, resetTime }.
 *
 * WARNING: This is in-memory and does NOT survive restarts or scale across
 * multiple server instances. Production deployments with multiple nodes
 * should replace this with a Redis-backed store.
 */
const connectionCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS_PER_IP = 100;
const REQUEST_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Periodic cleanup timer.
 * Removes expired entries from connectionCounts every 5 minutes so the map
 * does not grow unbounded over time (memory leak prevention).
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of connectionCounts.entries()) {
    if (now > entry.resetTime) {
      connectionCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Request throttle middleware.
 *
 * Caps the number of requests per IP within a 1-minute window. This is a
 * REQUEST CAP, not a concurrent-connection tracker — each request increments
 * the counter regardless of whether the connection remains open.
 *
 * Returns 429 `{ error: 'too_many_requests', retryAfter }` when the limit
 * is exceeded.
 *
 * Mounted globally in index.ts — affects all routes, not just /api.
 *
 * @param req - Express request.
 * @param res - Express response.
 * @param next - Express next function.
 * @returns void | Response (returns 429 response when rate-limited).
 */
export function requestThrottle(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `req:${ip}`;
  const now = Date.now();

  const entry = connectionCounts.get(key);

  // New window or first request from this IP.
  if (!entry || now > entry.resetTime) {
    connectionCounts.set(key, { count: 1, resetTime: now + REQUEST_WINDOW_MS });
    return next();
  }

  // Limit exceeded.
  if (entry.count >= MAX_REQUESTS_PER_IP) {
    return res.status(429).json({
      error: 'too_many_requests',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
  }

  entry.count++;
  next();
}

const slowDownStore = new Map<string, { count: number; resetTime: number }>();

const SLOW_DOWN_WINDOW_MS = 60 * 1000; // 1 minute
const SLOW_DOWN_MAX = 50; // requests per window before delaying
const SLOW_DOWN_DELAY_MS = 500; // base delay per request over threshold
const MAX_DELAY_MS = 30000; // cap total delay at 30 seconds

/**
 * Periodic cleanup timer for slowDownStore (every 5 minutes).
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of slowDownStore.entries()) {
    if (now > entry.resetTime) {
      slowDownStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Progressive slow-down middleware.
 *
 * Adds an increasing response delay based on request frequency from an IP.
 * After 50 requests in a minute, each additional request is delayed by
 * 500ms * (requests_over_limit), capped at 30 seconds.
 *
 * This helps mitigate brute-force and DDoS attacks without blocking
 * legitimate users outright. The delay is applied via setTimeout before
 * calling next().
 *
 * @param req - Express request.
 * @param _res - Express response (unused).
 * @param next - Express next function.
 */
export function slowDown(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `slow:${ip}`;
  const now = Date.now();

  const entry = slowDownStore.get(key);

  // New window or first request from this IP.
  if (!entry || now > entry.resetTime) {
    slowDownStore.set(key, { count: 1, resetTime: now + SLOW_DOWN_WINDOW_MS });
    return next();
  }

  entry.count++;

  // Apply progressive delay for requests above the threshold.
  if (entry.count > SLOW_DOWN_MAX) {
    const over = entry.count - SLOW_DOWN_MAX;
    const delay = Math.min(over * SLOW_DOWN_DELAY_MS, MAX_DELAY_MS);
    setTimeout(() => next(), delay);
    return;
  }

  next();
}

/**
 * General API rate limit — applies to all /api/ routes.
 * 100 requests per 15 minutes per IP.
 *
 * Uses express-rate-limit with standard headers (RateLimit-Limit, etc.).
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'too_many_requests',
    retryAfter: 900,
  },
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limit for authentication endpoints.
 * 5 attempts per 5 minutes per IP + email combination.
 *
 * Keyed by IP + email so that multiple users sharing an IP (e.g., behind a
 * NAT) do not interfere with each other's auth attempts.
 */
export const strictRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'too_many_attempts',
    retryAfter: 300,
  },
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = (req.body as any)?.email || 'unknown';
    return `${ip}:${email}`;
  },
});

/**
 * Rate limit for invite creation (admin endpoint).
 * 10 invites per 15 minutes per admin.
 */
export const inviteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'too_many_invites',
    retryAfter: 900,
  },
});
