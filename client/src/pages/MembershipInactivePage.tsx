import { NavLink } from 'react-router-dom';

export function MembershipInactivePage() {
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
          <div className="w-16 h-16 rounded bg-warning text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
            !
          </div>
          <h2 className="text-display mb-6">Membership inactive</h2>
          <p className="text-body mb-8">
            Your membership is not active. You cannot view matters or submit work until your membership is renewed.
          </p>
          <div className="space-y-3">
            <NavLink to="/signup" className="btn btn-primary btn-lg elevate w-full">
              Reactivate membership
            </NavLink>
            <NavLink to="/signin" className="btn btn-secondary btn-lg w-full">
              Sign in with another account
            </NavLink>
          </div>
          <p className="mt-8 text-caption-13 text-text-muted">
            Contact your institution administrator for help with membership.
          </p>
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
