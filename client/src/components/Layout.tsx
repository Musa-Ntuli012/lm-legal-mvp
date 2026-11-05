import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  user: Profile | null;
  csrfToken: string;
  children: React.ReactNode;
}

interface Profile {
  id: string;
  email: string;
  role: string;
  display_name: string;
}

/**
 * Application shell layout.
 *
 * Provides the consistent page structure used by all routes:
 * - Header: Logo (home link), role-based navigation, sign-out button.
 * - Main: Centered content area (max-w-[1400px]) with page entry animation.
 * - Footer: Copyright text and links to Privacy, Terms, Cookies.
 *
 * Navigation is role-dependent:
 * - Unauthenticated: Sign in, Sign up links.
 * - Student: Dashboard, Portfolio, Sign out.
 * - Marker: Marker Dashboard, Sign out.
 * - Administrator: Admin Overview, Task Builder, Sign out.
 *
 * Design tokens applied:
 * - bg-canvas background, text-text-deep foreground.
 * - Header uses bg-raised with border-border-control bottom border.
 * - Footer uses bg-raised with border-border-control top border.
 * - All buttons are 44x44px minimum touch targets.
 * - No dashes, emojis, or icons in visible text.
 *
 * @param user - Current authenticated user profile, or null.
 * @param csrfToken - CSRF token from the session (passed to pages for mutations).
 * @param children - Page content rendered inside the layout.
 * @returns JSX element with header, main, and footer sections.
 */
export function Layout({ user, csrfToken, children }: LayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignInPage = location.pathname === '/signin' || location.pathname === '/signup';

  /**
   * Handles sign-out: confirms with the user, calls the auth hook,
   * and navigates to the sign-in page.
   */
  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Sign out of the demo?')) {
      signOut();
      navigate('/signin');
    }
  };

  const isAdmin = user?.role === 'administrator';
  const isMarker = user?.role === 'marker';
  const isStudent = user?.role === 'student';

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-deep">
      {/* Header: sticky top bar with logo, navigation, and auth actions */}
      <header className="border-b border-border-control bg-raised flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          {/* Brand logo + name (links to landing page) */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight"
          >
            <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
              LM
            </span>
            <span>LM Legal</span>
          </NavLink>

          {/* Navigation and auth actions */}
          <div className="flex items-center gap-3">
            {!user ? (
              // Unauthenticated: show sign-in and sign-up
              <>
                {!isSignInPage && (
                  <>
                    <NavLink to="/signin" className="btn btn-primary btn-sm">
                      Sign in
                    </NavLink>
                    <NavLink to="/signup" className="btn btn-outline btn-sm">
                      Sign up
                    </NavLink>
                  </>
                )}
              </>
            ) : (
              // Authenticated: show role-based navigation and sign-out
              <>
                {isStudent && (
                  <>
                    <NavLink to="/dashboard" className="btn btn-outline btn-sm">
                      Dashboard
                    </NavLink>
                    <NavLink to="/portfolio" className="btn btn-outline btn-sm">
                      Portfolio
                    </NavLink>
                  </>
                )}
                {isMarker && (
                  <NavLink to="/marker/dashboard" className="btn btn-outline btn-sm">
                    Marker dashboard
                  </NavLink>
                )}
                {isAdmin && (
                  <>
                    <NavLink to="/admin" className="btn btn-outline btn-sm">
                      Admin overview
                    </NavLink>
                    <NavLink to="/admin/task-builder" className="btn btn-outline btn-sm">
                      Task builder
                    </NavLink>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline btn-sm"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content area: centered, max-width, page enter animation */}
      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        {children}
      </main>

      {/* Footer: copyright + legal links */}
      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">
            LM Legal built for South African law graduates
          </p>
          <p className="text-caption-13 text-text-muted mt-2">
            <NavLink to="/privacy" className="text-text-secondary hover:text-primary">Privacy</NavLink>
            <span className="mx-3 text-text-muted">and</span>
            <NavLink to="/terms" className="text-text-secondary hover:text-primary">Terms</NavLink>
            <span className="mx-3 text-text-muted">and</span>
            <NavLink to="/cookies" className="text-text-secondary hover:text-primary">Cookies</NavLink>
          </p>
        </div>
      </footer>
    </div>
  );
}
