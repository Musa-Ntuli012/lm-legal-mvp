import { NavLink } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-12 page-enter animate-fade-in">
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-display mb-6">Practical legal training</h2>
              <p className="text-body mb-8 max-w-lg">
                Practise the work before you do the work. Real matters, a weekly deadline and a marker who tells you what to fix. Built for South African law graduates.
              </p>
              <div className="flex gap-4">
                <NavLink to="/signup" className="btn btn-primary btn-lg elevate">Accept your invite</NavLink>
                <NavLink to="/how-it-works" className="btn btn-secondary btn-lg elevate">See how it works</NavLink>
              </div>
            </div>
            <div className="bg-raised border border-border-control rounded-lg p-8 min-h-[300px] flex items-center justify-center">
              <p className="text-text-muted text-sm text-center">Product screenshot placeholder</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h3 className="text-title mb-8">How a week works</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="page-enter animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="bg-raised border border-border-control rounded-lg p-4 w-10 h-10 flex items-center justify-center mb-4 text-title font-bold">
                1
              </div>
              <h4 className="text-body font-semibold mb-2">Read the brief</h4>
              <p className="text-caption-13 text-text-muted">Read the client email and case documents.</p>
            </div>
            <div className="page-enter animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="bg-raised border border-border-control rounded-lg p-4 w-10 h-10 flex items-center justify-center mb-4 text-title font-bold">
                2
              </div>
              <h4 className="text-body font-semibold mb-2">Work the matter</h4>
              <p className="text-caption-13 text-text-muted">Open documents, answer questions, take the decision.</p>
            </div>
            <div className="page-enter animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="bg-raised border border-border-control rounded-lg p-4 w-10 h-10 flex items-center justify-center mb-4 text-title font-bold">
                3
              </div>
              <h4 className="text-body font-semibold mb-2">Submit by Friday</h4>
              <p className="text-caption-13 text-text-muted">Write your memo and submit before the deadline.</p>
            </div>
            <div className="page-enter animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="bg-raised border border-border-control rounded-lg p-4 w-10 h-10 flex items-center justify-center mb-4 text-title font-bold">
                4
              </div>
              <h4 className="text-body font-semibold mb-2">Get marked feedback</h4>
              <p className="text-caption-13 text-text-muted">Rubric based scoring and written comments.</p>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="card page-enter animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h4 className="text-body font-semibold mb-4">Marked by practising people</h4>
            <p className="text-body mb-4">Rubric based scoring and written comments on every submission.</p>
          </div>
          <div className="card page-enter animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h4 className="text-body font-semibold mb-4">Your record, kept for you</h4>
            <p className="text-body mb-4">Every submission and mark builds a portfolio you can export.</p>
          </div>
          <div className="card page-enter animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h4 className="text-body font-semibold mb-4">Your data, handled properly</h4>
            <p className="text-body mb-4">Built to POPIA. Hosted in South Africa where possible.</p>
          </div>
        </section>

        <section className="card page-enter animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-title mb-6">Membership</h3>
              <p className="text-body mb-4">
                [YOUR PRICE] per month, in rand, cancel any time.
              </p>
            </div>
            <div className="flex justify-end">
              <NavLink to="/signup" className="btn btn-primary btn-lg elevate">
                Request an invite
              </NavLink>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
