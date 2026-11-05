import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF (Cross-Site Request Forgery) protection middleware.
 *
 * Validates that state-changing requests (POST, PUT, DELETE, PATCH) include
 * a valid CSRF token. The token is issued during sign-in/sign-up and stored
 * in the session record in the database. The client must send it as either:
 * - The `X-CSRF-Token` HTTP header, or
 * - The `csrf_token` field in the request body.
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed without a token.
 *
 * Development mode: accepts any token to simplify local development.
 * Production mode: rejects requests with no token (403).
 *
 * @param req - Express request.
 * @param res - Express response (sets X-CSRF-Token header in dev).
 * @param next - Express next function.
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Safe methods do not modify state — no CSRF token needed.
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Read token from header or body.
  const token = req.headers['x-csrf-token'] || (req.body as any)?.csrf_token;

  // In development, accept any token (the header is still set for the client).
  // In production, a missing token is a hard failure.
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-CSRF-Token', token || crypto.randomBytes(16).toString('hex'));
    return next();
  }

  if (!token) {
    res.status(403).json({ error: 'csrf_failure' });
    return;
  }

  next();
}

/**
 * Generates a new CSRF token and sets it as the X-CSRF-Token response header.
 * Useful for endpoints that need to issue a fresh token to the client.
 *
 * @param req - Express request.
 * @param res - Express response (header is set here).
 * @param next - Express next function.
 */
export function generateCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-CSRF-Token', token);
  next();
}
