import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { Role } from '../../../shared/types';

export interface AuthenticatedRequest extends Request {
  profile?: {
    id: string;
    email: string;
    role: Role;
    membershipStatus: string;
  };
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

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.lm_session;

  if (!token) {
    req.profile = undefined;
    return next();
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { profile: true },
    });

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
    console.error('Auth middleware error:', err);
    req.profile = undefined;
    next();
  }
}

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
