import { Role } from '../../../shared/types';

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

export {};
