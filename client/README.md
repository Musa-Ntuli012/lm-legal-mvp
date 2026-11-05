# LM Legal MVP — Client

React 18 + Vite + TypeScript single-page application for the LM Legal MVP platform.

> **Stack:** React 18, React Router DOM, Vite, Tailwind CSS, Geist font.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Design System](#design-system)
4. [Page Reference](#page-reference)
5. [Components](#components)
6. [Hooks & Services](#hooks--services)
7. [Routing](#routing)
8. [Theme System](#theme-system)
9. [Accessibility Standards](#accessibility-standards)
10. [Text Constraints](#text-constraints)
11. [Environment & Build](#environment--build)
12. [Scripts](#scripts)
13. [Adding a New Page](#adding-a-new-page)
14. [Commenting Standards](#commenting-standards)

---

## Overview

The client is a React SPA that consumes the Express API at `/api/*`. It uses React Router for client-side routing, Tailwind CSS for styling, and the Geist font family for typography.

### Design Fidelity

The UI matches the design tile skeletons 1:1:
- **Light theme** is the default; dark theme is available via the `.dark` class on `<html>`.
- **Typography**: Display 34px bold / Title 22px semibold / Body 17px regular leading 1.5 / Caption 14px & 13px.
- **Colors**: Canvas `#F7F3EC`, Raised `#FDFBF7`, Sunken `#E9E1CD`, Text `#0B1726`, Primary `#14263F`, Brass `#7A5A1E`.
- **Touch targets**: Minimum 44x44px for all interactive elements.
- **Focus ring**: 2px brass with 2px offset.
- **No dashes**: No em/en/hyphen dashes in visible user-facing text.
- **No emojis or icons**: Text labels only.

---

## Project Structure

```
client/
├── index.html            # HTML entry with security meta tags + Geist font preconnect
├── tailwind.config.js    # Design tokens (colors, typography, spacing, animations)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── main.tsx          # React entry point (renders App)
│   ├── App.tsx           # Route definitions + BrowserRouter wrapper
│   ├── index.css         # Design system CSS utility classes
│   ├── components/
│   │   └── Layout.tsx    # Shell: header, navigation, footer, auth links
│   ├── hooks/
│   │   └── useAuth.ts    # Session + CSRF token management hook
│   ├── services/
│   │   └── api.ts        # Fetch wrapper with auth headers + CSRF
│   └── pages/            # 19 page components
│       ├── LandingPage.tsx
│       ├── SignInPage.tsx
│       ├── SignUpPage.tsx
│       ├── ForgotPasswordPage.tsx
│       ├── ResetPasswordPage.tsx
│       ├── VerifyEmailPage.tsx
│       ├── Dashboard.tsx
│       ├── Matter.tsx
│       ├── Feedback.tsx
│       ├── Portfolio.tsx
│       ├── NotificationsPage.tsx
│       ├── AccountPage.tsx
│       ├── MembershipInactivePage.tsx
│       ├── MarkerDashboard.tsx
│       ├── MarkerReview.tsx
│       ├── AdminDashboard.tsx
│       ├── UsersAndInvitesPage.tsx
│       ├── AdminAudit.tsx
│       ├── TaskBuilder.tsx
│       ├── PrivacyPage.tsx
│       ├── TermsPage.tsx
│       ├── CookiePage.tsx
│       ├── NotFoundPage.tsx
│       └── ErrorPage.tsx
```

---

## Design System

### Color Tokens (Tailwind + CSS)

Defined in `tailwind.config.js` and `src/index.css`:

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `canvas` | `#F7F3EC` | `#0B1017` | Page background |
| `raised` | `#FDFBF7` | `#111823` | Card surfaces |
| `sunken` | `#E9E1CD` | `#172130` | Input surfaces |
| `text-deep` | `#0B1726` | `#ECE7DB` | Primary text |
| `text-secondary` | `#3E4A5A` | `#B4B0A4` | Secondary text |
| `text-muted` | `#566170` | `#8E8B80` | Muted text |
| `text-brass` | `#7A5A1E` | `#C8A56A` | Accent / focus |
| `primary` | `#14263F` | `#C8A56A` | Primary actions |
| `border-control` | `#8A8577` | `#6F7886` | Borders |
| `error` | `#A32A2A` | `#F08A8A` | Error states |
| `success` | `#1F6B4A` | `#6CCBA0` | Success states |
| `warning` | `#8A5A00` | `#E3B35A` | Warning states |

### Typography Scale

| Class | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `.text-display` | 34px | 700 | tight | Page headings |
| `.text-title` | 22px | 600 | — | Section headings |
| `.text-body` | 17px | 400 | 1.5 | Body paragraphs |
| `.text-caption-14` | 14px | 400 | — | Small labels |
| `.text-caption-13` | 13px | 400 | — | Tiny metadata |

Font: **Geist** (weights 400, 600, 700), loaded from Google Fonts in `index.html`.

### Component Classes (in `index.css`)

| Class | Description |
|-------|-------------|
| `.btn` | Base button (44px min height, px-5, py-2.5) |
| `.btn-primary` | Primary action (background primary, white text) |
| `.btn-secondary` | Secondary action (raised bg, border control) |
| `.btn-outline` | Outline button (primary border, primary text) |
| `.btn-danger` | Destructive action (error background) |
| `.btn-sm` / `.btn-lg` / `.btn-full` | Size variants |
| `.btn-micro` | Micro-interaction (scale on active) |
| `.card` | Card container (raised bg, border, shadow, padding) |
| `.card-sunken` | Sunken card variant (sunken bg) |
| `.card-lift` | Card with hover lift animation |
| `.input` | Text input (sunken bg, border control, focus ring) |
| `.label` | Form field label (semibold, small margin) |
| `.badge` | Status chip (rounded-full, small text) |
| `.badge-published` / `.badge-draft` / `.badge-needs-attention` | Status variants |
| `.req-id` | Requirement ID tag (small, bordered) |
| `.page-enter` | Page entry fade-in animation |

### Animations

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| `fade-in` | 350ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Page entry |
| `slide-in` | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Sidebar entry |
| `cross-fade` | 200ms | ease-in-out | Content swaps |

All animations respect `prefers-reduced-motion: reduce`.

### Theme

- Light theme is default (no `.dark` class).
- Add `class="dark"` to `<html>` for dark theme.
- All color tokens have dark equivalents defined in `tailwind.config.js`.
- Focus ring color changes to brass dark (`#C8A56A`) in dark mode.

---

## Page Reference

### Public Pages

| Page | Path | Description |
|------|------|-------------|
| `LandingPage` | `/` | Hero, how-it-works steps, trust cards, membership CTA |
| `SignInPage` | `/signin` | Email/password sign-in form |
| `SignUpPage` | `/signup` | Invite code verification, then account creation |
| `ForgotPasswordPage` | `/forgot-password` | Reset-by-email flow |
| `ResetPasswordPage` | `/reset-password` | New password form |
| `VerifyEmailPage` | `/verify-email` | 6-digit code verification with resend |
| `PrivacyPage` | `/privacy` | Data handling notice |
| `TermsPage` | `/terms` | Terms of use |
| `CookiePage` | `/cookies` | Cookie notice |
| `NotFoundPage` | `*` | 404 page |
| `ErrorPage` | (programmatic) | Unexpected error page |

### Student Pages

| Page | Path | Description |
|------|------|-------------|
| `Dashboard` | `/dashboard` | Recent matters, upcoming deadlines, quick actions, stats |
| `Matter` | `/matter/:id?` | Brief/documents/questions/feedback tabs, submission |
| `Feedback` | `/feedback` | Marker feedback list with scores and comments |
| `Portfolio` | `/portfolio` | Submission history, average score, export |
| `NotificationsPage` | `/notifications` | Notification list with read/unread states |
| `AccountPage` | `/account` | Profile, data export, security, delete account |
| `MembershipInactivePage` | `/membership-inactive` | Inactive membership state |

### Marker Pages

| Page | Path | Description |
|------|------|-------------|
| `MarkerDashboard` | `/marker/dashboard` | Marking queue table with filtering, marking stats |
| `MarkerReview` | `/marker/review/:id` | Student submission viewer, rubric scoring, calibration modal |

### Admin Pages

| Page | Path | Description |
|------|------|-------------|
| `AdminDashboard` | `/admin` | Stats cards, recent activity, quick actions |
| `UsersAndInvitesPage` | `/admin/users` | User table with roles/status, invite modal |
| `AdminAudit` | `/admin/audit` | Audit log table, CSV export |
| `TaskBuilder` | `/admin/task-builder/:taskId?` | 4-step wizard: type → details → rubric → model answer |

---

## Components

### `Layout.tsx` (in `components/`)

The application shell. Provides:

- **Header**: Logo, navigation links (role-dependent), sign-in/sign-out.
- **Main**: `max-w-[1400px]` centered content area with page entry animation.
- **Footer**: Copyright, privacy/terms/cookies links.
- **Auth-aware navigation**: Shows sign-in/sign-up for unauthenticated users; shows dashboard/portfolio/admin links based on user role.

### Hooks

#### `useAuth.ts`

Manages authentication state:
- Fetches session from `/api/auth/session`.
- Stores user profile, CSRF token, loading state.
- Provides `refreshSession()` to re-validate the session.

### Services

#### `api.ts`

Fetch wrapper that:
- Includes the `X-CSRF-Token` header on state-changing requests.
- Includes credentials (cookies) in all requests.
- Parses JSON responses.
- Throws on non-ok responses.

---

## Routing

Defined in `src/App.tsx` using `BrowserRouter` + `Routes`. All routes are wrapped in `Layout`.

- Public routes: `/`, `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/privacy`, `/terms`, `/cookies`, `*` (404).
- Student routes: `/dashboard`, `/matter/:id?`, `/feedback`, `/portfolio`, `/notifications`, `/account`, `/membership-inactive`.
- Marker routes: `/marker/dashboard`, `/marker/review/:id`.
- Admin routes: `/admin`, `/admin/users`, `/admin/audit`, `/admin/task-builder/:taskId?`.

Route guards (membership, role) are enforced on the server; the client renders role-appropriate navigation but does not duplicate authorization logic.

---

## Theme System

### Light Theme (default)

No special class needed. Background is `#F7F3EC`, text is `#0B1726`, focus ring is `#7A5A1E`.

### Dark Theme

Add `class="dark"` to the `<html>` element. All colors invert:
- Background: `#0B1017`
- Text: `#ECE7DB`
- Primary: `#C8A56A` (brass)
- Focus ring: `#C8A56A`

The server sets `secure: true` on cookies when `NODE_ENV === 'production'`, so dark theme works correctly behind HTTPS.

---

## Accessibility Standards

| Requirement | Implementation |
|-------------|---------------|
| Touch targets | Minimum 44x44px on all buttons and interactive elements |
| Focus ring | 2px brass with 2px offset, visible on all focusable elements |
| Color contrast | Meets WCAG AA for text on canvas/raised/sunken backgrounds |
| Reduced motion | Animations disabled when `prefers-reduced-motion: reduce` |
| Form labels | Every input has a visible `.label` |
| Focus order | Logical tab order through header → main → footer |
| Skip content | Header navigation provides quick access to main sections |

---

## Text Constraints

The following are strictly enforced across all visible UI text:

1. **No dashes**: No em dash (—), en dash (–), or hyphen (-) in any user-facing text, including browser tab titles and empty state messages. Use "and" or rephrase instead.
2. **No emojis**: No emoji characters anywhere in the UI.
3. **No icon fonts**: No icon components; use text labels only.
4. **Browser tab title**: `LM Legal` (no dash, no subtitle with dash).

These constraints are reviewed in CI via code review and manual QA.

---

## Environment & Build

### Development

```bash
cd client
npm install
npm run dev          # Starts Vite on http://localhost:5173
```

### Production Build

```bash
cd client
npm run build        # Outputs to dist/
npm run preview      # Preview production build locally
```

### TypeScript

```bash
npm run typecheck    # tsc --noEmit
```

### Lint

```bash
npm run lint         # ESLint on src/
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Vite production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint on `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | vitest |

---

## Adding a New Page

1. Create `src/pages/YourPage.tsx` with a named export `YourPage`.
2. Follow the design system: use `.card`, `.input`, `.btn`, `.badge`, `.text-*` classes.
3. No dashes, emojis, or icons in visible text.
4. Minimum 44x44px touch targets on all buttons.
5. Add the route to `src/App.tsx` inside `<Routes>`.
6. Add navigation to `src/components/Layout.tsx` if appropriate (role-dependent).
7. Add detailed inline comments explaining purpose, props, and behavior.
8. Run `npm run lint`, `npm run typecheck`, and `npm run build`.

---

## Commenting Standards

Every component, hook, service, and non-trivial function must include:

```
/**
 * One-line summary of what the component/hook does.
 *
 * Detailed explanation of props, state, behavior, and any design system
 * classes used. Mention any accessibility considerations.
 *
 * @param {Type} propName - Description of the prop.
 * @returns {Type} Description of the return value (for hooks).
 *
 * @example
 * <ComponentName propName="value" />
 */
```

Follow the existing patterns in `LandingPage.tsx`, `Dashboard.tsx`, and `Layout.tsx`.
