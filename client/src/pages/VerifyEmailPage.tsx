import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerified(true);
  };

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    setResent(true);
    setTimeout(() => setResent(false), 3000);
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-raised border border-border-control rounded-lg p-8 shadow-sm animate-fade-in page-enter">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded bg-primary mx-auto flex items-center justify-center text-white font-bold text-xl mb-4">
                LM
              </div>
              {verified ? (
                <>
                  <h2 className="text-display mb-4">Email verified</h2>
                  <p className="text-body text-text-secondary">
                    Your email address is confirmed. You can sign in now.
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={() => navigate('/signin')}
                      className="btn btn-primary btn-lg btn-full btn-micro"
                    >
                      Sign in
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-display mb-4">Check your inbox</h2>
                  <p className="text-body text-text-secondary">
                    We sent a verification code to your email address. Enter it below to verify your account.
                  </p>

                  <form onSubmit={handleVerify} className="mt-8 space-y-4">
                    <div>
                      <label className="label" htmlFor="verify-code">Verification code</label>
                      <input
                        type="text"
                        id="verify-code"
                        className="input text-center text-xl font-mono tracking-widest"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                        placeholder="XXXXXX"
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-full btn-micro"
                    >
                      Verify email
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    {!resent ? (
                      <button
                        onClick={handleResend}
                        className="text-xs text-text-secondary hover:text-primary underline underline-offset-2"
                      >
                        Resend code
                      </button>
                    ) : (
                      <span className="text-xs text-text-success">Code sent again</span>
                    )}
                    <p className="mt-2 text-caption-13 text-text-muted">
                      Did not receive anything? Check your spam folder.
                    </p>
                  </div>
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
