import { useState, useEffect } from 'react';
import { History, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { activityApi } from '../../api/activityApi';

const PAGE_SIZE = 20;

const CATEGORY_BADGE = {
  auth:     'badge badge-info',
  users:    'badge badge-purple',
  access:   'badge badge-warning',
  settings: 'badge badge-warning',
  exams:    'badge badge-success',
  modules:  'badge badge-neutral',
};

const EMPTY_FILTERS = {
  department: '',
  category: '',
  actor_role: '',
  q: '',
  date_from: '',
  date_to: '',
};

const controlStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--admin-border, #cbd5e1)',
  fontSize: 13,
  color: 'var(--admin-text)',
  background: 'var(--admin-bg-card, #fff)',
};

function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function actorBadge(row) {
  if (row.actor_is_super) return { text: 'Super Admin', cls: 'badge badge-purple' };
  if (row.actor_role === 'admin') return { text: `${row.actor_department} Admin`, cls: 'badge badge-purple' };
  if (row.actor_role === 'instructor') return { text: 'Instructor', cls: 'badge badge-info' };
  if (row.actor_role === 'user') return { text: 'Student', cls: 'badge badge-neutral' };
  return { text: 'System', cls: 'badge' };
}

export default function ActivityLogPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce ang search para hindi mag-request sa bawat keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 350);
    return () => clearTimeout(t);
  }, [filters.q]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = { page, page_size: PAGE_SIZE };
        Object.entries({ ...filters, q: debouncedQ }).forEach(([k, v]) => {
          if (v) params[k] = v;
        });
        const data = await activityApi.getLogs(params);
        if (cancelled) return;
        setRows(data.results || []);
        setTotal(data.count || 0);
        setTotalPages(data.total_pages || 1);
        setCategories(data.categories || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load activity log:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load the activity log.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQ, filters.department, filters.category, filters.actor_role, filters.date_from, filters.date_to]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <div className="admin-topbar">
        <div className="topbar-left">
          <h1>Activity Log</h1>
          <p>Every sign-in, account change, and setting update across CIT and CTE</p>
        </div>
        <div className="topbar-right">
          <span className="topbar-badge">{total} entries</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={filters.department}
                onChange={(e) => setFilter('department', e.target.value)}
                style={controlStyle}
                aria-label="Department"
              >
                <option value="">All departments</option>
                <option value="CIT">CIT</option>
                <option value="CTE">CTE</option>
                <option value="GLOBAL">Global (no department)</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilter('category', e.target.value)}
                style={{ ...controlStyle, textTransform: 'capitalize' }}
                aria-label="Category"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={filters.actor_role}
                onChange={(e) => setFilter('actor_role', e.target.value)}
                style={controlStyle}
                aria-label="Actor role"
              >
                <option value="">All roles</option>
                <option value="admin">Admins</option>
                <option value="instructor">Instructors</option>
                <option value="user">Students</option>
              </select>

              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilter('date_from', e.target.value)}
                style={controlStyle}
                aria-label="From date"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilter('date_to', e.target.value)}
                style={controlStyle}
                aria-label="To date"
              />

              {hasFilters && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setPage(1); setFilters(EMPTY_FILTERS); }}
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="search-bar">
              <Search size={15} />
              <input
                placeholder="Search name, email, or details..."
                value={filters.q}
                onChange={(e) => setFilter('q', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div style={{ margin: '0 22px 14px', padding: '9px 12px', borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', fontSize: 12.5, color: 'var(--admin-danger, #ef4444)' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <Loader2 className="animate-spin" size={32} />
              <p>Loading activity...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <History size={40} />
              <p>{hasFilters ? 'No entries match these filters.' : 'No activity recorded yet. Actions will appear here as people use the platform.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Who</th>
                    <th>What happened</th>
                    <th>Dept</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const badge = actorBadge(row);
                    return (
                      <tr key={row.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--admin-text-sub)' }}>
                          {formatWhen(row.created_at)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{row.actor_name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--admin-text-muted)' }}>{row.actor_email}</div>
                          <span className={badge.cls} style={{ marginTop: 4 }}>{badge.text}</span>
                        </td>
                        <td style={{ maxWidth: 460 }}>
                          <span className={CATEGORY_BADGE[row.category] || 'badge'} style={{ marginBottom: 4 }}>
                            {row.category}
                          </span>
                          <div style={{ fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {row.description}
                          </div>
                        </td>
                        <td>
                          {row.department
                            ? <span className="badge badge-neutral">{row.department}</span>
                            : <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>Global</span>}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                          {row.ip_address || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="save-bar">
            <p>Page {page} of {totalPages}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={13} /> Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}