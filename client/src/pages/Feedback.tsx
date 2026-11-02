import { NavLink } from 'react-router-dom';

const FEEDBACK_ITEMS = [
  {
    id: '1',
    title: 'Memo draft - Employment dispute',
    matter: 'Matter EMP-001',
    submitted: 'Fri 7 Jun 2024',
    marked: 'Mon 10 Jun 2024',
    score: 72,
    maxScore: 100,
    status: 'published',
    comment: 'Well structured memo with clear identification of the legal issues. Your application of the Labour Relations Act is sound.',
  },
  {
    id: '2',
    title: 'Contract review brief',
    matter: 'Matter CON-002',
    submitted: 'Fri 31 May 2024',
    marked: 'Tue 4 Jun 2024',
    score: 58,
    maxScore: 100,
    status: 'needs-attention',
    comment: 'Good analysis but missing key contractual clauses. Review the exclusion clause section more carefully.',
  },
  {
    id: '3',
    title: 'Constitutional law problem',
    matter: 'Matter CONST-003',
    submitted: 'Fri 24 May 2024',
    marked: null,
    score: null,
    maxScore: 100,
    status: 'pending',
    comment: null,
  },
];

export function Feedback() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            Feedback
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <h2 className="text-title mb-8">Marker feedback</h2>

        <div className="space-y-6">
          {FEEDBACK_ITEMS.map((item) => (
            <div key={item.id} className="card card-lift">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-body font-semibold">{item.title}</h3>
                  <p className="text-caption-13 text-text-muted">{item.matter}</p>
                </div>
                <span className={`badge ${item.status === 'published' ? 'badge-published' : item.status === 'needs-attention' ? 'badge-needs-attention' : 'badge-draft'}`}>
                  {item.status === 'published' ? 'Published' : item.status === 'needs-attention' ? 'Needs attention' : 'Pending'}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded bg-sunken border border-border-control">
                  <p className="text-caption-13 text-text-muted">Submitted</p>
                  <p className="text-body font-semibold">{item.submitted}</p>
                </div>
                <div className="p-3 rounded bg-sunken border border-border-control">
                  <p className="text-caption-13 text-text-muted">Marked</p>
                  <p className="text-body font-semibold">{item.marked || '—'}</p>
                </div>
                <div className="p-3 rounded bg-sunken border border-border-control">
                  <p className="text-caption-13 text-text-muted">Score</p>
                  <p className="text-body font-mono font-bold">{item.score !== null ? item.score : '—'} / {item.maxScore}</p>
                </div>
              </div>

              {item.comment && (
                <div className="p-4 rounded bg-raised border border-border-control mb-4">
                  <p className="text-caption-13 text-text-secondary font-semibold mb-2">Marker comment</p>
                  <p className="text-body">{item.comment}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-border-control">
                <NavLink to={`/matter/${item.id.toLowerCase()}`} className="btn btn-outline btn-sm">
                  View matter
                </NavLink>
              </div>
            </div>
          ))}
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
