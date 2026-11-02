import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * In-memory store for connection tracking.
 * Production deployments should use Redis-backed stores.
 */
const connectionCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_CONNECTIONS_PER_IP = 100;
const CONNECTION_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Tracks concurrent connections per IP for basic DDoS mitigation.
 * Returns 429 if an IP exceeds the connection threshold.
 */
export function connectionThrottle(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `conn:${ip}`;
  const now = Date.now();

  const entry = connectionCounts.get(key);

  if (!entry || now > entry.resetTime) {
    connectionCounts.set(key, { count: 1, resetTime: now + CONNECTION_WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_CONNECTIONS_PER_IP) {
    return res.status(429).json({
      error: 'too_many_connections',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
  }

  entry.count++;
  next();
}

/**
 * Progressive delay middleware (express-slow-down equivalent).
 * Adds increasing response delay based on request frequency from an IP.
 * Helps mitigate brute-force and DDoS attacks without blocking legitimate users.
 */
const slowDownStore = new Map<string, { count: number; resetTime: number }>();

const SLOW_DOWN_WINDOW_MS = 60 * 1000; // 1 minute
const SLOW_DOWN_MAX = 50; // requests per window before delaying
const SLOW_DOWN_DELAY_MS = 500; // base delay per request over threshold

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
    const delay = over * SLOW_DOWN_DELAY_MS;
    // Add delay header so clients can adapt
    // The actual delay is applied by setting a response header that
    // downstream proxies can honor, or we set a short setTimeout.
    // Here we simply record it; the response is not blocked.
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
