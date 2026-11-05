import { NavLink } from 'react-router-dom';

const RECENT_MATTERS = [
  { title: 'Employment dispute memo', status: 'Draft', due: 'Fri 14 Jun', mark: null, badge: 'draft' },
  { title: 'Contract review brief', status: 'Submitted', due: 'Fri 7 Jun', mark: 72, badge: 'published' },
  { title: 'Constitutional law problem', status: 'Late', due: 'Fri 31 May', mark: null, badge: 'late' },
  { title: 'Property law memo', status: 'Needs attention', due: 'Fri 24 May', mark: 58, badge: 'needs-attention' },
];

const UPCOMING = [
  { title: 'Delict problem question', due: 'Fri 21 Jun' },
  { title: 'Family law memo', due: 'Fri 28 Jun' },
];

export function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-raised border border-border-control flex items-center justify-center text-primary font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-body font-semibold">Student Name</p>
                    <p className="text-caption-13 text-text-muted">student@example.org</p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between border-b border-border-control pb-2">
                    <span className="text-text-muted">Overall average</span>
                    <span className="text-text-deep font-semibold">65</span>
                  </div>
                  <div className="flex justify-between border-b border-border-control pb-2">
                    <span className="text-text-muted">Matters submitted</span>
                    <span className="text-text-deep font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Pending marks</span>
                    <span className="text-text-deep font-semibold">1</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="text-body font-semibold mb-4">Quick actions</h4>
                <div className="space-y-2">
                  <NavLink to="/matters" className="btn btn-secondary btn-full text-left justify-start py-3">
                    Browse matters
                  </NavLink>
                  <NavLink to="/portfolio" className="btn btn-secondary btn-full text-left justify-start py-3">
                    View portfolio
                  </NavLink>
                  <NavLink to="/notifications" className="btn btn-secondary btn-full text-left justify-start py-3">
                    Check notifications
                  </NavLink>
                  <NavLink to="/account" className="btn btn-secondary btn-full text-left justify-start py-3">
                    Account and data
                  </NavLink>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-title">Recent matters</h2>
              <NavLink to="/matters" className="text-xs text-text-secondary hover:text-primary underline underline-offset-2">
                View all matters
              </NavLink>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {RECENT_MATTERS.map((matter) => (
                <div key={matter.title} className="card card-lift cursor-pointer hover:border-primary transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-body font-semibold group-hover:text-primary">{matter.title}</h4>
                    <span className={`badge ${matter.badge}`}>
                      {matter.status}
                    </span>
                  </div>
                  <p className="text-caption-13 text-text-muted mb-3">
                    Due {matter.due}
                  </p>
                  {matter.mark !== null ? (
                    <div className="text-sm font-mono text-text-deep">
                      Mark: {matter.mark}
                    </div>
                  ) : (
                    <div className="text-sm text-text-muted">
                      Not yet marked
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="text-body font-semibold mb-4">Upcoming deadlines</h3>
              <ul className="space-y-3">
                {UPCOMING.map((item) => (
                  <li key={item.title} className="flex justify-between items-center border-b border-border-control pb-3 last:border-0">
                    <span className="text-body">{item.title}</span>
                    <span className="text-caption-14 text-text-muted font-mono">{item.due}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}
