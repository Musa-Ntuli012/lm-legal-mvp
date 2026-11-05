import { NavLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 flex items-center justify-center p-4 page-enter animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded bg-error text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
            4 0 4
          </div>
          <h2 className="text-display mb-6">Page not found</h2>
          <p className="text-body mb-8">
            The page you are looking for does not exist.
          </p>
          <div className="flex justify-center gap-3">
            <NavLink to="/" className="btn btn-primary btn-lg elevate">
              Back to home
            </NavLink>
            <NavLink to="/signin" className="btn btn-secondary btn-lg">
              Sign in
            </NavLink>
          </div>
        </div>
      </main>

    </div>
  );
}
