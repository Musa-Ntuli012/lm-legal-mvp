import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await signUp(email, password, displayName);
      if (result.ok) {
        navigate(result.redirect || '/dashboard', { replace: true });
      } else {
        setError(result.error || 'Sign up failed');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Sign up failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card">
        <div className="mb-6">
          <h1 className="card-title">Sign up</h1>
          <p className="card-subtitle">Create a new demo account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              autoComplete="name"
              required
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <p className="text-xs text-text-muted mt-1">
              At least 12 characters
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full w-full"
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center">
          <NavLink to="/signin" className="text-sm text-navy hover:underline">
            Already have an account? Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}
