import { NavLink } from 'react-router-dom';

const NOTIFICATIONS = [
  { id: '1', title: 'New feedback available', body: 'Your memo draft for Matter EMP-001 has been marked.', time: '2 hours ago', read: false },
  { id: '2', title: 'Upcoming deadline', body: 'Delict problem question due Friday 21 June.', time: '1 day ago', read: false },
  { id: '3', title: 'Matter assigned', body: 'You have been assigned to Matter CONST-003.', time: '3 days ago', read: true },
  { id: '4', title: 'Weekly summary', body: 'You submitted 2 matters this week.', time: '5 days ago', read: true },
];

export function NotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            Notifications
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <h2 className="text-title mb-8">Notifications</h2>

        <div className="space-y-4">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className={`card ${!n.read ? 'border-primary' : ''} group cursor-pointer`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-body font-semibold">{n.title}</h3>
                  <p className="text-body text-text-secondary mt-1">{n.body}</p>
                  <p className="text-caption-13 text-text-muted mt-2">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-3 h-3 rounded-full bg-primary ml-3 flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">LM Legal built for South African law graduates</p>
        </div>
      </footer>
    </div>
  );
}
