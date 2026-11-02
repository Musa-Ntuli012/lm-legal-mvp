export function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <h1 className="card-title">Privacy notice</h1>
          <p className="card-subtitle">How your demo data is handled.</p>
        </div>
        <div className="mt-6">
          <p>
            This is a demonstration application. Data is stored in a SQLite database on the server
            and is reset when the administrator runs the demo reset.
          </p>
          <p className="mt-3">
            Session cookies are HttpOnly and SameSite. Passwords are hashed with argon2id.
            No personal data is collected beyond what you enter in the demo.
          </p>
          <p className="mt-3">
            Submissions and feedback are visible only to the submitting student, their assigned
            marker, and administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
