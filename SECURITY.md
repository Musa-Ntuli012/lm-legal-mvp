# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.0   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities by emailing the maintainers. Do not create public GitHub issues for security concerns.

## Security Measures Implemented

### Authentication & Authorization
- **Password hashing**: Argon2id with memoryCost=65536, timeCost=3, parallelism=4
- **Session management**: Secure, HttpOnly, SameSite=Lax cookies with 8-hour expiration
- **CSRF protection**: Token-based CSRF validation on all state-changing requests
- **Role-based access**: STUDENT, MARKER, ADMINISTRATOR roles with granular middleware
- **Membership gating**: Inactive membership blocks access to paid features
- **Constant-time comparison**: Prevents timing attacks on password verification
- **Email enumeration prevention**: Password reset/email verification never reveals if an email exists

### Input Validation & Sanitization
- **Zod schemas**: All request bodies validated against strict schemas
- **XSS prevention**: Script tags, event handlers, and dangerous patterns stripped from input
- **SQL injection prevention**: Prisma ORM with parameterized queries
- **HTTP Parameter Pollution**: `hpp` middleware prevents parameter pollution attacks
- **Request size limits**: 1MB maximum body size
- **Null byte removal**: Strips null bytes from all input

### Rate Limiting & DDoS Protection
- **General API rate limit**: 100 requests per 15 minutes per IP
- **Auth rate limit**: 5 attempts per 5 minutes per IP+email
- **Submission rate limit**: 30 submissions per minute per IP
- **Connection throttle**: 100 connections per minute per IP
- **Progressive slow-down**: Increasing delays for excessive requests
- **Invite rate limit**: 10 invites per 15 minutes per admin

### Security Headers
- **Content Security Policy**: Restricts scripts, styles, fonts, and connections
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Strict-Transport-Security**: max-age=31536000 (production HTTPS only)
- **Permissions-Policy**: Disables camera, microphone, geolocation, etc.
- **X-Powered-By**: Removed

### Data Protection
- **Audit logging**: All sign-in, sign-up, invitation, and admin actions logged
- **Password reset**: Single-use tokens, 30-minute expiry, invalidates all other sessions
- **Email verification**: Single-use tokens, 7-day expiry
- **Invitations**: Single-use tokens, 7-day expiry, email matching enforced
- **Blind marking**: Marker aliases hide student identities during review

### Infrastructure
- **CORS**: Restricted to configured origins only
- **Database**: PostgreSQL with Prisma ORM
- **Secrets**: Environment variables for all sensitive configuration

## Known Limitations

- Rate limiting uses in-memory storage (Redis recommended for production multi-instance deploys)
- CSRF protection accepts any token in development mode
- No Web Application Firewall (WAF) configured by default

## Penetration Testing

If you wish to perform penetration testing, please contact the maintainers first for authorization and scope.
