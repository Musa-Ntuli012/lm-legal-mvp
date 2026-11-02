import { Request, Response, NextFunction } from 'express';

/**
 * Content Security Policy for the API.
 * Since this is a JSON API served to a SPA, we restrict heavily.
 */
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Middleware that sets comprehensive security headers on every response.
 * Protects against XSS, clickjacking, MIME sniffing, and more.
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', CSP_POLICY);

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection (legacy, for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy - limit information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strict Transport Security (only in production over HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions Policy - disable unnecessary browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Remove X-Powered-By header if present
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Middleware that sets secure cookie defaults for session cookies.
 * Applied when setting the lm_session cookie.
 */
export function secureCookieDefaults(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalCookie = res.cookie.bind(res);

  res.cookie = (name: string, value: string, options?: any) => {
    const secureOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      ...options,
    };
    return originalCookie(name, value, secureOptions);
  };

  next();
}
