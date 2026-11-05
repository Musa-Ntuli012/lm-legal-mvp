import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AccountPage() {
  const _navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'data', label: 'Your data' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded bg-raised border border-border-control flex items-center justify-center text-primary font-bold text-lg">
                  S
                </div>
                <div>
                  <p className="text-body font-semibold">Student Name</p>
                  <p className="text-caption-13 text-text-muted">student@example.org</p>
                </div>
              </div>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary text-white shadow-shadow-md'
                        : 'text-text-secondary hover:bg-raised hover:text-text-deep'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 space-y-6">
            {activeTab === 'profile' && (
              <>
                <div className="card">
                  <h3 className="text-body font-semibold mb-4">Profile</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="label" htmlFor="account-name">Full name</label>
                      <input
                        type="text"
                        id="account-name"
                        className="input"
                        defaultValue="Student Name"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="account-email">Email address</label>
                      <input
                        type="email"
                        id="account-email"
                        className="input"
                        defaultValue="student@example.org"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="account-institution">Institution</label>
                      <input
                        type="text"
                        id="account-institution"
                        className="input"
                        defaultValue="University of Cape Town"
                      />
                    </div>
                    <button type="button" className="btn btn-secondary">
                      Save changes
                    </button>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'data' && (
              <>
                <div className="card">
                  <h3 className="text-body font-semibold mb-4">Your data</h3>
                  <p className="text-body mb-4">
                    Export your submissions, marks and feedback as a portable file.
                  </p>
                  <button className="btn btn-secondary elevate">
                    Export portfolio data
                  </button>
                  <div className="mt-6 pt-6 border-t border-border-control">
                    <p className="text-caption-13 text-text-secondary font-semibold mb-2">Delete account</p>
                    <p className="text-body text-error mb-4">
                      Deleting your account removes all your submissions and feedback. This cannot be undone.
                    </p>
                    <button className="btn btn-danger">
                      Delete my account
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className="card">
                  <h3 className="text-body font-semibold mb-4">Security</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="label" htmlFor="security-password">Current password</label>
                      <input type="password" id="security-password" className="input" />
                    </div>
                    <div>
                      <label className="label" htmlFor="security-new-password">New password</label>
                      <input type="password" id="security-new-password" className="input" />
                    </div>
                    <button type="button" className="btn btn-secondary">
                      Change password
                    </button>
                  </form>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

    </div>
  );
}
