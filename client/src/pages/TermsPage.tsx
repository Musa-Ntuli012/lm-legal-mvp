import { NavLink } from 'react-router-dom';

export function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            Terms
          </div>
        </div>
      </header>

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

      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">LM Legal built for South African law graduates</p>
        </div>
      </footer>
    </div>
  );
}
