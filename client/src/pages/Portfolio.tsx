import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

interface ProgressRecord {
  id: string;
  status: string;
  mark: number | null;
  task: {
    id: string;
    title: string;
    practiceArea: string;
    status: string;
    releaseAt: string | null;
    deadlineAt: string | null;
  };
  submission: {
    id: string;
    status: string;
    submittedAt: string | null;
    late: boolean;
    wordCount: number;
  } | null;
}

export function Portfolio() {
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then((data) => {
        setProgress(data.progress || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Available',
    STARTED: 'Started',
    SUBMITTED: 'Submitted',
    LATE: 'Late',
    MARKED: 'Marked',
    RELEASED: 'Released',
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: 'badge-beige',
    STARTED: 'badge-beige',
    SUBMITTED: 'badge-navy',
    LATE: 'badge badge-danger',
    MARKED: 'badge badge-gold',
    RELEASED: 'badge badge-navy',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-bg">
        <div className="animate-pulse rounded-full h-8 w-8 bg-navy"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="card-title">Your portfolio</h1>
        <p className="card-subtitle">
          All your simulated legal work is labelled for learning purposes.
        </p>
      </div>

      <div className="card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-beige-border">
              <th className="pb-3 text-text-muted">Task</th>
              <th className="pb-3 text-text-muted">Practice area</th>
              <th className="pb-3 text-text-muted">Status</th>
              <th className="pb-3 text-text-muted">Mark</th>
              <th className="pb-3 text-text-muted">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {progress.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  No tasks yet. Check your dashboard for available tasks.
                </td>
              </tr>
            ) : (
              progress.map((p) => (
                <tr key={p.id} className="border-b border-beige-border last:border-0">
                  <td className="py-3">
                    <NavLink
                      to="/matter"
                      className="text-navy font-medium hover:underline"
                    >
                      {p.task.title}
                    </NavLink>
                  </td>
                  <td className="py-3 text-text-surface">{p.task.practiceArea}</td>
                  <td className="py-3">
                    <span className={`badge ${statusColors[p.status]}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {p.mark !== null ? (
                      <span className="font-mono text-navy font-bold">
                        {p.mark}
                      </span>
                    ) : (
                      <span className="text-text-muted">Not available</span>
                    )}
                  </td>
                  <td className="py-3 text-text-surface">
                    {p.submission?.submittedAt ? (
                      <span>{new Date(p.submission.submittedAt).toLocaleDateString('en-ZA')}</span>
                    ) : (
                      <span className="text-text-muted">Not available</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 rounded-lg border border-beige-border bg-beige-soft">
        <p className="text-sm text-text-muted">
          <strong>Simulated work notice:</strong> All tasks, submissions, marks and
          feedback in this portfolio are part of a legal simulation for training
          purposes. They do not constitute legal advice and are not real case work.
        </p>
      </div>
    </div>
  );
}
