import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/forgot-password');
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
              <h2 className="text-display mb-4">Welcome back</h2>
              <p className="text-body text-text-secondary">
                Sign in to access your matters and feedback.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.org"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="relative">
                <label className="label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={handleForgot}
                  className="absolute right-3 top-[38px] text-xs text-text-muted hover:text-primary underline underline-offset-2"
                >
                  Forgot password
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border-control text-primary focus:ring-0" />
                  <span className="text-sm text-text-secondary">Stay signed in</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full btn-micro"
              >
                Sign in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Not yet invited? Contact your institution administrator.
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
