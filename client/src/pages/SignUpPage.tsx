import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function SignUpPage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleInviteCode = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify invite code logic
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
            <Link to="/" className="text-text-secondary hover:text-primary mr-4">Back to home</Link>
            <Link to="/signin" className="text-primary hover:text-primary font-medium">Already have an account</Link>
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
              <h2 className="text-display mb-4">Create your account</h2>
              <p className="text-body text-text-secondary">
                You need an invite code from your institution to join.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-body font-semibold mb-4">Invite code</h3>
              <form onSubmit={handleInviteCode} className="space-y-3">
                <div>
                  <label className="label" htmlFor="invite-code">Invite code</label>
                  <input
                    type="text"
                    id="invite-code"
                    className="input"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="LM-2024-ABCD"
                    autoComplete="off"
                    required
                    maxLength={12}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary btn-full"
                >
                  Verify invite code
                </button>
              </form>
            </div>

            <div className="border-t border-border-control pt-8">
              <h3 className="text-body font-semibold mb-4 text-center">Create account</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="signup-email">Email address</label>
                  <input
                    type="email"
                    id="signup-email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.org"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="signup-password">Password</label>
                  <input
                    type="password"
                    id="signup-password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="signup-confirm">Confirm password</label>
                  <input
                    type="password"
                    id="signup-confirm"
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
                  Create account
                </button>
              </form>
            </div>
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
