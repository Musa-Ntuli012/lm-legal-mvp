import { useState, useEffect } from 'react';

export function Feedback() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <h1 className="card-title">Your feedback</h1>
          <p className="card-subtitle">Marker assessment of your submitted memo.</p>
        </div>

        {!data || data.none ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No feedback has been published yet.</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-6">
              <span className="text-text-muted">Mark</span>
              <span className="font-mono text-3xl font-bold text-navy">
                {data.total || 0} / 20
              </span>
            </div>
            {data.comments && (
              <div className="mb-4">
                <span className="text-text-muted">Comments</span>
                <p className="ml-2">{data.comments}</p>
              </div>
            )}
            {data.scores && data.scores.length > 0 && (
              <div>
                <h3 className="card-title mb-2" style={{ fontSize: '16px' }}>Rubric scores</h3>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 text-text-muted">Criterion</th>
                      <th className="pb-2 text-text-muted">Score</th>
                      <th className="pb-2 text-text-muted">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.scores.map((sc: any) => (
                      <tr key={sc.criterion_id}>
                        <td className="pb-2 border-b border-beige-border">{sc.criterion_name || 'Criterion'}</td>
                        <td className="pb-2 border-b border-beige-border">{sc.score}</td>
                        <td className="pb-2 border-b border-beige-border">{sc.comment || 'No comment'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
