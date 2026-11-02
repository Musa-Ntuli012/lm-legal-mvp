import { useState, useEffect, useCallback } from 'react';
import { getSession, signIn, signUp, signOut, Profile } from '../services/api';

export interface AuthState {
  user: Profile | null;
  loading: boolean;
  csrfToken: string;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const session = await getSession();
      setUser(session.user);
      setCsrfToken(session.csrf_token);
    } catch (err) {
      console.error('Session refresh failed:', err);
      setUser(null);
      setCsrfToken('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.ok && result.user) {
      setUser(result.user);
      setCsrfToken(result.csrf_token || '');
      return { ok: true, redirect: result.redirect };
    }
    return { ok: false, error: result.error || 'Sign in failed' };
  };

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    const result = await signUp(email, password, displayName);
    if (result.ok && result.user) {
      setUser(result.user);
      setCsrfToken(result.csrf_token || '');
      return { ok: true, redirect: result.redirect };
    }
    return { ok: false, error: result.error || 'Sign up failed' };
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setCsrfToken('');
  };

  return {
    user,
    loading,
    csrfToken,
    isAuthenticated: !!user,
    refreshSession,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };
}
