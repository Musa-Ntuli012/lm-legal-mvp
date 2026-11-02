import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="card-title">Dashboard</h1>
        <NavLink to="/matter" className="btn btn-primary btn-sm">
          Start matter
        </NavLink>
      </div>

      <div className="card">
        <h2 className="card-title mb-4">Your matter</h2>
        <div className="mb-4">
          <span className="text-text-muted">Status</span>
          <span className="badge badge-beige ml-2">
            {data?.status || 'Available'}
          </span>
        </div>
        <div className="mb-4">
          <span className="text-text-muted">Next action</span>
          <p className="ml-2">{data?.nextAction || 'Start the matter'}</p>
        </div>
        <button
          className="btn btn-primary btn-full w-full mt-6"
          onClick={() => navigateToMatter()}
        >
          {data?.status === 'submitted' ? 'View feedback' : 'Open matter'}
        </button>
      </div>

      {data?.feedback && (
        <div className="card mt-6">
          <h2 className="card-title mb-4">Your feedback</h2>
          <div className="flex justify-between mb-4">
            <span className="text-text-muted">Mark</span>
            <span className="font-mono text-2xl font-bold">
              {data.feedback.total || 0} / 20
            </span>
          </div>
          {data.feedback.comments && (
            <div className="mb-4">
              <span className="text-text-muted">Comments</span>
              <p className="ml-2">{data.feedback.comments}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function navigateToMatter() {
  window.location.href = '/matter';
}
