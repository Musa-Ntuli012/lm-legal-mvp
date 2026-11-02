export function CookiePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="card-title">Cookie Notice</h1>
        <p className="card-subtitle mb-6">
          Last updated 1 November 2026
        </p>

        <div className="prose-lg text-text-deep">
          <h2>1. What are cookies</h2>
          <p>
            Cookies are small text files placed on your device when you visit a
            website. They help the site remember your preferences and improve
            your experience.
          </p>

          <h2>2. Cookies we use</h2>
          <p>
            LM Legal uses only essential cookies required for the service to
            function:
          </p>
          <ul className="list-disc list-inside mt-2 mb-4 text-text-surface">
            <li>
              <strong>Session cookie (lm_session):</strong> Keeps you signed in
              while you use the service. Expires after 8 hours or when you sign
              out.
            </li>
            <li>
              <strong>CSRF token:</strong> Protects against cross-site request
              forgery attacks on form submissions.
            </li>
          </ul>

          <h2>3. No tracking or analytics</h2>
          <p>
            We do not use analytics, advertising, or third-party tracking
            cookies. No personal data is shared with advertising networks or
            analytics providers.
          </p>

          <h2>4. Your choices</h2>
          <p>
            You can disable cookies in your browser settings. However, disabling
            session cookies will prevent you from signing in and using LM Legal.
          </p>

          <h2>5. Consent</h2>
          <p>
            By continuing to use LM Legal, you consent to the use of essential
            cookies as described in this notice. You may withdraw consent by
            signing out and clearing your browser cookies.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-beige-border text-center">
          <p className="text-xs text-text-muted">
            Questions about cookies? Contact your LM Legal administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
