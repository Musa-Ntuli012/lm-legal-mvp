import { Request, Response, NextFunction } from 'express';

/**
 * Content Security Policy for API responses.
 *
 * Since this is a JSON API consumed by a SPA, the policy is restrictive:
 * - default-src: self only
 * - script-src: self + unsafe-inline + unsafe-eval (needed for dev tooling)
 * - style-src: self + unsafe-inline + Google Fonts
 * - font-src: self + Google Fonts
 * - img-src: self + data:
 * - connect-src: self only
 * - frame-ancestors: 'none' (prevents clickjacking)
 * - base-uri: self
 * - form-action: self
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
 *
 * Headers set:
 * - Content-Security-Policy: Restricts script, style, font, image, and connection sources.
 * - X-Content-Type-Options: nosniff (prevents MIME type sniffing).
 * - X-Frame-Options: DENY (prevents clickjacking via iframes).
 * - X-XSS-Protection: 1; mode=block (legacy XSS filter for older browsers).
 * - Referrer-Policy: strict-origin-when-cross-origin (limits referrer information leakage).
 * - Strict-Transport-Security: max-age=1 year (production HTTPS only, forces HTTPS).
 * - Permissions-Policy: Disables camera, microphone, geolocation, payment, USB, and sensor APIs.
 * - X-Powered-By: Removed (hides server technology).
 *
 * @param _req - Express request (unused).
 * @param res - Express response (headers are set here).
 * @param next - Express next function.
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('Content-Security-Policy', CSP_POLICY);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Middleware that wraps res.cookie to enforce secure defaults on all cookies.
 *
 * All cookies set through this wrapper get:
 * - httpOnly: true (prevents JavaScript access, mitigates XSS cookie theft)
 * - sameSite: 'lax' (mitigates CSRF)
 * - secure: true in production (HTTPS only)
 * - path: '/'
 *
 * Individual options can still override these defaults per-cookie.
 *
 * @param _req - Express request (unused).
 * @param res - Express response (cookie method is wrapped).
 * @param next - Express next function.
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
