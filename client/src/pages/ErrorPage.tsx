import { NavLink } from 'react-router-dom';

export function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
            <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
              LM
            </span>
            <span>LM Legal</span>
          </div>
        </div>
      </header>

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

      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">LM Legal built for South African law graduates</p>
        </div>
      </footer>
    </div>
  );
}
