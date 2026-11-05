import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { Role } from '../../../shared/types';

/**
 * Extends the Express Request interface with authentication-related properties.
 * The `authenticate` middleware populates `req.profile` and `req.sessionId`
 * after validating the session cookie.
 */
export interface AuthenticatedRequest extends Request {
  /** The authenticated user's profile, or undefined if not signed in. */
  profile?: {
    id: string;
    email: string;
    role: Role;
    membershipStatus: string;
  };
  /** The database ID of the active session, used for audit logging. */
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      profile?: {
        id: string;
        email: string;
        role: Role;
        membershipStatus: string;
      };
      sessionId?: string;
    }
  }
}

/**
 * Session authentication middleware.
 *
 * Reads the `lm_session` cookie from the request, looks up the session in
 * the database, validates its expiry, and attaches the user profile to
 * `req.profile`. If the session is missing or expired, clears the cookie
 * and sets `req.profile = undefined` — the request continues unauthenticated
 * so that public routes can still be served.
 *
 * Security:
 * - Sessions are HttpOnly, SameSite=Lax, Secure (production) cookies.
 * - Expired sessions are cleared from the client.
 * - Session activity timestamp is updated on each validated request.
 *
 * @param req - Express request (may contain `lm_session` cookie).
 * @param res - Express response (used to clear expired cookies).
 * @param next - Express next function.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.lm_session;

  // No session cookie — request is unauthenticated but allowed to proceed.
  // Public routes (landing, sign-in, health) do not require a profile.
  if (!token) {
    req.profile = undefined;
    return next();
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { profile: true },
    });

    // Session not found in DB or expired — clear cookie and treat as unauth.
    if (!session || new Date(session.expiresAt) <= new Date()) {
      res.clearCookie('lm_session', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
      req.profile = undefined;
      return next();
    }

    // Session is valid — refresh last active timestamp for session tracking.
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    req.profile = {
      id: session.profile.id,
      email: session.profile.email,
      role: session.profile.role as Role,
      membershipStatus: session.profile.membershipStatus,
    };
    req.sessionId = session.id;

    next();
  } catch (err) {
    // Database errors should not crash the request — fail open to unauth.
    console.error('Auth middleware error:', err);
    req.profile = undefined;
    next();
  }
}

/**
 * Requires the user to be signed in.
 * Returns 401 `{ error: 'sign_in_required' }` if `req.profile` is undefined.
 *
 * Use on routes that need an authenticated user but no specific role.
 */
export function requireSignIn(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.profile) {
    return res.status(401).json({ error: 'sign_in_required' });
  }
  next();
}

/**
 * Requires the user to have an ACTIVE membership.
 * Returns 403 `{ error: 'membership_inactive' }` if membership is not active.
 *
 * Use on routes that access paid features (matters, submissions, feedback).
 */
export function requireMembership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.profile) {
    return res.status(401).json({ error: 'sign_in_required' });
  }
  if (req.profile.membershipStatus !== 'ACTIVE') {
    return res.status(403).json({ error: 'membership_inactive' });
  }
  next();
}

/**
 * Factory that returns middleware requiring one of the specified roles.
 * Returns 401 if not signed in, 403 if role is not in the allowed list.
 *
 * @param allowedRoles - Array of Role values permitted to access the route.
 * @returns Express middleware function.
 *
 * @example
 * router.post('/invite', authenticate, requireRoles('ADMINISTRATOR'), handler);
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.profile) {
      return res.status(401).json({ error: 'sign_in_required' });
    }
    if (!allowedRoles.includes(req.profile.role)) {
      return res.status(403).json({ error: 'insufficient_role' });
    }
    next();
  };
}

/**
 * Alias for requireMembership. Exists for semantic clarity on routes
 * that gate access based on membership status rather than role.
 */
export function requireMembershipGate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.profile) {
    return res.status(401).json({ error: 'sign_in_required' });
  }
  if (req.profile.membershipStatus !== 'ACTIVE') {
    return res.status(403).json({ error: 'membership_inactive' });
  }
  next();
}
