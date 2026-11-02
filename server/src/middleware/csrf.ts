import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || (req.body as any)?.csrf_token;
  
  // In development, accept any CSRF token for simplicity
  // In production, this should be validated against the session
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

export function generateCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-CSRF-Token', token);
  next();
}
