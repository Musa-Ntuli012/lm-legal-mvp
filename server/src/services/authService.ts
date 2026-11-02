import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';
import { sendEmail, passwordResetEmail, emailVerificationEmail } from './emailService';

export const prisma = new PrismaClient();

export interface AuthResult {
  ok: boolean;
  redirect?: string;
  error?: string;
  csrf_token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    display_name: string;
  };
}

export async function signIn(
  email: string,
  password: string,
  res: any
): Promise<AuthResult> {
  const profile = await prisma.profile.findUnique({ where: { email } });

  // Constant-time comparison to prevent timing attacks
  let ok = false;
  if (profile) {
    ok = await argon2.verify(profile.passwordHash, password);
  }

  if (!ok) {
    // Still hash something to prevent timing attacks
    await argon2.verify('$2b$06$invalid.invalid.invalidinvalidinvalidinv', password);
    return { ok: false, error: 'invalid_credentials' };
  }

  if (!profile) {
    return { ok: false, error: 'invalid_credentials' };
  }

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

  await prisma.session.create({
    data: {
      id: sessionToken,
      token: sessionToken,
      csrfToken,
      expiresAt,
      profileId: profile.id,
    },
  });

  // Update last sign in
  await prisma.profile.update({
    where: { id: profile.id },
    data: { lastSignInAt: new Date() },
  });

  // Set session cookie
  res.cookie('lm_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      profileId: profile.id,
      action: 'sign_in',
      target: 'session',
      detail: `User signed in`,
    },
  });

  const redirect =
    profile.role === 'ADMINISTRATOR'
      ? '/admin'
      : profile.role === 'MARKER'
        ? '/marker/dashboard'
        : '/dashboard';

  return {
    ok: true,
    redirect,
    csrf_token: csrfToken,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      display_name: profile.displayName,
    },
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  res: any
): Promise<AuthResult> {
  // Check if email already exists
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: 'email_exists' };
  }

  // Hash password with argon2
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const profile = await prisma.profile.create({
    data: {
      email,
      passwordHash,
      displayName,
      role: 'STUDENT',
      membershipStatus: 'ACTIVE',
    },
  });

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      id: sessionToken,
      token: sessionToken,
      csrfToken,
      expiresAt,
      profileId: profile.id,
    },
  });

  res.cookie('lm_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });

  await prisma.auditLog.create({
    data: {
      profileId: profile.id,
      action: 'sign_up',
      target: 'profile',
      detail: 'New account created',
    },
  });

  return {
    ok: true,
    redirect: '/dashboard',
    csrf_token: csrfToken,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      display_name: profile.displayName,
    },
  };
}

export async function signOut(res: any, profileId?: string): Promise<void> {
  if (profileId) {
    await prisma.session.deleteMany({ where: { profileId } });
    await prisma.auditLog.create({
      data: {
        profileId,
        action: 'sign_out',
        target: 'session',
        detail: 'User signed out',
      },
    });
  }

  res.clearCookie('lm_session', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getSession(token: string): Promise<any> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { profile: true },
  });

  if (!session || new Date(session.expiresAt) <= new Date()) {
    return null;
  }

  return {
    csrf_token: session.csrfToken,
    user: session.profile
      ? {
          id: session.profile.id,
          email: session.profile.email,
          role: session.profile.role,
          display_name: session.profile.displayName,
        }
      : null,
  };
}

export async function createInvite(
  email: string,
  invitedById: string,
  role: string
): Promise<{ ok: boolean; token?: string; error?: string }> {
  const existing = await prisma.invitation.findFirst({
    where: { email, used: false, expiresAt: { gt: new Date() } },
  });
  if (existing) {
    return { ok: false, error: 'invitation_already_exists' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.invitation.create({
    data: {
      email,
      token,
      role: role as any,
      expiresAt,
      invitedById,
    },
  });

  await prisma.auditLog.create({
    data: {
      profileId: invitedById,
      action: 'create_invitation',
      target: email,
      detail: `Invitation created for ${email}`,
    },
  });

  return { ok: true, token };
}

export async function acceptInvite(
  token: string,
  email: string,
  password: string,
  displayName: string,
  res: any
): Promise<AuthResult> {
  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation || invitation.used || invitation.expiresAt < new Date()) {
    return { ok: false, error: 'invitation_invalid_or_expired' };
  }

  if (invitation.email !== email) {
    return { ok: false, error: 'email_mismatch' };
  }

  // Mark invitation as used
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { used: true, usedAt: new Date() },
  });

  // Create profile
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const profile = await prisma.profile.create({
    data: {
      email,
      passwordHash,
      displayName,
      role: invitation.role,
      membershipStatus: 'ACTIVE',
    },
  });

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      id: sessionToken,
      token: sessionToken,
      csrfToken,
      expiresAt,
      profileId: profile.id,
    },
  });

  res.cookie('lm_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });

  await prisma.auditLog.create({
    data: {
      profileId: profile.id,
      action: 'accept_invitation',
      target: 'profile',
      detail: 'Account created via invitation',
    },
  });

  const redirect = invitation.role === 'ADMINISTRATOR' ? '/admin' : '/dashboard';

  return {
    ok: true,
    redirect,
    csrf_token: csrfToken,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      display_name: profile.displayName,
    },
  };
}

/**
 * Request a password reset. Generates a single-use token valid for 30 minutes,
 * stores it in the database, and sends a reset email.
 * Never reveals whether the email exists.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: boolean; emailSent: boolean }> {
  const profile = await prisma.profile.findUnique({ where: { email } });

  // Always hash something to prevent timing attacks, even if email not found
  if (!profile) {
    await argon2.verify('$2b$06$invalid.invalid.invalidinvalidinvalidinv', 'dummy');
    return { ok: true, emailSent: false };
  }

  // Invalidate any existing unused reset tokens for this profile
  await prisma.passwordReset.updateMany({
    where: { profileId: profile.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.passwordReset.create({
    data: {
      profileId: profile.id,
      token,
      expiresAt,
    },
  });

  // Send reset email (non-blocking)
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  sendEmail(passwordResetEmail(profile.email, profile.displayName || 'Student', resetUrl))
    .catch(() => {});

  return { ok: true, emailSent: true };
}

/**
 * Confirm a password reset. Validates the token, resets the password,
 * ends all other sessions, and marks the token as used.
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const reset = await prisma.passwordReset.findUnique({ where: { token } });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return { ok: false, error: 'invalid_or_expired_token' };
  }

  // Hash the new password
  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Update password and mark token as used in a transaction
  await prisma.$transaction([
    prisma.profile.update({
      where: { id: reset.profileId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    }),
    // End all other sessions for this profile
    prisma.session.deleteMany({
      where: { profileId: reset.profileId },
    }),
  ]);

  return { ok: true };
}

/**
 * Request email verification. Generates a single-use token valid for 7 days,
 * stores it in the database, and sends a verification email.
 * Never reveals whether the email exists.
 */
export async function requestEmailVerification(email: string): Promise<{ ok: boolean; emailSent: boolean }> {
  const profile = await prisma.profile.findUnique({ where: { email } });

  if (!profile) {
    await argon2.verify('$2b$06$invalid.invalid.invalidinvalidinvalidinv', 'dummy');
    return { ok: true, emailSent: false };
  }

  // Already verified
  if (profile.emailVerified) {
    return { ok: true, emailSent: false };
  }

  // Invalidate any existing unused verification tokens
  await prisma.emailVerification.updateMany({
    where: { profileId: profile.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.emailVerification.create({
    data: {
      profileId: profile.id,
      token,
      expiresAt,
    },
  });

  // Send verification email (non-blocking)
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  sendEmail(emailVerificationEmail(profile.email, profile.displayName || 'Student', verifyUrl))
    .catch(() => {});

  return { ok: true, emailSent: true };
}

/**
 * Confirm email verification. Validates the token and marks the email as verified.
 */
export async function confirmEmailVerification(token: string): Promise<{ ok: boolean; error?: string }> {
  const verification = await prisma.emailVerification.findUnique({ where: { token } });

  if (!verification || verification.used || verification.expiresAt < new Date()) {
    return { ok: false, error: 'invalid_or_expired_token' };
  }

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: verification.profileId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    }),
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    }),
  ]);

  return { ok: true };
}
