import { useState, useEffect } from 'react';
import { Users, Search, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { reportApi } from '../../api/reportApi';

const avg = (scores) => Math.round((scores.GenEd + scores.ProfEd + scores.Major) / 3);
const totalAttempts = (attempts) => attempts.GenEd + attempts.ProfEd + attempts.Major;

const scoreColor = (score) => score >= 80 ? 'var(--inst-success)' : score >= 70 ? 'var(--inst-warning)' : 'var(--inst-danger)';
const scoreBg    = (score) => score >= 80 ? 'inst-badge inst-badge-success' : score >= 70 ? 'inst-badge inst-badge-amber' : 'inst-badge inst-badge-danger';

const CATEGORY_BADGE = {
  GenEd:  'inst-badge inst-badge-blue',
  ProfEd: 'inst-badge inst-badge-purple',
  Major:  'inst-badge inst-badge-amber',
};

export default function StudentMonitorPage() {
  const [students, setStudents] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search,    setSearch]    = useState('');
  const [expanded,  setExpanded]  = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortAsc,   setSortAsc]   = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await reportApi.getStudentMonitor();
        setStudents(data.students);
        setWeakAreas(data.weak_areas);
      } catch (err) {
        console.error('Failed to load student monitor data:', err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc((p) => !p);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = students
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av, bv;
      if (sortField === 'name') { av = a.name; bv = b.name; }
      else if (sortField === 'avg') { av = avg(a.scores); bv = avg(b.scores); }
      else { av = a.scores[sortField]; bv = b.scores[sortField]; }
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const SortIcon = ({ field }) =>
    sortField === field
      ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : null;

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading student data...</div>;
  }

  return (
    <>
      <div className="inst-topbar">
        <div className="inst-topbar-left">
          <h1>Student Monitoring</h1>
          <p>Track scores, attempt history, and class weak areas</p>
        </div>
        <div className="inst-topbar-right">
          <div className="inst-search">
            <Search size={15} />
            <input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="inst-content">
        <div className="inst-two-col" style={{ alignItems: 'start' }}>

          {/* Student Score Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="inst-card">
              <div className="inst-card-header">
                <div>
                  <h3>Student Scores & Attempt History</h3>
                  <p>Click a student row to view full breakdown</p>
                </div>
                <Users size={16} style={{ color: 'var(--inst-text-muted)' }} />
              </div>

              {filtered.length === 0 ? (
                <div className="inst-empty"><Users size={40} /><p>No student attempts yet.</p></div>
              ) : (
              <table className="inst-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Student <SortIcon field="name" /></span>
                    </th>
                    <th onClick={() => toggleSort('GenEd')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>GenEd <SortIcon field="GenEd" /></span>
                    </th>
                    <th onClick={() => toggleSort('ProfEd')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>ProfEd <SortIcon field="ProfEd" /></span>
                    </th>
                    <th onClick={() => toggleSort('Major')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Major <SortIcon field="Major" /></span>
                    </th>
                    <th onClick={() => toggleSort('avg')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Avg <SortIcon field="avg" /></span>
                    </th>
                    <th>Total Takes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <>
                      <tr key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--inst-accent-soft)', color: 'var(--inst-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--inst-text-muted)' }}>{s.lastActive}</div>
                            </div>
                          </div>
                        </td>
                        {['GenEd', 'ProfEd', 'Major'].map((cat) => (
                          <td key={cat}>
                            <div>
                              <span className={scoreBg(s.scores[cat])}>{s.scores[cat]}%</span>
                              <div style={{ fontSize: 10, color: 'var(--inst-text-muted)', marginTop: 2 }}>{s.attempts[cat]} take{s.attempts[cat] !== 1 ? 's' : ''}</div>
                            </div>
                          </td>
                        ))}
                        <td><span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(avg(s.scores)) }}>{avg(s.scores)}%</span></td>
                        <td>
                          <span className="inst-badge inst-badge-blue">{totalAttempts(s.attempts)} total</span>
                        </td>
                      </tr>

                      {expanded === s.id && (
                        <tr key={`${s.id}-exp`}>
                          <td colSpan={6} style={{ background: 'var(--inst-bg)', padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--inst-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Full Breakdown — {s.name}
                            </div>

                            {Object.entries(s.scores).map(([cat, score]) => (
                              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <span style={{ width: 60, fontSize: 12, fontWeight: 600, color: 'var(--inst-text-sub)' }}>{cat}</span>
                                <div style={{ flex: 1, height: 8, background: 'var(--inst-border)', borderRadius: 4, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: 4 }} />
                                </div>
                                <span style={{ width: 36, fontSize: 12, fontWeight: 700, color: scoreColor(score), textAlign: 'right' }}>{score}%</span>
                                <span style={{ fontSize: 11, color: 'var(--inst-text-muted)', width: 60 }}>{s.attempts[cat]} take{s.attempts[cat] !== 1 ? 's' : ''}</span>
                              </div>
                            ))}

                            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--inst-surface)', borderRadius: 8, border: '1px solid var(--inst-border)', fontSize: 12 }}>
                              <span style={{ color: 'var(--inst-text-muted)' }}>Total exam attempts: </span>
                              <strong>{totalAttempts(s.attempts)}</strong>
                              <span style={{ margin: '0 12px', color: 'var(--inst-border-dark)' }}>|</span>
                              <span style={{ color: 'var(--inst-text-muted)' }}>GenEd: </span><strong>{s.attempts.GenEd}</strong>
                              <span style={{ margin: '0 8px', color: 'var(--inst-border-dark)' }}>·</span>
                              <span style={{ color: 'var(--inst-text-muted)' }}>ProfEd: </span><strong>{s.attempts.ProfEd}</strong>
                              <span style={{ margin: '0 8px', color: 'var(--inst-border-dark)' }}>·</span>
                              <span style={{ color: 'var(--inst-text-muted)' }}>Major: </span><strong>{s.attempts.Major}</strong>
                              <span style={{ margin: '0 12px', color: 'var(--inst-border-dark)' }}>|</span>
                              <span style={{ color: 'var(--inst-text-muted)' }}>Last active: </span><strong>{s.lastActive}</strong>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
              )}

              <div className="inst-save-bar">
                <p>Showing {filtered.length} of {students.length} students</p>
              </div>
            </div>
          </div>

          {/* Weak Areas Panel */}
          <div>
            <div className="inst-card">
              <div className="inst-card-header">
                <div>
                  <h3>Class Weak Areas</h3>
                  <p>Topics with the highest error rates</p>
                </div>
                <TrendingDown size={16} style={{ color: 'var(--inst-danger)' }} />
              </div>
              <div className="inst-card-body" style={{ padding: '8px 22px' }}>
                {weakAreas.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--inst-text-sub)', padding: '16px 0' }}>
                    No data yet — weak areas appear once students complete exams.
                  </p>
                ) : (
                  weakAreas.map(({ topic, category, errorRate }, i) => (
                    <div className="weak-area-item" key={topic}>
                      <div className="weak-area-rank">#{i + 1}</div>
                      <div className="weak-area-info">
                        <h4>{topic}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={CATEGORY_BADGE[category]}>{category}</span>
                          <div className="weak-area-bar-wrap" style={{ flex: 1 }}>
                            <div className="weak-area-bar-track">
                              <div className="weak-area-bar-fill" style={{ width: `${errorRate}%` }} />
                            </div>
                          </div>
                          <span className="weak-area-pct">{errorRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="inst-save-bar">
                <p>Error rate = % of students who answered incorrectly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}