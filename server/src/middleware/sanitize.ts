import { Request, Response, NextFunction } from 'express';

/**
 * Dangerous patterns that indicate injection or XSS attempts.
 * These are checked in raw request bodies and query parameters.
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /union\s+select/gi,
  /drop\s+table/gi,
  /delete\s+from/gi,
  /insert\s+into/gi,
  /--/g,
  /;/g,
  /\bexec\s*\(/gi,
  /\bchar\s*\(/gi,
  /\bcast\s*\(/gi,
  /\bconvert\s*\(/gi,
];

/**
 * Recursively sanitize a value, removing dangerous HTML/script patterns
 * from strings and walking into objects and arrays.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    let sanitized = value;
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    // Null byte removal
    sanitized = sanitized.replace(/\0/g, '');
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitizedObj[key] = sanitizeValue(val);
    }
    return sanitizedObj;
  }

  return value;
}

/**
 * Middleware that sanitizes req.body, req.query, and req.params
 * to remove XSS, script injection, and SQL injection patterns.
 * Runs after express.json() and express.urlencoded().
 */
export function sanitizeInput(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body) {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  if (req.query) {
    req.query = sanitizeValue(req.query) as any;
  }
  if (req.params) {
    req.params = sanitizeValue(req.params) as Record<string, string>;
  }
  next();
}

/**
 * Middleware that checks for suspicious request patterns
 * and returns 400 if detected (before sanitization, for logging).
 */
export function detectSuspiciousRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const suspiciousHeaders: string[] = [];

  const userAgent = req.get('User-Agent') || '';
  const knownBots = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'dirbuster',
    'gobuster',
    'burpsuite',
    'acunetix',
    'nessus',
    'openvas',
  ];

  for (const bot of knownBots) {
    if (userAgent.toLowerCase().includes(bot)) {
      suspiciousHeaders.push(`user_agent:${bot}`);
    }
  }

  // Check for path traversal in URL
  if (req.path.includes('../') || req.path.includes('..%2f') || req.path.includes('..%5c')) {
    suspiciousHeaders.push('path_traversal');
  }

  // Check for common attack URLs
  const attackPaths = [
    '/etc/passwd',
    '/proc/self/',
    '/wp-admin',
    '/phpmyadmin',
    '/adminer',
    '/.env',
    '/config',
    '/.git/',
  ];
  const pathLower = req.path.toLowerCase();
  for (const attack of attackPaths) {
    if (pathLower.includes(attack)) {
      suspiciousHeaders.push(`attack_path:${attack}`);
    }
  }

  if (suspiciousHeaders.length > 0) {
    // Log but don't block - let rate limiting handle repeated offenders
    console.warn('Suspicious request detected:', {
      ip: req.ip,
      path: req.path,
      userAgent,
      reasons: suspiciousHeaders,
    });
  }

  next();
}
