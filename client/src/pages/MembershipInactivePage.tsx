import { useAuth } from '../hooks/useAuth';
import { NavLink } from 'react-router-dom';

export function MembershipInactivePage() {
  const { signOut } = useAuth();

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="card">
        <h1 className="card-title">Membership not active</h1>
        <p className="card-subtitle mt-4">
          Your demo membership is not active. Please contact your administrator to activate it.
        </p>
        <button
          className="btn btn-primary mt-6"
          onClick={() => { signOut(); window.location.href = '/signin'; }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
