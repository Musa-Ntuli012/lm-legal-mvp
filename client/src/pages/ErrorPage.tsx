import { NavLink } from 'react-router-dom';

export function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 flex items-center justify-center p-4 page-enter animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded bg-error text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
            !
          </div>
          <h2 className="text-display mb-6">Something went wrong</h2>
          <p className="text-body mb-8">
            We encountered an unexpected error. Please try again or contact support.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-lg elevate"
            >
              Try again
            </button>
            <NavLink to="/" className="btn btn-secondary btn-lg">
              Back to home
            </NavLink>
          </div>
        </div>
      </main>

    </div>
  );
}
