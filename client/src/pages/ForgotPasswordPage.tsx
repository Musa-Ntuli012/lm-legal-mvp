import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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
              {sent ? (
                <>
                  <h2 className="text-display mb-4">Reset link sent</h2>
                  <p className="text-body text-text-secondary">
                    Check your inbox for a link to create a new password.
                  </p>
                  <p className="mt-4 text-caption-13 text-text-muted">
                    Did not receive anything? Check your spam folder or contact your institution administrator.
                  </p>
                  <Link to="/signin" className="mt-6 inline-block btn btn-primary btn-lg elevate">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-display mb-4">Reset by email</h2>
                  <p className="text-body text-text-secondary">
                    Enter your email address and we will send you a link to reset your password.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8">
                    <div>
                      <label className="label" htmlFor="reset-email">Email address</label>
                      <input
                        type="email"
                        id="reset-email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.org"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-full btn-micro mt-4"
                    >
                      Send reset link
                    </button>
                  </form>
                </>
              )}
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
