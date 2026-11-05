import { NavLink } from 'react-router-dom';

export function CookiePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

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

    </div>
  );
}
