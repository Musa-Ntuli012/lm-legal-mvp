import { NavLink } from 'react-router-dom';

const QUEUE_ITEMS = [
  { id: '1', student: 'A. Nkosi', matter: 'Employment dispute memo', submitted: 'Fri 7 Jun 2024', status: 'unmarked', priority: 'normal' },
  { id: '2', student: 'B. van der Merwe', matter: 'Contract review brief', submitted: 'Fri 31 May 2024', status: 'unmarked', priority: 'high' },
  { id: '3', student: 'C. Dlamini', matter: 'Constitutional law problem', submitted: 'Fri 24 May 2024', status: 'marked', priority: 'normal' },
  { id: '4', student: 'D. Botha', matter: 'Property law memo', submitted: 'Fri 17 May 2024', status: 'marked', priority: 'normal' },
  { id: '5', student: 'E. Petersen', matter: 'Delict problem question', submitted: 'Fri 10 May 2024', status: 'unmarked', priority: 'normal' },
];

export function MarkerDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-title">Marking queue</h2>
          <div className="flex gap-3">
            <button className="btn btn-outline btn-sm">
              All
            </button>
            <button className="btn btn-outline btn-sm">
              Unmarked
            </button>
            <button className="btn btn-outline btn-sm">
              Marked
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-control">
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Student</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Matter</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Submitted</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Status</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {QUEUE_ITEMS.map((item) => (
                <tr key={item.id} className="border-b border-border-control hover:bg-raised transition-colors group">
                  <td className="py-4 text-body">{item.student}</td>
                  <td className="py-4 text-body">{item.matter}</td>
                  <td className="py-4 text-body font-mono">{item.submitted}</td>
                  <td className="py-4">
                    <span className={`badge ${item.status === 'marked' ? 'badge-published' : 'badge-draft'}`}>
                      {item.status === 'marked' ? 'Marked' : 'Unmarked'}
                    </span>
                  </td>
                  <td className="py-4">
                    <NavLink to={`/marker/review/${item.id}`} className="btn btn-outline btn-sm w-full">
                      {item.status === 'marked' ? 'Review' : 'Mark'}
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 card">
          <h3 className="text-body font-semibold mb-4">Your marking stats</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-sunken border border-border-control">
              <p className="text-caption-13 text-text-muted">Marked this week</p>
              <div className="text-2xl font-bold text-primary">2</div>
            </div>
            <div className="p-4 rounded bg-sunken border border-border-control">
              <p className="text-caption-13 text-text-muted">Pending</p>
              <div className="text-2xl font-bold text-primary">3</div>
            </div>
            <div className="p-4 rounded bg-sunken border border-border-control">
              <p className="text-caption-13 text-text-muted">Average time</p>
              <div className="text-2xl font-bold text-primary">12 min</div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
