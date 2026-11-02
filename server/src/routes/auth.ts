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
import { csrfProtection } from '../middleware/csrf';
import { signInRateLimit } from '../middleware/rateLimit';
import { inviteRateLimit } from '../middleware/ddos';
import { z } from 'zod';

const router = Router();

// Validation schemas
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

// GET /api/auth/session - Get current session
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

// POST /api/auth/sign-in - Sign in
router.post('/sign-in', signInRateLimit, csrfProtection, async (req, res) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_credentials' });
  }

  const result = await signIn(parsed.data.email, parsed.data.password, res);
  if (!result.ok) {
    return res.status(200).json({ error: result.error });
  }

  res.json(result);
});

// POST /api/auth/sign-up - Sign up (public registration - will be invite-only in production)
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

// POST /api/auth/sign-out - Sign out
router.post('/sign-out', authenticate, csrfProtection, async (_req, res) => {
  await signOut(res, _req.profile?.id);
  res.json({ ok: true });
});

// POST /api/auth/invite - Create invitation (admin only)
router.post('/invite', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), inviteRateLimit, csrfProtection, async (req, res) => {
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
});

// POST /api/auth/accept-invite - Accept invitation and create account
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

// POST /api/auth/password-reset-request - Request password reset
router.post('/password-reset-request', csrfProtection, async (req, res) => {
  const parsed = passwordResetRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const result = await requestPasswordReset(parsed.data.email);
  // Always return ok to avoid email enumeration
  res.json({ ok: true, emailSent: result.emailSent });
});

// POST /api/auth/password-reset-confirm - Confirm password reset
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

// POST /api/auth/email-verification-request - Request email verification
router.post('/email-verification-request', csrfProtection, async (req, res) => {
  const parsed = emailVerificationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const result = await requestEmailVerification(parsed.data.email);
  res.json({ ok: true, emailSent: result.emailSent });
});

// POST /api/auth/email-verification-confirm - Confirm email verification
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
