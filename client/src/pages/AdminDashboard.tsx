import { NavLink } from 'react-router-dom';

const STATS = [
  { label: 'Active students', value: '142', change: '+12 this month' },
  { label: 'Matters submitted', value: '890', change: '+34 this week' },
  { label: 'Pending marks', value: '23', change: '3 overdue' },
  { label: 'Active markers', value: '8', change: 'All active' },
];

const RECENT_ACTIVITY = [
  { actor: 'A. Nkosi', action: 'submitted Employment dispute memo', time: '2 hours ago' },
  { actor: 'B. van der Merwe', action: 'submitted Contract review brief', time: '5 hours ago' },
  { actor: 'C. Dlamini', action: 'received feedback on Constitutional law problem', time: '1 day ago' },
  { actor: 'D. Botha', action: 'submitted Property law memo', time: '2 days ago' },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <h2 className="text-title mb-8">Administrator overview</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex justify-between items-start mb-2">
                <p className="text-caption-13 text-text-muted">{stat.label}</p>
                <span className="text-caption-13 text-text-secondary">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-body font-semibold mb-4">Recent activity</h3>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.actor} className="flex items-start gap-3 border-b border-border-control pb-3 last:border-0">
                  <div className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {activity.actor.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-body">{activity.actor} {activity.action}</p>
                    <p className="text-caption-13 text-text-muted">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-body font-semibold mb-4">Quick actions</h3>
            <div className="space-y-3">
              <NavLink to="/admin/users" className="btn btn-secondary btn-full text-left justify-start py-3">
                Manage users and invites
              </NavLink>
              <NavLink to="/admin/tasks" className="btn btn-secondary btn-full text-left justify-start py-3">
                Task builder
              </NavLink>
              <NavLink to="/admin/audit" className="btn btn-secondary btn-full text-left justify-start py-3">
                View audit log
              </NavLink>
              <button className="btn btn-secondary btn-full text-left justify-start py-3">
                Export reports
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
