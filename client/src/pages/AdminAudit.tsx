const AUDIT_LOGS = [
  { id: '1', actor: 'F. Admin', action: 'Created task', target: 'Employment dispute memo', time: '2 hours ago', ip: '102.132.45.12' },
  { id: '2', actor: 'E. Petersen', action: 'Published marks', target: 'Contract review brief - B. van der Merwe', time: '5 hours ago', ip: '102.132.45.15' },
  { id: '3', actor: 'F. Admin', action: 'Invited user', target: 'C. Dlamini (student)', time: '1 day ago', ip: '102.132.45.12' },
  { id: '4', actor: 'A. Nkosi', action: 'Submitted matter', target: 'Property law memo', time: '2 days ago', ip: '102.132.45.20' },
  { id: '5', actor: 'F. Admin', action: 'Updated rubric', target: 'Constitutional law problem', time: '3 days ago', ip: '102.132.45.12' },
];

export function AdminAudit() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <h2 className="text-title mb-8">Audit log</h2>
        <p className="text-body mb-6">
          A record of administrative actions and system events.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-control">
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Time</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Actor</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Action</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Target</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">IP address</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="border-b border-border-control hover:bg-raised transition-colors">
                  <td className="py-4 text-body font-mono">{log.time}</td>
                  <td className="py-4 text-body">{log.actor}</td>
                  <td className="py-4 text-body">{log.action}</td>
                  <td className="py-4 text-body font-mono">{log.target}</td>
                  <td className="py-4 text-body font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 card">
          <h3 className="text-body font-semibold mb-4">Export audit log</h3>
          <p className="text-body mb-4">
            Download the complete audit trail as a CSV file for compliance records.
          </p>
          <button className="btn btn-secondary elevate">
            Export CSV
          </button>
        </div>
      </main>

    </div>
  );
}
