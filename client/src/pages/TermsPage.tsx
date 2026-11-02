export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="card-title">Terms of Use</h1>
        <p className="card-subtitle mb-6">
          Last updated 1 November 2026
        </p>

        <div className="prose-lg text-text-deep">
          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing and using LM Legal, you accept these terms of use. If you
            do not agree, you may not use the service.
          </p>

          <h2>2. Simulated work</h2>
          <p>
            All tasks, documents, submissions, marks and feedback on LM Legal are
            part of a legal training simulation. They do not constitute legal
            advice and do not create an attorney-client relationship.
          </p>

          <h2>3. User accounts</h2>
          <p>
            Access is by invitation only. You are responsible for keeping your
            account credentials confidential and for all activity under your
            account.
          </p>

          <h2>4. Data and privacy</h2>
          <p>
            Your personal data is processed in accordance with our Privacy Notice
            and applicable data protection law, including POPIA. You may request
            access to or deletion of your data through the administrator.
          </p>

          <h2>5. Conduct</h2>
          <p>
            You must not attempt to access other users' submissions, reverse
            engineer the service, or use automated means to interact with the
            API. Violations may result in immediate suspension.
          </p>

          <h2>6. Limitation of liability</h2>
          <p>
            LM Legal is provided as-is for training purposes. To the extent
            permitted by law, we disclaim all warranties and liability arising
            from your use of the service.
          </p>

          <h2>7. Changes to terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes are posted constitutes acceptance of the new
            terms.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-beige-border text-center">
          <p className="text-xs text-text-muted">
            Questions about these terms? Contact your LM Legal administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
