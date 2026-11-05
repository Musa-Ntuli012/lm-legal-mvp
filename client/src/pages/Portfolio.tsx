import { NavLink } from 'react-router-dom';

const SUBMISSIONS = [
  { id: '1', title: 'Memo draft - Employment dispute', date: 'Fri 7 Jun 2024', score: 72, maxScore: 100, rubric: 'Published' },
  { id: '2', title: 'Contract review brief', date: 'Fri 31 May 2024', score: 58, maxScore: 100, rubric: 'Published' },
  { id: '3', title: 'Constitutional law problem', date: 'Fri 24 May 2024', score: null, maxScore: 100, rubric: 'Pending' },
  { id: '4', title: 'Property law memo', date: 'Fri 17 May 2024', score: 81, maxScore: 100, rubric: 'Published' },
  { id: '5', title: 'Delict problem question', date: 'Fri 10 May 2024', score: 67, maxScore: 100, rubric: 'Published' },
];

export function Portfolio() {
  const average = SUBMISSIONS.filter(s => s.score !== null).reduce((acc, s) => acc + (s.score || 0), 0) / SUBMISSIONS.filter(s => s.score !== null).length;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <h2 className="text-title mb-8">Your progress</h2>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="card">
            <p className="text-caption-13 text-text-muted">Average score</p>
            <div className="text-4xl font-bold text-primary mt-2">{average.toFixed(0)}</div>
            <p className="text-caption-13 text-text-muted mt-2">out of 100</p>
          </div>
          <div className="card">
            <p className="text-caption-13 text-text-muted">Matters submitted</p>
            <div className="text-4xl font-bold text-primary mt-2">{SUBMISSIONS.length}</div>
            <p className="text-caption-13 text-text-muted mt-2">this period</p>
          </div>
          <div className="card">
            <p className="text-caption-13 text-text-muted">Pending marks</p>
            <div className="text-4xl font-bold text-primary mt-2">1</div>
            <p className="text-caption-13 text-text-muted mt-2">awaiting feedback</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-body font-semibold">Submission history</h3>
              <p className="text-caption-13 text-text-muted">All your marked work</p>
            </div>
            <NavLink to="/export" className="text-xs text-primary hover:text-primary font-medium underline underline-offset-2">
              Export portfolio
            </NavLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-control">
                  <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Task</th>
                  <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Date</th>
                  <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Score</th>
                  <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {SUBMISSIONS.map((s) => (
                  <tr key={s.id} className="border-b border-border-control hover:bg-raised transition-colors">
                    <td className="py-4 text-body">{s.title}</td>
                    <td className="py-4 text-body font-mono">{s.date}</td>
                    <td className="py-4 text-body font-mono">
                      {s.score !== null ? `${s.score} / ${s.maxScore}` : '—'}
                    </td>
                    <td className="py-4">
                      <span className={`badge ${s.rubric === 'Published' ? 'badge-published' : s.rubric === 'Pending' ? 'badge-draft' : 'badge-needs-attention'}`}>
                        {s.rubric}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

    </div>
  );
}
