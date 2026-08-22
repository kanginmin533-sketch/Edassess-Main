import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, BarChart2, TrendingUp, CheckCircle, Clock, Zap, Award, AlertCircle } from 'lucide-react';
import useAuthStore from '../../auth/useAuthStore';
import useExamHistory from '../../hooks/useExamHistory';

const CATEGORY_BADGE = {
  GenEd:  'u-badge u-badge-success',
  ProfEd: 'u-badge u-badge-blue',
  Major:  'u-badge u-badge-purple',
};

const scoreColor = (s) => s >= 80 ? 'var(--user-accent)' : s >= 70 ? 'var(--user-amber)' : 'var(--user-danger)';

// Classifies a subject's average score into a performance tier for the profile card.
function performanceLevel(pct) {
  if (pct >= 80) return { label: 'Strong', color: 'var(--user-accent)', bg: 'var(--user-accent-soft)' };
  if (pct >= 60) return { label: 'Average', color: 'var(--user-amber)', bg: 'var(--user-amber-soft)' };
  return { label: 'Needs Improvement', color: 'var(--user-danger)', bg: 'var(--user-danger-soft)' };
}

const LET_CATEGORIES = ['GenEd', 'ProfEd', 'Major'];

// The actual PRC/LET passing rule: general average of the three areas must be
// at least 75%, AND no single area may fall below 50% — a high average does
// not save you if one area is a straight failure. This combines the latest
// attempt per category (history is newest-first from useExamHistory).
function getOverallLetStanding(history) {
  const latestByCategory = {};
  history.forEach((a) => {
    if (LET_CATEGORIES.includes(a.short) && !latestByCategory[a.short]) {
      latestByCategory[a.short] = a;
    }
  });

  const missing = LET_CATEGORIES.filter((c) => !latestByCategory[c]);
  if (missing.length > 0) {
    return { complete: false, missing, latestByCategory };
  }

  const scores = LET_CATEGORIES.map((c) => latestByCategory[c].percentage);
  const combinedAverage = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const failedAreas = LET_CATEGORIES.filter((c) => latestByCategory[c].percentage < 50);
  const passed = combinedAverage >= 75 && failedAreas.length === 0;

  return { complete: true, combinedAverage, passed, failedAreas, latestByCategory };
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const [greeting, setGreeting] = useState('');
  const { history, loading, getSubjectSummary } = useExamHistory();

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  // ── Real data derived from exam history ──────────────────────────────────
  const subjectSummary = getSubjectSummary();
  const subjectRows = Object.entries(subjectSummary)
    .map(([subject, s]) => ({ subject, ...s }))
    .sort((a, b) => b.percentage - a.percentage);

  const strongest = subjectRows[0];
  const weakest    = subjectRows.length > 1 ? subjectRows[subjectRows.length - 1] : null;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const attemptsThisWeek = history.filter((h) => new Date(h.date).getTime() > sevenDaysAgo).length;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / history.length)
    : null;

  const STATS = [
    { label: 'Exams Taken',       value: String(history.length),                sub: `${attemptsThisWeek} this week`, icon: ClipboardList, color: 'blue'   },
    { label: 'Avg. Score',        value: avgScore !== null ? `${avgScore}%` : '—', sub: 'All categories',              icon: TrendingUp,    color: 'green'  },
    { label: 'Modules Completed', value: '8',                                   sub: 'of 24 total',                   icon: CheckCircle,   color: 'purple' },
    { label: 'Study Time',        value: '14h',                                 sub: 'Total logged',                  icon: Clock,         color: 'amber'  },
  ];

  const recentScores = history.slice(0, 5).map((h) => ({
    exam: h.label,
    score: h.percentage,
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    category: h.short,
  }));

  const letStanding = getOverallLetStanding(history);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading your dashboard...</div>;
  }

  return (
    <>
      {/* Topbar */}
      <div className="user-topbar">
        <div className="user-topbar-left">
          <h1>Student Dashboard</h1>
          <p>{greeting}, {user?.name?.split(' ')[0] || 'Student'} — keep pushing for that LET! 💪</p>
        </div>
        <div className="user-topbar-right">
          <span className="user-topbar-badge">
            <span style={{ width: 7, height: 7, background: 'var(--user-accent)', borderRadius: '50%', display: 'inline-block' }} />
            Student
          </span>
        </div>
      </div>

      <div className="user-content">

        {/* ── Quick Actions ── */}
        <div className="quick-actions">
          <div className="quick-card green" onClick={() => navigate('/dashboard/review')} style={{ cursor: 'pointer' }}>
            <div className="quick-card-icon green"><BookOpen size={20} /></div>
            <div>
              <p className="quick-card-title">Continue Review</p>
              <p className="quick-card-sub">Pick up where you left off in your review modules</p>
            </div>
            <div className="quick-card-arrow">→</div>
          </div>

          <div className="quick-card blue" onClick={() => navigate('/dashboard/selection')} style={{ cursor: 'pointer' }}>
            <div className="quick-card-icon blue"><ClipboardList size={20} /></div>
            <div>
              <p className="quick-card-title">Take Exam</p>
              <p className="quick-card-sub">Start a LET simulation — timed, real exam conditions</p>
            </div>
            <div className="quick-card-arrow">→</div>
          </div>

          <div className="quick-card purple" onClick={() => navigate('/dashboard/results')} style={{ cursor: 'pointer' }}>
            <div className="quick-card-icon purple"><BarChart2 size={20} /></div>
            <div>
              <p className="quick-card-title">My Scores</p>
              <p className="quick-card-sub">View your performance history and weak areas</p>
            </div>
            <div className="quick-card-arrow">→</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="user-stats-grid">
          {STATS.map(({ label, value, sub, icon: Icon, color }) => (
            <div className="user-stat-card" key={label}>
              <div className="user-stat-head">
                <span className="user-stat-label">{label}</span>
                <div className={`user-stat-icon ${color}`}><Icon size={15} /></div>
              </div>
              <div className="user-stat-value">{value}</div>
              <div className="user-stat-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Overall LET Standing (PRC passing rule) ── */}
        <div className="user-card" style={{ marginBottom: 24 }}>
          <div className="user-card-header">
            <div>
              <h3>Overall LET Standing</h3>
              <p>PRC rule: 75% general average, with no area below 50%</p>
            </div>
          </div>

          <div className="user-card-body">
            {!letStanding.complete ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 'var(--user-radius)', background: 'var(--user-amber-soft)', border: '1px solid rgba(217,119,6,0.2)' }}>
                <AlertCircle size={18} style={{ color: 'var(--user-amber)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: 'var(--user-text)' }}>
                    Standing not yet available
                  </p>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--user-text-sub)', lineHeight: 1.6 }}>
                    Take a simulation for each of the three LET areas to see your overall standing. Still missing:{' '}
                    <strong>{letStanding.missing.join(', ')}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 'var(--user-radius)',
                  background: letStanding.passed ? 'var(--user-accent-soft)' : 'var(--user-danger-soft)',
                  border: `1px solid ${letStanding.passed ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                  marginBottom: 18,
                }}>
                  {letStanding.passed
                    ? <Award size={26} style={{ color: 'var(--user-accent)', flexShrink: 0 }} />
                    : <AlertCircle size={26} style={{ color: 'var(--user-danger)', flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: letStanding.passed ? 'var(--user-accent)' : 'var(--user-danger)' }}>
                      {letStanding.passed ? 'Passing Standing' : 'Not Passing Yet'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'var(--user-text-sub)' }}>
                      {letStanding.passed
                        ? `Combined average of ${letStanding.combinedAverage}% across GenEd, ProfEd, and Major, with every area at 50% or above.`
                        : letStanding.failedAreas.length > 0
                          ? `${letStanding.failedAreas.join(' and ')} ${letStanding.failedAreas.length > 1 ? 'are' : 'is'} below the 50% minimum — this fails the standing regardless of average.`
                          : `Combined average is ${letStanding.combinedAverage}%, below the required 75%.`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: letStanding.passed ? 'var(--user-accent)' : 'var(--user-danger)', lineHeight: 1 }}>
                      {letStanding.combinedAverage}%
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--user-text-muted)', marginTop: 2 }}>Combined avg.</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {LET_CATEGORIES.map((cat) => {
                    const attempt = letStanding.latestByCategory[cat];
                    const isFailingArea = attempt.percentage < 50;
                    return (
                      <div key={cat} style={{
                        padding: '12px 14px', borderRadius: 'var(--user-radius)',
                        background: 'var(--user-bg)', border: `1px solid ${isFailingArea ? 'var(--user-danger)' : 'var(--user-border)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className={CATEGORY_BADGE[cat]}>{cat}</span>
                          {isFailingArea && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--user-danger)' }}>BELOW 50%</span>}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: isFailingArea ? 'var(--user-danger)' : 'var(--user-text)' }}>
                          {attempt.percentage}%
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--user-text-muted)', marginTop: 2 }}>
                          {new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Performance Profile ── */}
        <div className="user-card" style={{ marginBottom: 24 }}>
          <div className="user-card-header">
            <div>
              <h3>Performance Profile</h3>
              <p>Where you're strong and where to focus, based on all {history.length} past attempt{history.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          {subjectRows.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--user-text-muted)', fontSize: 13 }}>
              No exam attempts yet. Take an exam to start building your performance profile.
            </div>
          ) : (
            <div className="user-card-body">
              {/* Highlight callouts */}
              <div style={{ display: 'grid', gridTemplateColumns: weakest ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--user-accent-soft)', borderRadius: 'var(--user-radius)', border: '1px solid rgba(22,163,74,0.15)' }}>
                  <Award size={20} style={{ color: 'var(--user-accent)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--user-text-muted)' }}>Strongest Subject</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--user-text)' }}>{strongest.subject} — {strongest.percentage}%</div>
                  </div>
                </div>
                {weakest && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--user-danger-soft)', borderRadius: 'var(--user-radius)', border: '1px solid rgba(220,38,38,0.15)' }}>
                    <AlertCircle size={20} style={{ color: 'var(--user-danger)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--user-text-muted)' }}>Focus Area</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--user-text)' }}>{weakest.subject} — {weakest.percentage}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Per-subject breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {subjectRows.map(({ subject, correct, total, percentage, attempts }) => {
                  const level = performanceLevel(percentage);
                  return (
                    <div key={subject}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--user-text)' }}>{subject}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: level.color, background: level.bg, padding: '2px 8px', borderRadius: 999 }}>
                            {level.label}
                          </span>
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--user-text-muted)' }}>
                          {correct}/{total} correct · {attempts} attempt{attempts === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--user-border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: level.color, borderRadius: 4, transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="user-two-col">

          {/* ── Recent Scores ── */}
          <div className="user-card">
            <div className="user-card-header">
              <div>
                <h3>Recent Exam Scores</h3>
                <p>Your latest assessment results</p>
              </div>
            </div>
            {recentScores.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--user-text-muted)', fontSize: 13 }}>
                No exams taken yet.
              </div>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScores.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{r.exam}</td>
                      <td><span className={CATEGORY_BADGE[r.category] || 'u-badge u-badge-blue'}>{r.category}</span></td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 14, color: scoreColor(r.score) }}>
                          {r.score}%
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--user-text-muted)' }}>{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── LET Sim Highlight ── */}
          <div className="user-card" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: 'none' }}>
            <div className="user-card-body" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} style={{ color: '#f59e0b' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b' }}>LET Simulation Mode</span>
              </div>

              <div>
                <h3 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Experience the Real Exam
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  Full LET simulation with countdown timer, auto-submit, and real exam conditions. Timed alerts at 30, 10, and 5 minutes remaining.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'GenEd',  detail: '150 items · 2 Hours',  color: '#16a34a' },
                  { label: 'ProfEd', detail: '150 items · 3 Hours',  color: '#2563eb' },
                  { label: 'Major',  detail: '150 items · 3 Hours',  color: '#aa3bff' },
                ].map(({ label, detail, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 13, flex: 1 }}>{label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{detail}</span>
                  </div>
                ))}
              </div>

              <button
                className="exam-btn exam-btn-submit"
                style={{ background: '#f59e0b', color: '#1a1a2e', fontWeight: 800, marginTop: 'auto' }}
                onClick={() => navigate('/dashboard/selection')}
              >
                <Zap size={15} /> Start LET Simulation →
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}