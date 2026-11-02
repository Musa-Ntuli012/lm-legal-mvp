import { useState, useEffect } from 'react';

export function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit')
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="card-title">Audit log</h1>
        <span className="badge badge-navy">{logs.length} events</span>
      </div>

      <div className="card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-text-muted">Time</th>
              <th className="pb-2 text-text-muted">Actor</th>
              <th className="pb-2 text-text-muted">Action</th>
              <th className="pb-2 text-text-muted">Target</th>
              <th className="pb-2 text-text-muted">Detail</th>
            </tr>
          </thead>
          <tbody>
            {[...logs].reverse().map((l: any) => (
              <tr key={l.id || l.createdAt}>
                <td className="pb-2 border-b border-beige-border">{l.createdAt || 'Not available'}</td>
                <td className="pb-2 border-b border-beige-border">{l.profileId || 'Not available'}</td>
                <td className="pb-2 border-b border-beige-border">{l.action || 'Not available'}</td>
                <td className="pb-2 border-b border-beige-border">{l.target || 'Not available'}</td>
                <td className="pb-2 border-b border-beige-border">{l.detail || 'Not available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
