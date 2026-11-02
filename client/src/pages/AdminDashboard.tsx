import { useState, useEffect } from 'react';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markerEmail, setMarkerEmail] = useState('');
  const [markerName, setMarkerName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreateMarker = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: markerEmail, name: markerName, csrf_token: '' }),
      });
      if (res.ok) {
        setMarkerEmail('');
        setMarkerName('');
        // Refresh overview
        fetch('/api/admin/overview').then((r) => r.json()).then(setData);
      } else {
        alert('Create failed');
      }
    } catch (err) {
      alert('Create failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="card-title">Admin</h1>
        <span className="badge badge-navy">Administrator</span>
      </div>

      <div className="card mb-6">
        <h2 className="card-title mb-4">Create marker account</h2>
        <form onSubmit={handleCreateMarker} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Investor's email</label>
            <input
              type="email"
              value={markerEmail}
              onChange={(e) => setMarkerEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label">Investor's name</label>
            <input
              type="text"
              value={markerName}
              onChange={(e) => setMarkerName(e.target.value)}
              required
              className="input"
            />
          </div>
          <td colSpan={2}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create account'}
            </button>
          </td>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title mb-4">Cohort overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded bg-beige-surface border border-beige-border">
            <div className="text-text-muted text-sm">Total students</div>
            <div className="text-2xl font-bold">{data?.totalStudents || 0}</div>
          </div>
          <div className="p-4 rounded bg-beige-surface border border-beige-border">
            <div className="text-text-muted text-sm">Active</div>
            <div className="text-2xl font-bold">{data?.activeStudents || 0}</div>
          </div>
          <div className="p-4 rounded bg-beige-surface border border-beige-border">
            <div className="text-text-muted text-sm">Pending submissions</div>
            <div className="text-2xl font-bold">{data?.pendingSubmissions || 0}</div>
          </div>
          <div className="p-4 rounded bg-beige-surface border border-beige-border">
            <div className="text-text-muted text-sm">Marked</div>
            <div className="text-2xl font-bold">{data?.markedSubmissions || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
