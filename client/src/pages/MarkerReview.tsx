import { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';

export function MarkerReview() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch(`/api/marker/review/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        const initScores: Record<string, number> = {};
        const initComments: Record<string, string> = {};
        (d.review?.scores || []).forEach((sc: any) => {
          initScores[sc.criterion_id] = sc.score;
          initComments[sc.criterion_id] = sc.comment || '';
        });
        setScores(initScores);
        setComments(initComments);
        setFeedback(d.review?.feedback || '');
      })
      .catch(() => setError('Unable to load submission.'));

    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [id]);

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h1 className="card-title">Submission not found</h1>
        <p className="text-text-muted">{error}</p>
        <NavLink to="/marker/dashboard" className="btn btn-primary mt-4">
          Back to dashboard
        </NavLink>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20">Loading…</div>;

  const criteria = data.criteria || [];
  const review = data.review || { total: '', feedback: '', scores: [] };
  const computedTotal = criteria.reduce((t: number, c: any) => {
    return t + (scores[c.id] !== undefined ? scores[c.id] : 0);
  }, 0);

  const handlePublish = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/marker/review/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: Object.keys(scores).map((cid) => ({
            criterion_id: cid,
            score: scores[cid],
            comment: comments[cid] || '',
          })),
          feedback,
          total: review.total !== null && review.total !== undefined ? review.total : computedTotal,
          csrf_token: '',
        }),
      });
      if (res.ok) {
        window.location.href = '/marker/dashboard';
      } else {
        setSaving(false);
        alert('Publish failed');
      }
    } catch (err) {
      setSaving(false);
      alert('Publish failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <h1 className="card-title">Review submission</h1>
          <p className="card-subtitle">Score each criterion 0 to 4, then add overall comments.</p>
        </div>

        <div className="mb-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="pb-2 text-text-muted">Criterion</th>
                <th className="pb-2 text-text-muted">Weight</th>
                <th className="pb-2 text-center" colSpan={5}>Score</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c: any) => (
                <tr key={c.id}>
                  <td className="pb-2 border-b border-beige-border">{c.name}</td>
                  <td className="pb-2 border-b border-beige-border">{c.weight}</td>
                  <td className="pb-2 border-b border-beige-border text-center" colSpan={5}>
                    <div className="flex justify-center gap-1">
                      {[0, 1, 2, 3, 4].map((v) => (
                        <button
                          key={v}
                          onClick={() => setScores({ ...scores, [c.id]: v })}
                          className={`w-8 h-8 rounded border flex items-center justify-center font-bold ${
                            scores[c.id] === v
                              ? 'bg-navy text-white border-navy'
                              : 'bg-beige-surface border-beige-border text-text-deep hover:bg-beige-soft'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card mb-6">
          <h3 className="card-title mb-2" style={{ fontSize: '16px' }}>Overall feedback</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="input w-full h-32"
            placeholder="Write your feedback comments…"
          />
          <div className="flex justify-between mt-4 text-xs text-text-muted">
            <span>Elapsed: {elapsed}s</span>
            <span>Total: {review.total !== null && review.total !== undefined ? review.total : computedTotal} / 20</span>
          </div>
        </div>

        <div className="flex gap-3">
          <NavLink to="/marker/dashboard" className="btn btn-outline btn-sm">
            Cancel
          </NavLink>
          <button
            className="btn btn-primary btn-sm"
            disabled={saving}
            onClick={handlePublish}
          >
            {saving ? 'Publishing…' : 'Publish feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
