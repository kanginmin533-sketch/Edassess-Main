import { useState } from 'react';
import { FolderOpen, Download, FileText, Search } from 'lucide-react';
import useReviewModules, { formatFileSize } from '../../hooks/useReviewModules';

const CATEGORIES = ['All', 'GenEd', 'ProfEd', 'Major'];

// Matches the u-badge convention used in UserDashboard.jsx
const CATEGORY_BADGE = {
  GenEd:  'u-badge u-badge-success',
  ProfEd: 'u-badge u-badge-blue',
  Major:  'u-badge u-badge-purple',
};

export default function ReviewModulesPage() {
  const { modules, downloadModule } = useReviewModules();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = modules.filter((m) => {
    const matchCat = filter === 'All' || m.category === filter;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <div className="user-topbar">
        <div className="user-topbar-left">
          <h1>Review Modules</h1>
          <p>Reviewer files uploaded by your instructors — download and study offline</p>
        </div>
      </div>

      <div className="user-content">
        <div className="user-card">
          <div className="user-card-header">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`exam-btn ${filter === cat ? 'exam-btn-primary' : 'exam-btn-secondary'}`}
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="user-search" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={15} />
              <input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13 }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: 10, color: 'var(--user-text-muted)' }}>
              <FolderOpen size={40} />
              <p style={{ margin: 0, fontSize: 13.5 }}>
                {modules.length === 0
                  ? 'No review modules available yet. Check back once your instructor uploads some.'
                  : 'No modules match your search.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', borderBottom: '1px solid var(--user-border)',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'var(--user-accent-soft)', color: 'var(--user-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--user-text)' }}>{m.title}</span>
                      <span className={CATEGORY_BADGE[m.category]}>{m.category}</span>
                    </div>
                    {m.description && (
                      <p style={{ margin: '0 0 3px', fontSize: 12, color: 'var(--user-text-sub)' }}>{m.description}</p>
                    )}
                    <p style={{ margin: 0, fontSize: 11.5, color: 'var(--user-text-muted)' }}>
                      {m.fileName} · {formatFileSize(m.fileSize)} · {new Date(m.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <button
                    className="exam-btn exam-btn-primary"
                    style={{ fontSize: 12, padding: '8px 16px', flexShrink: 0 }}
                    onClick={() => downloadModule(m)}
                  >
                    <Download size={13} /> Download
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="user-save-bar" style={{ padding: '12px 20px', fontSize: 12, color: 'var(--user-text-muted)' }}>
            Showing {filtered.length} of {modules.length} modules
          </div>
        </div>
      </div>
    </>
  );
}