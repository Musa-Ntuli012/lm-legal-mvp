import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export function MarkerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews/queue')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const subs = data?.submissions || [];

  if (loading) return <div className="text-center py-20">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="card-title">Submissions to review</h1>
        <span className="badge badge-beige">{subs.length} pending</span>
      </div>

      <div className="card">
        {subs.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="pb-2 text-text-muted">Student</th>
                <th className="pb-2 text-text-muted">Submitted</th>
                <th className="pb-2 text-text-muted">Decision</th>
                <th className="pb-2 text-text-muted">Words</th>
                <th className="pb-2 text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s: any) => (
                <tr key={s.id}>
                  <td className="pb-2 border-b border-beige-border">{s.student_email || 'Not available'}</td>
                  <td className="pb-2 border-b border-beige-border">{s.submitted_at || 'Not available'}</td>
                  <td className="pb-2 border-b border-beige-border">{s.decision || 'Not available'}</td>
                  <td className="pb-2 border-b border-beige-border">{s.word_count || '0'}</td>
                  <td className="pb-2 border-b border-beige-border">
                    <NavLink to={`/marker/review/${s.id}`} className="btn btn-primary btn-sm">
                      Review
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <h2 className="card-title">Nothing awaiting review</h2>
            <p className="text-text-muted">All submissions have been reviewed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
