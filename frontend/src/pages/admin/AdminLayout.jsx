import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, ShieldCheck,
  BarChart2, Settings, LogOut, GraduationCap, FolderOpen
} from 'lucide-react';
import useAuthStore from '../../auth/useAuthStore';
import authApi from '../../api/authApi';
import './admin.css';

const NAV_ITEMS = [
  { to: '/admin',         label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/admin/users',   label: 'Users',            icon: Users },
  { to: '/admin/exams',   label: 'Exam Config',      icon: FileText },
  { to: '/admin/modules', label: 'Review Modules',   icon: FolderOpen },
  { to: '/admin/access',  label: 'Access Control',   icon: ShieldCheck },
  { to: '/admin/reports', label: 'Reports',          icon: BarChart2 },
  { to: '/admin/settings',label: 'Settings',         icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // still logout client-side even if server fails
    } finally {
      logout();
      navigate('/', { replace: true });
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={17} />
          </div>
          <div className="sidebar-brand-text">
            <span>EduAssess</span>
            <span>Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main Menu</div>
          <ul className="sidebar-nav">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'Administrator'}</span>
              <span className="sidebar-user-role">{user?.role || 'admin'}</span>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}