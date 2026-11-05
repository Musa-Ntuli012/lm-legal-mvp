import { NavLink } from 'react-router-dom';

export function MembershipInactivePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

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

    </div>
  );
}
