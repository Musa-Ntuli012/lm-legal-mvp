import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../services/api';

interface Profile {
  id: string;
  email: string;
  role: string;
  display_name: string;
}

interface SessionData {
  csrf_token: string;
  user: Profile | null;
}

/**
 * Authentication hook for managing user session state.
 *
 * Provides:
 * - `user`: The current authenticated profile, or null if not signed in.
 * - `loading`: Whether the session is still being validated.
 * - `csrfToken`: CSRF token from the session, for use in mutations.
 * - `refreshSession()`: Re-validates the session from the server.
 * - `signOut()`: Signs the user out and clears the session.
 *
 * Flow:
 * 1. On mount, calls refreshSession() to check for a valid session cookie.
 * 2. The server validates the session and returns the profile + CSRF token.
 * 3. If the session is invalid or missing, user is null and pages show
 *    sign-in/sign-up options.
 * 4. CSRF token is passed to pages that make state-changing requests.
 *
 * Security:
 * - Session is stored in an HttpOnly cookie (not accessible via JavaScript).
 * - CSRF token is passed in response body and included in request headers.
 * - All state-changing requests require the CSRF token.
 *
 * @returns { user, loading, csrfToken, refreshSession, signOut }
 */
export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  /**
   * Fetches the current session from the server.
   * Updates user and csrfToken state based on the response.
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/session`, {
        method: 'GET',
        credentials: 'include', // include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: SessionData = await response.json();
        setUser(data.user);
        setCsrfToken(data.csrf_token || '');
      } else {
        setUser(null);
        setCsrfToken('');
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      setUser(null);
      setCsrfToken('');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Signs the user out by calling the server's sign-out endpoint.
   * Only clears local state after a successful response.
   *
   * @returns Promise that resolves when sign-out completes.
   */
  const signOut = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      // Only clear local state if the server accepted the sign-out.
      if (response.ok) {
        setUser(null);
        setCsrfToken('');
      } else {
        console.error('Sign out rejected by server:', response.status);
      }
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, [csrfToken]);

  // Validate session on mount.
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return { user, loading, csrfToken, refreshSession, signOut };
}
