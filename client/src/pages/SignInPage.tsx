import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result.ok) {
        navigate(result.redirect || '/dashboard', { replace: true });
      } else {
        setError(result.error || 'Sign in failed');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Sign in failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card">
        <div className="mb-6">
          <h1 className="card-title">Sign in</h1>
          <p className="card-subtitle">Enter your demo account credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full w-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-beige-border">
          <p className="text-sm text-text-muted mb-3">New to LM Legal?</p>
          <NavLink to="/signup" className="text-navy hover:underline text-sm font-medium">
            Create an account
          </NavLink>
        </div>

        <div className="mt-6 pt-4 border-t border-beige-border">
          <h3 className="card-title mb-3" style={{ fontSize: '15px' }}>
            Demo credentials copy and paste
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Student</span>
              <span className="font-mono text-navy">student@lmlegal.demo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Password</span>
              <span className="font-mono text-navy">StudentDemo2026!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Admin</span>
              <span className="font-mono text-navy">admin@lmlegal.demo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Password</span>
              <span className="font-mono text-navy">AdminDemo2026!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Marker (investor)</span>
              <span className="font-mono text-navy">investor@lmlegal.demo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Password</span>
              <span className="font-mono text-navy">printed at seed time</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <NavLink to="/privacy" className="text-sm text-text-muted hover:underline">
          Privacy notice
        </NavLink>
      </div>
    </div>
  );
}
