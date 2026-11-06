export function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-title mb-2">Terms of use</h1>
            <p className="text-body text-text-secondary">Terms for using this service.</p>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-body">
              This is a demonstration application for practical legal training. By using this service you agree to the terms below.
            </p>
            <p className="text-body">
              You may not use this service for any unlawful purpose. You must not upload content that you do not have the right to share.
            </p>
            <p className="text-body">
              The service is provided as is without warranty of any kind. The operators are not liable for any damages arising from use of the service.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
