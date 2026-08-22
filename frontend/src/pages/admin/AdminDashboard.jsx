import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import useAuthStore from '../../auth/useAuthStore';
import { adminApi } from '../../api/adminApi';

const ICON_MAP = { Users, FileText, CheckCircle, Clock };

const ROLE_BADGE = {
  admin:      'badge badge-purple',
  instructor: 'badge badge-info',
  user:       'badge badge-neutral',
};

const STATUS_BADGE = {
  active:   'badge badge-success',
  inactive: 'badge badge-warning',
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  const [stats, setStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminApi.getDashboard();
      setStats(data.stats || []);
      setRecentUsers(data.recent_users || []);
      setActivity(data.activity || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setLoadError(err.response?.data?.detail || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Topbar */}
      <div className="admin-topbar">
        <div className="topbar-left">
          <h1>Dashboard</h1>
          <p>{greeting}, {user?.name?.split(' ')[0] || 'Admin'} — here's today's overview</p>
        </div>
        <div className="topbar-right">
          <span className="topbar-badge">
            <span style={{ width: 7, height: 7, background: 'var(--admin-accent)', borderRadius: '50%', display: 'inline-block' }} />
            Admin
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">

        {loadError && (
          <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', fontSize: 13, color: '#ef4444' }}>
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {stats.map(({ label, value, sub, icon, color }) => {
                const Icon = ICON_MAP[icon] || Users;
                return (
                  <div className="stat-card" key={label}>
                    <div className="stat-card-header">
                      <span className="stat-card-label">{label}</span>
                      <div className={`stat-card-icon ${color}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <div className="stat-card-value">{value}</div>
                    <div className="stat-card-sub">{sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Two columns: Recent Users + Activity */}
            <div className="two-col">

              {/* Recent Users */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Recent Users</h3>
                    <p>Latest registered accounts</p>
                  </div>
                </div>
                {recentUsers.length === 0 ? (
                  <div className="empty-state"><p>No users yet.</p></div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map(({ name, email, role, status }) => (
                        <tr key={email}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--admin-text-muted)' }}>{email}</div>
                          </td>
                          <td><span className={ROLE_BADGE[role] || 'badge'}>{role}</span></td>
                          <td><span className={STATUS_BADGE[status] || 'badge'}>{status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Activity Feed */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Recent Activity</h3>
                    <p>System-wide audit log</p>
                  </div>
                </div>
                <div className="admin-card-body">
                  {activity.length === 0 ? (
                    <div className="empty-state"><p>No recent activity.</p></div>
                  ) : (
                    <div className="activity-list">
                      {activity.map(({ text, time, color }, i) => (
                        <div className="activity-item" key={i}>
                          <div className={`activity-dot ${color}`} />
                          <span className="activity-text">{text}</span>
                          <span className="activity-time">{time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}