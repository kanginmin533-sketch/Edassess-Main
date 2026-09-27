import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList,
  BarChart2, LogOut, GraduationCap
} from 'lucide-react';
import useAuthStore from '../../auth/useAuthStore';
import authApi from '../../api/authApi';
import './user.css';
import './cit.css'; // ← bago — mga override na naka-scope sa .cit-user-shell

const NAV_ITEMS = [
  { to: '/dashboard',           label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/dashboard/review',    label: 'Review Modules',  icon: BookOpen },
  { to: '/dashboard/selection', label: 'Take Exam',       icon: ClipboardList },
  { to: '/dashboard/scores',    label: 'My Scores',       icon: BarChart2 },
];

export default function CitUserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* still logout client-side */ }
    finally { logout(); navigate('/', { replace: true }); }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST';

  return (
    <div className="user-shell cit-user-shell" data-department="CIT">
      <aside className="user-sidebar">
        <div className="user-brand">
          <div className="user-brand-icon">
            <GraduationCap size={17} />
          </div>
          <div className="user-brand-text">
            <span>EduAssess</span>
            <span>CIT Student Portal</span>
          </div>
        </div>

        <div className="user-sidebar-section">
          <div className="user-sidebar-label">Navigation</div>
          <ul className="user-nav">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `user-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="user-sidebar-footer">
          <div className="user-sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Student'}</span>
              <span className="user-role-label">CIT Student</span>
            </div>
            <button className="user-logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="user-main">
        <Outlet />
      </main>
    </div>
  );
}