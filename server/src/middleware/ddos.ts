import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * In-memory store for per-IP request counts.
 * Production deployments should use Redis-backed stores.
 */
const connectionCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS_PER_IP = 100;
const REQUEST_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Removes expired entries from the connection store on a timer so the map
 * does not grow unbounded.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of connectionCounts.entries()) {
    if (now > entry.resetTime) {
      connectionCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes

/**
 * Tracks requests per IP for basic rate limiting.
 * Returns 429 if an IP exceeds the request threshold within the window.
 * This is a request cap, not a concurrent-connection tracker.
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

  if (!entry || now > entry.resetTime) {
    connectionCounts.set(key, { count: 1, resetTime: now + REQUEST_WINDOW_MS });
    return next();
  }

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
 * Removes expired entries from the slow-down store on a timer.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of slowDownStore.entries()) {
    if (now > entry.resetTime) {
      slowDownStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes

/**
 * Progressive delay middleware. Adds an increasing response delay based on
 * request frequency from an IP. Helps mitigate brute-force and DDoS attacks
 * without blocking legitimate users outright.
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

  if (!entry || now > entry.resetTime) {
    slowDownStore.set(key, { count: 1, resetTime: now + SLOW_DOWN_WINDOW_MS });
    return next();
  }

  entry.count++;

  if (entry.count > SLOW_DOWN_MAX) {
    const over = entry.count - SLOW_DOWN_MAX;
    const delay = Math.min(over * SLOW_DOWN_DELAY_MS, MAX_DELAY_MS);
    // Apply the computed delay before proceeding
    setTimeout(() => next(), delay);
    return;
  }

  next();
}

/**
 * General API rate limit - applies to all /api/ routes.
 * 100 requests per 15 minutes per IP.
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
 * 5 attempts per 5 minutes per IP+email.
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
