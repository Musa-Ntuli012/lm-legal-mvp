# LM Legal MVP

Practical legal training platform for South African law graduates. Students work through real legal matters, submit memos, and receive rubric-based feedback from practising markers. Administrators manage users, tasks, and audit trails.

> **Environment:** React 18 + Vite (frontend), Express + Prisma + SQLite (backend), TypeScript throughout.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Available Scripts](#available-scripts)
5. [Design System (Frontend)](#design-system-frontend)
6.  Security Architecture](#security-architecture)
7. [Authentication & Sessions](#authentication--sessions)
8. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
9. [Input Validation & Sanitization](#input-validation--sanitization)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [API Reference](#api-reference)
12. [Contributing](#contributing)
13. [License](#license)

---

## Architecture Overview

The application is a monorepo with three workspaces managed by npm workspaces at the root:

```
lm-legal-mvp/
├── client/          # React + Vite SPA (frontend)
├── server/          # Express + Prisma API (backend)
└── shared/          # TypeScript types shared between client and server
```

### Data Flow

1. **Client** makes authenticated API calls to `/api/*` endpoints.
2. **Server** validates the session cookie (`lm_session`), checks CSRF tokens on state-changing requests, sanitizes input, enforces rate limits, then processes the request via Prisma against SQLite.
3. **Audit logging** records sign-ins, sign-ups, invitations, and admin actions for compliance.

### Role Model

| Role | Can |
|------|-----|
| `STUDENT` | View matters, submit work, read feedback, export portfolio |
| `MARKER` | View marking queue, score submissions, publish marks |
| `ADMINISTRATOR` | Manage users/invites, task builder, audit log, system overview |

---

## Project Structure

```
lm-legal-mvp/
├── .github/workflows/        # GitHub Actions CI/CD (ci.yml, security.yml)
├── client/
│   ├── index.html            # SPA entry point with security meta tags
│   ├── tailwind.config.js    # Design tokens (colors, typography, spacing)
│   ├── vite.config.ts        # Vite build configuration
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Route definitions + BrowserRouter
│   │   ├── index.css         # Design system component CSS classes
│   │   ├── components/
│   │   │   └── Layout.tsx    # Shell: header, nav, footer, auth links
│   │   ├── hooks/
│   │   │   └── useAuth.ts    # Session + CSRF token management
│   │   ├── services/
│   │   │   └── api.ts        # Fetch wrapper with auth headers
│   │   └── pages/            # 19 page components (Landing, Dashboard, Matter, etc.)
├── server/
│   ├── .env.example          # Production environment template
│   ├── eslint.config.js      # ESLint flat config
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (SQLite dev, PostgreSQL prod)
│   │   └── migrations/       # Prisma migration SQL files
│   ├── src/
│   │   ├── index.ts          # Express app + security middleware stack
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts       # Session auth, role/membership gates
│   │   │   ├── csrf.ts       # CSRF token generation + validation
│   │   │   ├── ddos.ts       # Rate limiting, connection throttle, slow-down
│   │   │   ├── errorHandler.ts # Centralized error responses
│   │   │   ├── requestLogger.ts # Structured request logging
│   │   │   ├── sanitize.ts   # XSS / SQL injection input sanitization
│   │   │   └── securityHeaders.ts # CSP, HSTS, frame options, etc.
│   │   ├── routes/
│   │   │   ├── auth.ts       # Sign in/up, invite, password reset, email verify
│   │   │   ├── admin.ts      # Admin overview, user management
│   │   │   ├── submissions.ts # Student memo submission
│   │   │   ├── tasks.ts      # Task CRUD for markers/admins
│   │   │   ├── reviews.ts    # Marker review + scoring
│   │   │   └── progress.ts   # Student progress data
│   │   └── services/
│   │       ├── authService.ts # Password hashing, sessions, invites, reset tokens
│   │       └── emailService.ts # Email templates + SMTP transport
└── shared/
    └── types/
        └── index.ts          # Shared TypeScript interfaces (Role, Profile, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- (Optional) Docker for PostgreSQL in production

### Installation

```bash
# 1. Extract the repository
unzip lm-legal-mvp.zip
cd lm-legal-mvp

# 2. Install all workspace dependencies (root, client, server)
npm ci

# 3. Generate the Prisma client
cd server
npx prisma generate
cd ..

# 4. Run database migrations
cd server
npx prisma migrate deploy
cd ..

# 5. Seed the database (optional - creates demo users)
cd server
npm run seed
cd ..

# 6. Start both services in development
npm run dev
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and adjust for your environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | Server listen port | `3001` |
| `DATABASE_URL` | Prisma datasource URL (SQLite or PostgreSQL) | `file:./dev.db` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173` |
| `SESSION_SECRET` | Secret for signing sessions | *(required in production)* |
| `COOKIE_SECURE` | Set `true` only behind HTTPS | `false` |
| `APP_URL` | Base URL for password-reset emails | `http://localhost:5173` |

Generate a strong session secret:

```bash
openssl rand -hex 32
```

### Access Points

| Service | URL (dev) |
|---------|-----------|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:3001` |
| Prisma Studio | `npm run studio` (server dir) |

Demo credentials (after seeding):

| Email | Role | Password |
|-------|------|----------|
| `student@lmlegal.demo` | Student | `StudentDemo2026!` |
| `investor@lmlegal.demo` | Marker | *(generated, printed on seed)* |
| `admin@lmlegal.demo` | Administrator | *(generated, printed on seed)* |

---

## Available Scripts

### Root

| Script | Description |
|--------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run build` | Build server + client for production |
| `npm run lint` | Run ESLint on server + client |
| `npm run typecheck` | Run `tsc --noEmit` on server + client |
| `npm run test` | Run vitest on server + client |
| `npm run seed` | Seed the database with demo data |

### Server (`server/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server from `dist/` |
| `npm run lint` | ESLint on `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | vitest |
| `npm run seed` | Seed demo data |
| `npm run studio` | Prisma Studio GUI |

### Client (`client/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint on `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | vitest |

---

## Design System (Frontend)

The frontend implements a 1:1 match to the design tile skeletons.

### Color Tokens

| Token | Light | Dark |
|-------|-------|------|
| Canvas (background) | `#F7F3EC` | `#0B1017` |
| Raised (card surface) | `#FDFBF7` | `#111823` |
| Sunken (input surface) | `#E9E1CD` | `#172130` |
| Text (primary) | `#0B1726` | `#ECE7DB` |
| Secondary | `#3E4A5A` | `#B4B0A4` |
| Muted | `#566170` | `#8E8B80` |
| Brass (accent) | `#7A5A1E` | `#C8A56A` |
| Primary | `#14263F` | `#C8A56A` |
| Border (control) | `#8A8577` | `#6F7886` |
| Error | `#A32A2A` | `#F08A8A` |
| Success | `#1F6B4A` | `#6CCBA0` |
| Warning | `#8A5A00` | `#E3B35A` |

### Typography

| Scale | Size | Weight | Leading |
|-------|------|--------|---------|
| Display | 34px | 700 (bold) | tight |
| Title | 22px | 600 (semibold) | — |
| Body | 17px | 400 (regular) | 1.5 |
| Caption 14 | 14px | 400 | — |
| Caption 13 | 13px | 400 | — |

Font: **Geist** (loaded from Google Fonts, fallbacks to system sans-serif).

### Component Standards

- **Touch targets**: Minimum 44x44px for all interactive elements.
- **Focus ring**: 2px brass (`#7A5A1E` light / `#C8A56A` dark) with 2px offset.
- **No dashes**: No em/en/hyphen dashes in any visible user-facing text.
- **No emojis/icons**: Text labels only.
- **Animations**: `fade-in`, `slide-in`, `cross-fade` (respects `prefers-reduced-motion`).
- **Theme**: Light by default; `.dark` class on `<html>` switches to dark theme.

### CSS Utility Classes (in `index.css`)

| Class | Purpose |
|-------|---------|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger` | Button variants |
| `.card`, `.card-sunken`, `.card-lift` | Card containers with hover elevation |
| `.input` | Styled text input with focus ring |
| `.label` | Form field label |
| `.badge`, `.badge-published`, `.badge-draft`, etc. | Status chips |
| `.text-display`, `.text-title`, `.text-body`, `.text-caption-13/14` | Typography scale |
| `.req-id` | Requirement ID tag |
| `.page-enter` | Page entry animation |

---

## Security Architecture

### Defense in Depth

1. **Transport**: HTTPS-only cookies in production (`Secure`, `SameSite=Lax`, `HttpOnly`).
2. **Authentication**: Argon2id password hashing (memoryCost=65536, timeCost=3, parallelism=4), constant-time comparison to prevent timing attacks.
3. **Session**: 8-hour session tokens, single sign-out invalidates all other sessions, password reset invalidates all sessions.
4. **CSRF**: Token-based validation on all state-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`).
5. **CORS**: Restricted to configured origins only; credentials enabled.
6. **Rate Limiting**: Per-IP request caps, auth attempt limits, submission limits, invite limits.
7. **Input Sanitization**: XSS, script injection, and SQL pattern stripping from all `req.body`, `req.query`, `req.params`. Passwords are never modified.
8. **HTTP Parameter Pollution**: `hpp()` middleware prevents duplicate parameter attacks.
9. **Security Headers**: CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
10. **Audit Logging**: All auth and admin actions logged to the database.
11. **Email Enumeration Prevention**: Password reset and email verification never reveal whether an email exists.

### Known Limitations

- Rate limiting uses in-memory maps (use Redis for multi-instance production deploys).
- CSRF accepts any token in development mode.
- No WAF configured by default.

---

## Authentication & Sessions

### Session Lifecycle

1. User signs in with email + password.
2. Server verifies password with Argon2id constant-time comparison.
3. Server generates a 32-byte session token and 16-byte CSRF token.
4. Session token set as `lm_session` cookie (8-hour expiry, HttpOnly, SameSite=Lax).
5. CSRF token returned in response body; client includes it as `X-CSRF-Token` header on mutations.
6. On subsequent requests, `authenticate` middleware validates the cookie, looks up the session in Prisma, updates `lastActiveAt`, and attaches `req.profile`.
7. `requireMembership` gate blocks access if `membershipStatus !== 'ACTIVE'`.
8. `requireRoles(...)` gate restricts endpoints by role.

### Password Reset

1. User requests reset → single-use token generated, valid 30 minutes, stored in DB.
2. Reset email sent (non-blocking).
3. User confirms with token + new password → password hashed, all other sessions invalidated, token marked used.
4. Never reveals whether the email exists.

### Email Verification

1. Single-use token, valid 7 days.
2. Verification email sent.
3. Confirmation sets `emailVerified = true`, marks token used.

---

## Rate Limiting & DDoS Protection

| Middleware | Scope | Limit | Window |
|------------|-------|-------|--------|
| `requestThrottle` | All requests | 100 requests per IP | 1 minute |
| `slowDown` | All requests | Progressive delay after 50 req/min | 1 minute |
| `apiRateLimit` | `/api/*` | 100 requests per IP | 15 minutes |
| `strictRateLimit` | Auth endpoints | 5 attempts per IP+email | 5 minutes |
| `inviteRateLimit` | `POST /api/auth/invite` | 10 invites per admin | 15 minutes |

Expired entries are cleaned from memory every 5 minutes via `setInterval`.

---

## Input Validation & Sanitization

### Zod Schemas

All request bodies are validated against strict Zod schemas before reaching route handlers. Examples:

- **Sign in**: `email` (valid email), `password` (min 1 char)
- **Sign up**: `email`, `password` (min 12 chars), `display_name` (min 1 char)
- **Invite**: `email`, `role` (enum: STUDENT, MARKER, ADMINISTRATOR)
- **Submit**: `memo` (min 1 char), `decision` (optional)

### Sanitization Patterns Removed

- `<script>`, `<iframe>` tags
- `javascript:`, `vbscript:` protocols
- Event handlers (`onload`, `onerror`, `onclick`, `onmouseover`)
- `eval()`, `expression()`
- SQL keywords (`union select`, `drop table`, `delete from`, `insert into`, `exec`, `char`, `cast`, `convert`)
- Null bytes

### Password Protection

Password fields (`password`, `newPassword`, `confirmPassword`, `currentPassword`, `passwordHash`) are **never** modified by sanitization, ensuring existing passwords with special characters continue to work.

---

## CI/CD Pipeline

### `.github/workflows/ci.yml`

Runs on push/PR to `main` and `development`:

1. **Lint & Typecheck** — ESLint + `tsc --noEmit` on server and client (with PostgreSQL service container).
2. **Test** — vitest on server and client (with PostgreSQL, Prisma migrations, seed).
3. **Build** — `npm run build` on server and client.
4. **Security Scan** — `npm audit --audit-level=moderate` on server and client.

### `.github/workflows/security.yml`

Runs weekly (Mondays 02:00 UTC) and on push/PR to `main`/`development`:

1. **Dependency Audit** — Server, client, and root `npm audit`; fails on critical vulnerabilities.
2. **Secret Scan** — TruffleHog scans for exposed secrets.
3. **Dependency Review** — On PRs, reviews dependency changes for vulnerabilities.

### CI Configuration Notes

- `persist-credentials: false` on all `actions/checkout@v4` steps (token not needed for install/test).
- Working directories are relative to the runner workspace (not absolute `/home/user/...` paths).
- `npm ci` is used (not `npm install`) for reproducible, lockfile-driven installs.

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/sign-in` | Email/password sign-in | None (rate-limited) |
| `POST` | `/api/auth/sign-up` | Create account | None |
| `POST` | `/api/auth/sign-out` | Invalidate session | Session cookie |
| `GET` | `/api/auth/session` | Get current session | Session cookie |
| `POST` | `/api/auth/invite` | Create invitation (admin) | Administrator role |
| `POST` | `/api/auth/accept-invite` | Accept invite + create account | None |
| `POST` | `/api/auth/password-reset-request` | Request reset email | None |
| `POST` | `/api/auth/password-reset-confirm` | Confirm reset with token | None |
| `POST` | `/api/auth/email-verification-request` | Request verification email | None |
| `POST` | `/api/auth/email-verification-confirm` | Confirm email with token | None |

### Submissions (Student)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/submissions` | List user's submissions | Student + membership |
| `POST` | `/api/submissions` | Submit a memo | Student + membership |

### Reviews (Marker)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/reviews` | List submissions for marking | Marker + membership |
| `PUT` | `/api/reviews/:id` | Update scoring + publish | Marker + membership |
| `GET` | `/api/reviews/drafts` | List draft reviews | Marker + membership |

### Progress (Student)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/progress` | Get current user's progress | Student + membership |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/overview` | Cohort stats | Administrator + membership |
| `GET` | `/api/admin/audit` | Audit log entries | Administrator + membership |
| `GET` | `/api/health` | Health check | None |

---

## Contributing

1. Fork the repository and create a feature branch from `development`.
2. Make changes with detailed inline comments (see existing code for style).
3. Run `npm run lint`, `npm run typecheck`, and `npm run build` locally.
4. Ensure all tests pass (`npm run test`).
5. Open a pull request against `development`.
6. CI will run lint, typecheck, test, and build automatically.

### Commenting Standards

Every non-trivial function, middleware, route, and component must include:

- **Purpose**: What the code does and why it exists.
- **Parameters**: Expected inputs and types.
- **Return values**: What is returned and under what conditions.
- **Security notes**: Any auth, rate-limiting, or sanitization implications.
- **Examples**: Usage examples for complex logic.

See `server/src/middleware/sanitize.ts` and `server/src/index.ts` for reference.

---

## License

Private — LM Legal MVP. All rights reserved.

---

## GitHub Pages Deployment (Client)

The React/Vite client is deployed to GitHub Pages automatically on every push
to the `main` branch via `.github/workflows/deploy.yml`.

### How it works

1. **Build** — The workflow runs `npm run build` in the `client/` directory.
   Vite's `base` is set dynamically from `GITHUB_REPOSITORY` so that assets
   are served correctly under `https://<user>.github.io/<repo>/`.
2. **Upload** — The `client/dist/` directory is uploaded as a Pages artifact.
3. **Deploy** — `actions/deploy-pages@v4` publishes the artifact to GitHub
   Pages.

### One-time repository setup

1. In your GitHub repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to the `main` branch — the first successful deploy will publish the
   site at `https://<your-username>.github.io/lm-legal-mvp/`.

### Local preview of the production build

```bash
cd client
npm run build
npm run preview
```

The preview server will serve the production build at `http://localhost:4173`.

