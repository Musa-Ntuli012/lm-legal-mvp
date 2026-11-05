import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const USERS = [
  { id: '1', name: 'A. Nkosi', email: 'ankosi@university.ac.za', role: 'Student', status: 'Active', joined: 'Jan 2024' },
  { id: '2', name: 'B. van der Merwe', email: 'bvander@university.ac.za', role: 'Student', status: 'Active', joined: 'Jan 2024' },
  { id: '3', name: 'C. Dlamini', email: 'cdlamini@university.ac.za', role: 'Student', status: 'Active', joined: 'Feb 2024' },
  { id: '4', name: 'D. Botha', email: 'dbotha@university.ac.za', role: 'Student', status: 'Inactive', joined: 'Mar 2024' },
  { id: '5', name: 'E. Petersen', email: 'epetersen@university.ac.za', role: 'Marker', status: 'Active', joined: 'Jan 2024' },
  { id: '6', name: 'F. Admin', email: 'admin@lmlegal.co.za', role: 'Administrator', status: 'Active', joined: 'Jan 2024' },
];

export function UsersAndInvitesPage() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-title">Users and invites</h2>
          <button
            onClick={() => setShowInvite(true)}
            className="btn btn-primary elevate"
          >
            Invite user
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-control">
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Name</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Email</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Role</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Status</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Joined</th>
                <th className="pb-3 text-caption-13 text-text-secondary font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((user) => (
                <tr key={user.id} className="border-b border-border-control hover:bg-raised transition-colors">
                  <td className="py-4 text-body">{user.name}</td>
                  <td className="py-4 text-body font-mono">{user.email}</td>
                  <td className="py-4 text-body">
                    <span className="badge badge-navy">{user.role}</span>
                  </td>
                  <td className="py-4 text-body">
                    <span className={`badge ${user.status === 'Active' ? 'badge-published' : 'badge-draft'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-body font-mono">{user.joined}</td>
                  <td className="py-4">
                    <button className="btn btn-outline btn-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center page-enter animate-fade-in">
          <div className="bg-raised border border-border-control rounded-lg p-8 max-w-md w-full shadow-shadow-md">
            <h3 className="text-title mb-6">Invite user</h3>
            <form className="space-y-4 mb-6">
              <div>
                <label className="label" htmlFor="invite-email">Email address</label>
                <input
                  type="email"
                  id="invite-email"
                  className="input"
                  placeholder="name@example.org"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="invite-role">Role</label>
                <select id="invite-role" className="input">
                  <option>Student</option>
                  <option>Marker</option>
                  <option>Administrator</option>
                </select>
              </div>
            </form>
            <div className="flex gap-3">
              <button onClick={() => setShowInvite(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button className="btn btn-primary btn-lg elevate flex-1">
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
