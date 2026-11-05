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


      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
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
                className="btn btn-primary btn-lg btn-micro"
              >
                Set password
              </button>
            </form>
          </div>
        </div>
      </main>

    </div>
  );
}
