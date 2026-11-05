import { Request, Response, NextFunction } from 'express';

/**
 * Field names that must never be rewritten by sanitization.
 *
 * Passwords are verified against a stored Argon2id hash. Stripping characters
 * such as `;` or `--` from a password before comparison would break existing
 * passwords and lock users out of their accounts. These fields are passed
 * through untouched.
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'newPassword',
  'confirmPassword',
  'currentPassword',
]);

/**
 * Dangerous patterns that indicate XSS or SQL injection attempts.
 * Each pattern is matched case-insensitively and removed from string values.
 *
 * Patterns include:
 * - <script> and <iframe> tags
 * - javascript: and vbscript: protocols
 * - Event handlers (onload, onerror, onclick, onmouseover)
 * - eval() and expression()
 * - SQL keywords (union select, drop table, delete from, insert into)
 * - SQL functions (exec, char, cast, convert)
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
  /\bexec\s*\(/gi,
  /\bchar\s*\(/gi,
  /\bcast\s*\(/gi,
  /\bconvert\s*\(/gi,
];

/**
 * Recursively sanitizes a value, removing dangerous patterns from strings
 * and walking into objects and arrays.
 *
 * Sensitive fields (passwords) are identified by their object key and are
 * returned untouched.
 *
 * @param value - The value to sanitize (string, object, array, or primitive).
 * @param key - The object key for this value (used to detect sensitive fields).
 * @returns The sanitized value.
 */
function sanitizeValue(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    // Never rewrite sensitive fields such as passwords.
    if (key && SENSITIVE_FIELDS.has(key.toLowerCase())) {
      return value;
    }
    let sanitized = value;
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    // Remove null bytes which can be used in injection attacks.
    sanitized = sanitized.replace(/\0/g, '');
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map((v, i) => sanitizeValue(v, String(i)));
  }

  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(value)) {
      sanitizedObj[k] = sanitizeValue(val, k);
    }
    return sanitizedObj;
  }

  return value;
}

/**
 * Middleware that sanitizes req.body, req.query, and req.params.
 *
 * Must be mounted AFTER express.json() and express.urlencoded() so that the
 * body is already parsed into an object before sanitization walks it.
 *
 * Password fields are exempt from pattern stripping to avoid breaking
 * existing passwords that contain special characters.
 *
 * @param req - Express request (body/query/params are sanitized in place).
 * @param _res - Express response (unused).
 * @param next - Express next function.
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
 * Middleware that detects suspicious request patterns and logs them.
 *
 * Checks for:
 * - Known security scanner user agents (sqlmap, nikto, nmap, burpsuite, etc.)
 * - Path traversal attempts (../, ..%2f, ..%5c)
 * - Common attack URL paths (/etc/passwd, /wp-admin, /.env, /.git/, etc.)
 *
 * Does NOT block — logging only. Rate limiting handles repeated offenders.
 *
 * @param req - Express request.
 * @param _res - Express response (unused).
 * @param next - Express next function.
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

  // Check for path traversal in URL path.
  if (
    req.path.includes('../') ||
    req.path.includes('..%2f') ||
    req.path.includes('..%5c')
  ) {
    suspiciousHeaders.push('path_traversal');
  }

  // Check for common attack paths.
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
    console.warn('Suspicious request detected:', {
      ip: req.ip,
      path: req.path,
      userAgent,
      reasons: suspiciousHeaders,
    });
  }

  next();
}
