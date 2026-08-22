import { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Users, TrendingUp } from 'lucide-react';
import useAuthStore from '../../auth/useAuthStore';
import { examApi } from '../../api/examApi';

const ICON_MAP = { BookOpen, ClipboardList, Users, TrendingUp };

const CATEGORY_BADGE = {
  GenEd:  'inst-badge inst-badge-blue',
  ProfEd: 'inst-badge inst-badge-purple',
  Major:  'inst-badge inst-badge-amber',
};

const STATUS_BADGE = {
  active:    'inst-badge inst-badge-success',
  draft:     'inst-badge inst-badge-neutral',
  completed: 'inst-badge inst-badge-blue',
};

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await examApi.getInstructorDashboard();
        setStats(data.stats);
        setRecentExams(data.recent_exams);
      } catch (err) {
        console.error('Failed to load instructor dashboard:', err);
      } finally {
        setFetching(false);
      }
    }
    loadDashboard();
  }, []);

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <>
      <div className="inst-topbar">
        <div className="inst-topbar-left">
          <h1>Dashboard</h1>
          <p>{greeting}, {user?.name?.split(' ')[0] || 'Instructor'} — here's your class overview</p>
        </div>
        <div className="inst-topbar-right">
          <span className="inst-topbar-badge">
            <span style={{ width: 7, height: 7, background: 'var(--inst-accent)', borderRadius: '50%', display: 'inline-block' }} />
            Instructor
          </span>
        </div>
      </div>

      <div className="inst-content">
        {/* Stats */}
        <div className="inst-stats-grid">
          {stats.map(({ label, value, sub, icon, color }) => {
            const Icon = ICON_MAP[icon];
            return (
              <div className="inst-stat-card" key={label}>
                <div className="inst-stat-header">
                  <span className="inst-stat-label">{label}</span>
                  <div className={`inst-stat-icon ${color}`}><Icon size={16} /></div>
                </div>
                <div className="inst-stat-value">{value}</div>
                <div className="inst-stat-sub">{sub}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Exams */}
        <div className="inst-card">
          <div className="inst-card-header">
            <div>
              <h3>Recent Exams</h3>
              <p>Your latest created assessments</p>
            </div>
          </div>
          <table className="inst-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Category</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExams.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--inst-text-sub)' }}>
                    No exams created yet.
                  </td>
                </tr>
              ) : (
                recentExams.map((exam) => (
                  <tr key={exam.name}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{exam.name}</td>
                    <td><span className={CATEGORY_BADGE[exam.category]}>{exam.category}</span></td>
                    <td>{exam.questions} items</td>
                    <td style={{ color: 'var(--inst-text-sub)', fontSize: 13 }}>{exam.duration}</td>
                    <td><span className={STATUS_BADGE[exam.status]}>{exam.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}