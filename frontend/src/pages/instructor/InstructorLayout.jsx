import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList,
  Users, Megaphone, LogOut, GraduationCap, FolderOpen
} from 'lucide-react';
import useAuthStore from '../../auth/useAuthStore';
import authApi from '../../api/authApi';
import './instructor.css';

const NAV_ITEMS = [
  { to: '/instructor',              label: 'Dashboard',        icon: LayoutDashboard, end: true },
  { to: '/instructor/questions',    label: 'Question Bank',    icon: BookOpen },
  { to: '/instructor/exams',        label: 'Exam Builder',     icon: ClipboardList },
  { to: '/instructor/modules',      label: 'Review Modules',   icon: FolderOpen },
  { to: '/instructor/monitor',      label: 'Student Monitor',  icon: Users },
  { to: '/instructor/announcements',label: 'Announcements',    icon: Megaphone },
];

export default function InstructorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* still logout client-side */ }
    finally { logout(); navigate('/', { replace: true }); }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'IN';

  return (
    <div className="inst-shell">
      {/* ── Sidebar ── */}
      <aside className="inst-sidebar">
        <div className="inst-brand">
          <div className="inst-brand-icon">
            <GraduationCap size={17} />
          </div>
          <div className="inst-brand-text">
            <span>EduAssess</span>
            <span>Instructor Panel</span>
          </div>
        </div>

        <div className="inst-sidebar-section">
          <div className="inst-sidebar-label">Main Menu</div>
          <ul className="inst-nav">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inst-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="inst-sidebar-footer">
          <div className="inst-sidebar-user">
            <div className="inst-avatar">{initials}</div>
            <div className="inst-user-info">
              <span className="inst-user-name">{user?.name || 'Instructor'}</span>
              <span className="inst-user-role">{user?.role || 'instructor'}</span>
            </div>
            <button className="inst-logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="inst-main">
        <Outlet />
      </main>
    </div>
  );
}