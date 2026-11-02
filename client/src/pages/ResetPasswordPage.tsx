import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/signin');
  };

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
          <nav className="ml-auto text-sm">
            <Link to="/signin" className="text-primary hover:text-primary font-medium">Back to sign in</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-raised border border-border-control rounded-lg p-8 shadow-sm animate-fade-in page-enter">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded bg-primary mx-auto flex items-center justify-center text-white font-bold text-xl mb-4">
                LM
              </div>
              <h2 className="text-display mb-4">New password</h2>
              <p className="text-body text-text-secondary">
                Choose a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="new-password">New password</label>
                <input
                  type="password"
                  id="new-password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="confirm-new-password">Confirm new password</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type your password again"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full btn-micro"
              >
                Set password
              </button>
            </form>
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
