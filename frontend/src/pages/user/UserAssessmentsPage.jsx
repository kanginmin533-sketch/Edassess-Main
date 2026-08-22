import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, TrendingDown, TrendingUp, Filter, LayoutGrid, List } from 'lucide-react';
import useExamHistory from '../../hooks/useExamHistory';

const CATEGORY_BADGE = {
  GenEd:  'u-badge u-badge-success',
  ProfEd: 'u-badge u-badge-blue',
  Major:  'u-badge u-badge-purple',
};

const scoreColor = (p) => p >= 80 ? 'var(--user-accent)' : p >= 75 ? 'var(--user-amber)' : 'var(--user-danger)';

// Attempt summary per category
const attemptSummary = (history) => {
  const summary = { GenEd: 0, ProfEd: 0, Major: 0 };
  history.forEach((h) => { if (summary[h.short] !== undefined) summary[h.short]++; });
  return summary;
};

// Weak areas derived from every attempt's subjectBreakdown, worst-first.
// Trend compares the subject's earliest vs. most recent attempt in history
// (history is newest-first, so we walk it in reverse to find "earliest").
function getWeakAreas(history) {
  const bySubject = {};
  const chronological = [...history].reverse(); // oldest first

  chronological.forEach((attempt) => {
    Object.entries(attempt.subjectBreakdown || {}).forEach(([subject, s]) => {
      if (!bySubject[subject]) bySubject[subject] = { correct: 0, total: 0, category: attempt.short, points: [] };
      bySubject[subject].correct += s.correct;
      bySubject[subject].total += s.total;
      const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      bySubject[subject].points.push(pct);
    });
  });

  const rows = Object.entries(bySubject).map(([topic, s]) => {
    const errorRate = s.total > 0 ? Math.round((1 - s.correct / s.total) * 100) : 0;
    const first = s.points[0];
    const last = s.points[s.points.length - 1];
    const trend = last <= first ? 'down' : 'up'; // error trending down = improving
    return { topic, category: s.category, errorRate, trend };
  });

  return rows.sort((a, b) => b.errorRate - a.errorRate).slice(0, 5);
}

function ProgressGraph({ data }) {
  const barColors = { GenEd: 'var(--user-accent)', ProfEd: 'var(--user-blue)', Major: 'var(--user-purple)' };
  // Chart shows oldest-to-newest left-to-right
  const chronological = [...data].reverse();
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, marginBottom: 8 }}>
        {chronological.map((item) => (
          <div key={item.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: scoreColor(item.percentage) }}>{item.score}/{item.total}</span>
            <div style={{ width: '100%', background: 'var(--user-border)', borderRadius: '4px 4px 0 0', height: 100, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: `${item.percentage}%`, background: barColors[item.short] || 'var(--user-accent)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '2px dashed var(--user-amber)', position: 'relative', marginBottom: 10 }}>
        <span style={{ position: 'absolute', right: 0, top: -10, fontSize: 10, color: 'var(--user-amber)', fontWeight: 700, background: 'var(--user-surface)', padding: '0 4px' }}>75% passing</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {chronological.map((item, i) => (
          <div key={item.id} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'var(--user-text-muted)' }}>#{i + 1}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
        {Object.entries(barColors).map(([cat, col]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: col }} />
            <span style={{ color: 'var(--user-text-sub)' }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserAssessmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { history, loading } = useExamHistory();
  const [filter, setFilter] = useState('All');
  // Landing tab follows which sidebar link was clicked — /scores → overview,
  // /history → the detailed table. Still switchable in-page either way.
  const [tab, setTab] = useState(location.pathname.endsWith('/history') ? 'history' : 'overview');


  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading your scores...</div>;
  }

  const filtered  = filter === 'All' ? history : history.filter((h) => h.short === filter);
  const attempts  = attemptSummary(history);
  const avgScore  = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.percentage, 0) / history.length) : 0;
  const passCount = history.filter((h) => h.passed).length;
  const bestAttempt = history.length > 0 ? history.reduce((best, h) => h.percentage > best.percentage ? h : best) : null;
  const weakAreas = getWeakAreas(history);

  return (
    <>
      <div className="user-topbar">
        <div className="user-topbar-left">
          <h1>My Scores</h1>
          <p>Performance tracking, attempt history, and weak areas</p>
        </div>
        <div className="user-topbar-right">
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'GenEd', 'ProfEd', 'Major'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid var(--user-border-dark)', cursor: 'pointer', fontFamily: 'var(--user-font)', background: filter === f ? 'var(--user-accent)' : 'var(--user-surface)', color: filter === f ? 'white' : 'var(--user-text-sub)', transition: 'all 0.15s' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 24px 0' }}>
        <button
          onClick={() => setTab('overview')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--user-font)',
            border: `1px solid ${tab === 'overview' ? 'var(--user-accent)' : 'var(--user-border)'}`,
            background: tab === 'overview' ? 'var(--user-accent-soft)' : 'var(--user-surface)',
            color: tab === 'overview' ? 'var(--user-accent)' : 'var(--user-text-sub)',
          }}
        >
          <LayoutGrid size={14} /> Overview
        </button>
        <button
          onClick={() => setTab('history')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--user-font)',
            border: `1px solid ${tab === 'history' ? 'var(--user-accent)' : 'var(--user-border)'}`,
            background: tab === 'history' ? 'var(--user-accent-soft)' : 'var(--user-surface)',
            color: tab === 'history' ? 'var(--user-accent)' : 'var(--user-text-sub)',
          }}
        >
          <List size={14} /> Exam History
        </button>
      </div>

      <div className="user-content">

        {history.length === 0 ? (
          <div className="user-card">
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--user-text-muted)' }}>
              <BarChart2 size={40} style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 13.5 }}>No exams taken yet. Take an exam to start building your score history.</p>
            </div>
          </div>
        ) : (
        <>
        {/* Summary Stats */}
        <div className="user-stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Exams',  value: history.length,                          color: 'blue'   },
            { label: 'Avg. Score',   value: `${avgScore}%`,                          color: 'green'  },
            { label: 'Passed',       value: `${passCount}/${history.length}`,        color: 'purple' },
            { label: 'Best Score',   value: bestAttempt ? `${bestAttempt.score}/${bestAttempt.total}` : '—', color: 'amber'  },
          ].map(({ label, value, color }) => (
            <div className="user-stat-card" key={label}>
              <div className="user-stat-head">
                <span className="user-stat-label">{label}</span>
                <div className={`user-stat-icon ${color}`}><BarChart2 size={15} /></div>
              </div>
              <div className="user-stat-value">{value}</div>
            </div>
          ))}
        </div>

        {/* Attempt Summary per Category */}
        {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { cat: 'GenEd',  label: 'GenEd Attempts',  color: 'var(--user-accent)',  soft: 'var(--user-accent-soft)'  },
            { cat: 'ProfEd', label: 'ProfEd Attempts', color: 'var(--user-blue)',    soft: 'var(--user-blue-soft)'    },
            { cat: 'Major',  label: 'Major Attempts',  color: 'var(--user-purple)',  soft: 'var(--user-purple-soft)'  },
          ].map(({ cat, label, color, soft }) => (
            <div key={cat} style={{ background: soft, border: `1px solid ${color}30`, borderRadius: 'var(--user-radius-lg)', padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{attempts[cat]}</div>
              <div style={{ fontSize: 12, color: 'var(--user-text-muted)', marginTop: 6 }}>times taken</div>
            </div>
          ))}
        </div>
        )}

        <div className="user-two-col" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Progress Graph */}
            {tab === 'overview' && (
            <div className="user-card">
              <div className="user-card-header">
                <div><h3>Score Progress</h3><p>Your exam scores over time</p></div>
                <BarChart2 size={16} style={{ color: 'var(--user-text-muted)' }} />
              </div>
              <div className="user-card-body"><ProgressGraph data={history} /></div>
            </div>
            )}

            {/* History Table */}
            {tab === 'history' && (
            <div className="user-card">
              <div className="user-card-header">
                <div><h3>Exam History</h3><p>All your past assessments</p></div>
                <Filter size={15} style={{ color: 'var(--user-text-muted)' }} />
              </div>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Exam</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, idx) => (
                    <tr key={h.id} onClick={() => navigate(`/dashboard/results/${h.id}`)} style={{ cursor: 'pointer' }}>
                      <td style={{ color: 'var(--user-text-muted)', fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{h.label}</td>
                      <td><span className={CATEGORY_BADGE[h.short]}>{h.short}</span></td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 14, color: scoreColor(h.percentage) }}>
                          {h.score}/{h.total}
                        </span>
                      </td>
                      <td><span className={h.passed ? 'u-badge u-badge-success' : 'u-badge u-badge-danger'}>{h.passed ? '✓ Passed' : '✗ Failed'}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--user-text-muted)' }}>
                        {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '12px 16px', background: 'var(--user-bg)', borderTop: '1px solid var(--user-border)', fontSize: 12.5, color: 'var(--user-text-muted)' }}>
                Showing {filtered.length} of {history.length} exams
              </div>
            </div>
            )}
          </div>

          {/* Weak Areas */}
          <div>
            <div className="user-card">
              <div className="user-card-header">
                <div><h3>Weak Areas</h3><p>Topics that need more attention</p></div>
                <TrendingDown size={16} style={{ color: 'var(--user-danger)' }} />
              </div>
              <div className="user-card-body" style={{ padding: '8px 22px' }}>
                {weakAreas.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--user-text-sub)', padding: '16px 0' }}>
                    Not enough data yet — weak areas appear after a few exam attempts.
                  </p>
                ) : (
                  weakAreas.map(({ topic, category, errorRate, trend }, i) => (
                    <div className="score-row" key={topic}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--user-bg)', border: '1px solid var(--user-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--user-text-muted)', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div className="score-row-info">
                        <h4>{topic}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={CATEGORY_BADGE[category]}>{category}</span>
                          <div className="score-row-bar-wrap" style={{ flex: 1 }}>
                            <div className="score-row-track">
                              <div className="score-row-fill" style={{ width: `${errorRate}%`, background: 'var(--user-danger)' }} />
                            </div>
                            <span className="score-row-pct" style={{ color: 'var(--user-danger)' }}>{errorRate}%</span>
                          </div>
                        </div>
                      </div>
                      <div title={trend === 'down' ? 'Improving' : 'Getting worse'}>
                        {trend === 'down'
                          ? <TrendingDown size={14} style={{ color: 'var(--user-accent)' }} />
                          : <TrendingUp   size={14} style={{ color: 'var(--user-danger)' }} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '12px 22px', background: 'var(--user-bg)', borderTop: '1px solid var(--user-border)', fontSize: 12, color: 'var(--user-text-muted)' }}>
                Error rate = % of questions answered incorrectly across all exams
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </>
  );
}