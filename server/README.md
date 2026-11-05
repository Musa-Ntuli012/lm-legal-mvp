# LM Legal MVP — Server

Express + TypeScript + Prisma backend for the LM Legal MVP platform.

> **Stack:** Express 4, Prisma ORM, Argon2id password hashing, Zod validation, SQLite (dev) / PostgreSQL (prod).

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Middleware Stack (in order)](#middleware-stack-in-order)
4. [Authentication Flow](#authentication-flow)
5. [Security Controls](#security-controls)
6. [Routes](#routes)
7. [Services](#services)
8. [Environment Variables](#environment-variables)
9. [Scripts](#scripts)
10. [Adding a New Route](#adding-a-new-route)
11. [Commenting Standards](#commenting-standards)

---

## Overview

The server exposes a REST JSON API at `/api/*`. All responses are JSON. Authentication is session-based via the `lm_session` HttpOnly cookie. State-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) require a valid CSRF token.

### Design Principles

- **Defense in depth**: Every request passes through suspicious-request detection, rate limiting, security headers, input sanitization, and auth before reaching the route handler.
- **Fail closed**: Invalid or missing auth returns 401/403; invalid input returns 400; unexpected errors return 500 without stack traces in production.
- **Never reveal email existence**: Password reset and email verification always return `ok: true` regardless of whether the email exists, preventing email enumeration.
- **Passwords are never sanitized**: Special characters in passwords (including `;`, `--`) are preserved exactly as entered.

---

## Project Structure

```
server/
├── .env
├── .env.example
├── eslint.config.js
├── package.json
├── package-lock.json
├── prisma/
│   ├── schema.prisma         # Database schema + datasource provider
│   ├── migrations/           # Versioned migration SQL
│   └── dev.db                # SQLite dev database (gitignored in prod)
├── src/
│   ├── index.ts              # Express app, middleware stack, route mounting
│   ├── db.ts                 # PrismaClient singleton
│   ├── middleware/
│   │   ├── auth.ts           # Session validation, role gates, membership gates
│   │   ├── csrf.ts           # CSRF token generation + validation
│   │   ├── ddos.ts           # Rate limiting, request throttle, slow-down
│   │   ├── errorHandler.ts   # Centralized error response formatter
│   │   ├── requestLogger.ts  # Structured request logging
│   │   ├── sanitize.ts       # XSS / SQL injection input sanitization
│   │   └── securityHeaders.ts # CSP, HSTS, frame options, secure cookies
│   ├── routes/
│   │   ├── auth.ts           # Sign in/up, invite, password reset, email verify
│   │   ├── admin.ts          # Admin overview, user management
│   │   ├── submissions.ts    # Student memo submission
│   │   ├── tasks.ts          # Task CRUD for markers/admins
│   │   ├── reviews.ts        # Marker review + scoring
│   │   └── progress.ts       # Student progress data
│   └── services/
│       ├── authService.ts    # Password hashing, sessions, invites, reset tokens
│       └── emailService.ts   # Email templates + SMTP transport
```

---

## Middleware Stack (in order)

The middleware stack in `src/index.ts` is ordered deliberately. Each layer runs before the next, and a failure at any layer short-circuits the request.

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | `detectSuspiciousRequest` | Logs scanners, path traversal, known attack paths (does not block) |
| 2 | `cors` | Handles preflight, restricts origins (must run before rate limiters) |
| 3 | `trust proxy` | Makes `req.ip` reflect the real client behind a reverse proxy |
| 4 | `requestThrottle` | Per-IP request cap (100/min) — renamed from connectionThrottle |
| 5 | `slowDown` | Progressive delay after 50 requests/min per IP |
| 6 | `apiRateLimit` (on `/api`) | 100 requests per 15 minutes per IP |
| 7 | `securityHeaders` | CSP, HSTS, X-Frame-Options, etc. |
| 8 | `secureCookieDefaults` | Enforces HttpOnly/SameSite/Secure on all cookies |
| 9 | `helmet` | Additional security headers |
| 10 | `express.json()` / `express.urlencoded()` | Body parsing with 1MB limit |
| 11 | `hpp()` | HTTP Parameter Pollution protection (mounted AFTER body parsing) |
| 12 | `sanitizeInput` | Strips XSS/SQL patterns from body/query/params (passwords exempt) |
| 13 | `requestLogger` | Structured request logging |
| 14 | Routes | Auth, tasks, submissions, reviews, progress, admin |

> **Why `hpp()` after body parsing:** `hpp` normalizes `req.body`. If mounted before `express.urlencoded()`, `req.body` is still a string and `hpp` cannot process form-encoded duplicate fields.

---

## Authentication Flow

### Sign-In

1. Client POSTs `{ email, password }` to `/api/auth/sign-in`.
2. `signInRateLimit` enforces 5 attempts per 5 minutes per IP+email.
3. `csrfProtection` validates the CSRF token.
4. `signService.signIn()` looks up the profile, verifies the password with Argon2id constant-time comparison.
5. On success: generates session token (32 bytes) + CSRF token (16 bytes), stores in Prisma `Session` table, sets `lm_session` cookie (8 hours, HttpOnly, SameSite=Lax, Secure in prod).
6. Returns `{ ok: true, redirect, csrf_token, user }`.

### Session Validation (`authenticate` middleware)

1. Reads `lm_session` cookie.
2. Looks up session in Prisma, checks expiry.
3. Updates `lastActiveAt`.
4. Attaches `req.profile` with `{ id, email, role, membershipStatus }`.
5. If invalid or missing, `req.profile = undefined` (request continues unauthenticated).

### Role & Membership Gates

- `requireSignIn` — 401 if no profile.
- `requireMembership` — 403 if `membershipStatus !== 'ACTIVE'`.
- `requireRoles(...allowedRoles)` — 403 if profile role not in allowed list.
- `requireMembershipGate` — alias of `requireMembership`.

---

## Security Controls

### Argon2id Password Hashing

```typescript
await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,   // 64 MiB
  timeCost: 3,         // 3 iterations
  parallelism: 4,      // 4 threads
});
```

- **Constant-time comparison** on sign-in prevents timing attacks: even when the profile is not found, the server still runs `argon2.verify()` against a dummy hash.
- Password reset invalidates all other sessions for the profile.

### CSRF Protection

- Token generated per session, stored in Prisma `Session.csrfToken`.
- Client receives `csrf_token` in sign-in/sign-up response.
- Client sends `X-CSRF-Token` header on all state-changing requests.
- `csrfProtection` middleware validates the header/body token against the session.
- Development mode accepts any token (for easier local development).

### Input Sanitization (`sanitize.ts`)

- Runs on `req.body`, `req.query`, `req.params` after body parsing.
- Removes `<script>`, `<iframe>`, `javascript:`, event handlers, `eval()`, SQL keywords, null bytes.
- **Password fields are exempt** (`password`, `newPassword`, `confirmPassword`, `currentPassword`, `passwordHash`) so existing passwords with special characters continue to work.
- Logs suspicious requests (scanners, path traversal, attack paths) but does not block.

### Rate Limiting (`ddos.ts`)

| Limiter | Key | Max | Window | Purpose |
|---------|-----|-----|--------|---------|
| `requestThrottle` | IP | 100 | 1 min | General request cap |
| `slowDown` | IP | 50 before delay | 1 min | Progressive delay for brute force |
| `apiRateLimit` | IP | 100 | 15 min | API-wide rate limit |
| `strictRateLimit` | IP + email | 5 | 5 min | Auth brute force protection |
| `inviteRateLimit` | Admin IP | 10 | 15 min | Invite spam protection |

Expired map entries are purged every 5 minutes via `setInterval`.

### Security Headers (`securityHeaders.ts`)

- **Content-Security-Policy**: Restricts scripts, styles, fonts, connections; `frame-ancestors 'none'`.
- **X-Content-Type-Options**: `nosniff`.
- **X-Frame-Options**: `DENY`.
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **Strict-Transport-Security**: `max-age=31536000` (production HTTPS only).
- **Permissions-Policy**: Disables camera, microphone, geolocation, payment, USB, sensors.
- **X-Powered-By**: Removed.

---

## Routes

### `POST /api/auth/sign-in`
Rate-limited (5/5min). Validates email+password, creates session, sets cookie. Returns redirect path based on role.

### `POST /api/auth/sign-up`
Creates a new student account. Password min 12 chars. Hashes with Argon2id.

### `POST /api/auth/invite`
Administrator-only. Rate-limited (10/15min). Creates a single-use invitation token valid 7 days.

### `POST /api/auth/accept-invite`
Consumes an invitation token, verifies email match, creates profile, sets session.

### `POST /api/auth/password-reset-request`
Generates single-use reset token (30 min). Sends email. Never reveals if email exists.

### `POST /api/auth/password-reset-confirm`
Validates token, hashes new password, invalidates all other sessions.

### `POST /api/auth/email-verification-request`
Generates verification token (7 days). Sends email.

### `POST /api/auth/email-verification-confirm`
Validates token, sets `emailVerified = true`.

### `GET /api/submissions`
Lists the authenticated student's submissions with task + review info.

### `POST /api/submissions`
Creates a submission for the current published task. Checks for duplicate submissions. Sends confirmation email (non-blocking).

### `GET /api/reviews`
Lists unmarked submissions for markers (with blind marking aliases).

### `PUT /api/reviews/:id`
Updates a draft review, sets scores, publishes marks.

### `GET /api/progress`
Returns the authenticated student's progress statistics.

### `GET /api/admin/overview`
Returns cohort statistics (active students, submissions, pending marks, active markers).

### `GET /api/health`
Returns `{ status: 'ok', timestamp }`. No auth required.

---

## Services

### `authService.ts`

- `signIn(email, password, res)` — Verify password, create session, set cookie.
- `signUp(email, password, displayName, res)` — Create profile, hash password, create session.
- `signOut(res, profileId)` — Delete sessions, clear cookie.
- `getSession(token)` — Validate session, return profile + CSRF token.
- `createInvite(email, invitedById, role)` — Create single-use invitation (7 days).
- `acceptInvite(token, email, password, displayName, res)` — Consume invite, create profile, session.
- `requestPasswordReset(email)` — Single-use token (30 min), send email.
- `confirmPasswordReset(token, newPassword)` — Validate token, update password, invalidate sessions.
- `requestEmailVerification(email)` — Single-use token (7 days), send email.
- `confirmEmailVerification(token)` — Validate token, set `emailVerified`.

### `emailService.ts`

- SMTP transport for sending emails.
- Templates: password reset, email verification, submission confirmation.
- All email sends are non-blocking (`.catch(() => {})`) so email failures never break the request.

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | `development` or `production` | `production` |
| `PORT` | No | Listen port | `3001` |
| `DATABASE_URL` | Yes | Prisma datasource URL | `file:./dev.db` or `postgresql://...` |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins | `https://app.example.com` |
| `SESSION_SECRET` | Yes (prod) | Session signing secret | `openssl rand -hex 32` |
| `COOKIE_SECURE` | No | `true` only behind HTTPS | `true` |
| `APP_URL` | No | Base URL for email links | `https://app.example.com` |
| `SMTP_HOST` | No | SMTP server host | `smtp.example.com` |
| `SMTP_PORT` | No | SMTP port | `587` |
| `SMTP_USER` | No | SMTP username | `user@example.com` |
| `SMTP_PASS` | No | SMTP password | `...` |
| `SMTP_FROM` | No | From address | `noreply@example.com` |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with `tsx watch` (auto-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server from `dist/` |
| `npm run lint` | ESLint on `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | vitest |
| `npm run seed` | Seed demo data |
| `npm run studio` | Prisma Studio GUI |

---

## Adding a New Route

1. Create the route file in `src/routes/` (e.g., `src/routes/items.ts`).
2. Define Zod validation schemas for the request body.
3. Apply middleware in this order: `authenticate`, role/membership gates, `csrfProtection`, rate limits (if needed).
4. Validate input with `schema.safeParse(req.body)`.
5. Return appropriate HTTP status codes: 200 (success), 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server error).
6. Mount the route in `src/index.ts`: `app.use('/api/items', itemRoutes)`.
7. Add detailed inline comments explaining purpose, parameters, security implications, and examples.
8. Run `npm run lint`, `npm run typecheck`, and `npm run build`.

---

## Commenting Standards

Every file, function, middleware, and route handler must include:

```
/**
 * One-line summary of purpose.
 *
 * Detailed explanation of what the code does, why it exists, and any
 * security or performance implications.
 *
 * @param {Type} paramName - Description of the parameter.
 * @returns {Type} Description of the return value.
 * @throws {Error} Description of error conditions.
 *
 * @example
 * // Usage example
 * const result = doSomething(input);
 */
```

See `server/src/middleware/sanitize.ts` and `server/src/index.ts` for reference implementations.
