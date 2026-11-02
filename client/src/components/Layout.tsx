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

export function Layout({ user, csrfToken, children }: LayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignInPage = location.pathname === '/signin' || location.pathname === '/signup';

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
      <header className="border-b border-border-control bg-raised flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight"
          >
            <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
              LM
            </span>
            <span>LM Legal</span>
          </NavLink>

          <div className="flex items-center gap-3">
            {!user ? (
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

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        {children}
      </main>

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
