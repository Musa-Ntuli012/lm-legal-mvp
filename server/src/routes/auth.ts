import { Router } from 'express';
import {
  signIn,
  signUp,
  signOut,
  getSession,
  acceptInvite,
  createInvite,
  requestPasswordReset,
  confirmPasswordReset,
  requestEmailVerification,
  confirmEmailVerification,
} from '../services/authService';
import { authenticate, requireRoles } from '../middleware/auth';
import { csrfProtection, generateCsrfToken } from '../middleware/csrf';
import { signInRateLimit } from '../middleware/rateLimit';
import { inviteRateLimit } from '../middleware/ddos';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// All request bodies are validated with Zod before reaching handlers.
// ============================================

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  display_name: z.string().min(1, 'Display name is required'),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['STUDENT', 'MARKER', 'ADMINISTRATOR']).default('STUDENT'),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

const emailVerificationRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const emailVerificationConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// ============================================
// Session
// ============================================

/**
 * GET /api/auth/session
 * Returns the current user's session (profile + CSRF token) or null if not signed in.
 * Requires a valid session cookie.
 */
router.get('/session', authenticate, async (req, res) => {
  const token = req.cookies?.lm_session;
  if (!token) {
    return res.json({ user: null, csrf_token: '' });
  }

  const session = await getSession(token);
  if (!session) {
    res.clearCookie('lm_session', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return res.json({ user: null, csrf_token: '' });
  }

  res.json(session);
});

// ============================================
// GET /api/auth/csrf-token - Anonymous CSRF token
// ============================================

/**
 * GET /api/auth/csrf-token
 * No authentication required.
 *
 * Issues a fresh CSRF token for anonymous clients before sign-in.
 * Without this, sign-in and sign-up cannot succeed in production because
 * csrfProtection requires a non-empty token on POST requests.
 */
router.get('/csrf-token', generateCsrfToken, async (_req, res) => {
  const token = _req.headers['x-csrf-token'] as string;
  res.json({ csrf_token: token });
});

// ============================================
// Sign In
// ============================================

/**
 * POST /api/auth/sign-in
 * Rate-limited (5 attempts per 5 minutes per IP+email).
 * CSRF-protected.
 * Validates email + password, creates a session, sets the lm_session cookie.
 * Returns redirect path based on user role.
 * Never reveals whether the email exists (generic error message).
 */
router.post('/sign-in', signInRateLimit, csrfProtection, async (req, res) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_credentials' });
  }

  const result = await signIn(parsed.data.email, parsed.data.password, res);
  if (!result.ok) {
    // Return 200 with generic error to avoid timing-based email enumeration.
    return res.status(200).json({ error: result.error });
  }

  res.json(result);
});

// ============================================
// Sign Up
// ============================================

/**
 * POST /api/auth/sign-up
 * CSRF-protected.
 * Creates a new account. Password minimum 12 characters.
 * Hashes password with Argon2id before storage.
 * Returns redirect to /dashboard on success.
 */
router.post('/sign-up', csrfProtection, async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed' });
  }

  const result = await signUp(
    parsed.data.email,
    parsed.data.password,
    parsed.data.display_name,
    res
  );
  if (!result.ok) {
    return res.status(200).json({ error: result.error });
  }

  res.json(result);
});

// ============================================
// Sign Out
// ============================================

/**
 * POST /api/auth/sign-out
 * Requires authentication.
 * CSRF-protected.
 * Deletes all sessions for the user, clears the cookie, logs audit event.
 */
router.post('/sign-out', authenticate, csrfProtection, async (_req, res) => {
  await signOut(res, _req.profile?.id);
  res.json({ ok: true });
});

// ============================================
// Invitations (Admin only)
// ============================================

/**
 * POST /api/auth/invite
 * Requires authentication + ADMINISTRATOR or OWNER role.
 * Rate-limited (10 invites per 15 minutes).
 * CSRF-protected.
 * Creates a single-use invitation token valid for 7 days.
 * Returns the invitation token to be shared with the invitee.
 */
router.post(
  '/invite',
  authenticate,
  requireRoles('ADMINISTRATOR', 'OWNER'),
  inviteRateLimit,
  csrfProtection,
  async (req, res) => {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_invitation' });
    }

    const result = await createInvite(
      parsed.data.email,
      req.profile!.id,
      parsed.data.role
    );
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ ok: true, token: result.token });
  }
);

/**
 * POST /api/auth/accept-invite
 * CSRF-protected.
 * Consumes an invitation token, verifies the email matches, creates the
 * profile with the invited role, and starts a session.
 */
router.post('/accept-invite', csrfProtection, async (req, res) => {
  const { token, email, password, display_name } = req.body;

  if (!token || !email || !password || !display_name) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const result = await acceptInvite(token, email, password, display_name, res);
  if (!result.ok) {
    return res.status(200).json({ error: result.error });
  }

  res.json(result);
});

// ============================================
// Password Reset
// ============================================

/**
 * POST /api/auth/password-reset-request
 * CSRF-protected.
 * Generates a single-use reset token valid for 30 minutes.
 * Sends reset email (non-blocking).
 * Always returns ok: true to prevent email enumeration.
 */
router.post('/password-reset-request', csrfProtection, async (req, res) => {
  const parsed = passwordResetRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  await requestPasswordReset(parsed.data.email);
  res.json({ ok: true });
});

/**
 * POST /api/auth/password-reset-confirm
 * CSRF-protected.
 * Validates the reset token, hashes the new password with Argon2id,
 * invalidates all other sessions, marks token as used.
 */
router.post('/password-reset-confirm', csrfProtection, async (req, res) => {
  const parsed = passwordResetConfirmSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_reset' });
  }

  const result = await confirmPasswordReset(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return res.status(200).json({ error: result.error });
  }

  res.json({ ok: true });
});

// ============================================
// Email Verification
// ============================================

/**
 * POST /api/auth/email-verification-request
 * CSRF-protected.
 * Generates a single-use verification token valid for 7 days.
 * Sends verification email (non-blocking).
 */
router.post('/email-verification-request', csrfProtection, async (req, res) => {
  const parsed = emailVerificationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  await requestEmailVerification(parsed.data.email);
  res.json({ ok: true });
});

/**
 * POST /api/auth/email-verification-confirm
 * CSRF-protected.
 * Validates the verification token, sets emailVerified = true,
 * marks token as used.
 */
router.post('/email-verification-confirm', csrfProtection, async (req, res) => {
  const parsed = emailVerificationConfirmSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_verification' });
  }

  const result = await confirmEmailVerification(parsed.data.token);
  if (!result.ok) {
    return res.status(200).json({ error: result.error });
  }

  res.json({ ok: true });
});

export default router;
