import { NavLink } from 'react-router-dom';

export function CookiePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            Cookies
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-title mb-2">Cookie notice</h1>
            <p className="text-body text-text-secondary">How we use cookies.</p>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-body">
              We use session cookies to keep you signed in while you use the service. These cookies are HttpOnly and SameSite.
            </p>
            <p className="text-body">
              We do not use tracking cookies or third party analytics. No personal data is stored in cookies beyond your session identifier.
            </p>
            <p className="text-body">
              You can disable cookies in your browser settings, but some parts of the service may not work without them.
            </p>
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
