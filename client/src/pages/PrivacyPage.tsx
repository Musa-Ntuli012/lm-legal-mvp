export function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-title mb-2">Privacy notice</h1>
            <p className="text-body text-text-secondary">How your data is handled.</p>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-body">
              This is a demonstration application. Data is stored in a SQLite database on the server and is reset when the administrator runs the demo reset.
            </p>
            <p className="text-body">
              Session cookies are HttpOnly and SameSite. Passwords are hashed with argon2id. No personal data is collected beyond what you enter in the demo.
            </p>
            <p className="text-body">
              Submissions and feedback are visible only to the submitting student, their assigned marker, and administrators.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
