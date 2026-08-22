import { useState, useRef } from 'react';
import { FolderOpen, Plus, Upload, Trash2, Download, X, FileText } from 'lucide-react';
import useReviewModules, { formatFileSize } from '../../hooks/useReviewModules';
import useAuthStore from '../../auth/useAuthStore';

const CATEGORIES = ['All', 'GenEd', 'ProfEd', 'Major'];
const VALID_CATEGORIES = ['GenEd', 'ProfEd', 'Major'];

// Mapped to the badge color classes already used in AdminDashboard/UserPage
// (badge-purple, badge-info, badge-neutral, badge-success, badge-warning)
const CATEGORY_BADGE = {
  GenEd:  'badge badge-info',
  ProfEd: 'badge badge-purple',
  Major:  'badge badge-warning',
};

const EMPTY_FORM = { title: '', description: '', category: 'GenEd', file: null };

export default function ModulesPage() {
  const { user } = useAuthStore();
  const { modules, addModule, removeModule, downloadModule } = useReviewModules();

  const [filter, setFilter]       = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();

  const filtered = filter === 'All' ? modules : modules.filter((m) => m.category === filter);

  const openAdd = () => { setForm(EMPTY_FORM); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); if (fileRef.current) fileRef.current.value = ''; };

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, file, title: p.title || file.name.replace(/\.[^/.]+$/, '') }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Module title is required.');
    if (!form.file) return alert('Please choose a file to upload.');
    if (!VALID_CATEGORIES.includes(form.category)) return alert('Please choose a valid category.');

    setSaving(true);
    try {
      await addModule({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        file: form.file,
        uploadedBy: user?.name || 'Admin',
      });
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save the module. The file may be too large for this browser to store.');
    }
    setSaving(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this review module? Students will no longer be able to download it.')) removeModule(id);
  };

  return (
    <>
      <div className="admin-topbar">
        <div className="topbar-left">
          <h1>Review Modules</h1>
          <p>{modules.length} module(s) uploaded — students can download these from their dashboard</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <Plus size={13} /> Upload Module
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(cat)}>{cat}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={40} />
              <p>No review modules yet. Upload your first file!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                      {m.description && <div style={{ fontSize: 11.5, color: 'var(--admin-text-muted)', marginTop: 2 }}>{m.description}</div>}
                    </td>
                    <td><span className={CATEGORY_BADGE[m.category]}>{m.category}</span></td>
                    <td style={{ fontSize: 12.5, color: 'var(--admin-text-sub)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={13} /> {m.fileName}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{formatFileSize(m.fileSize)}</td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                      {new Date(m.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => downloadModule(m)} title="Download"><Download size={13} /></button>
                        <button className="btn-icon" onClick={() => handleDelete(m.id)} title="Delete" style={{ color: 'var(--admin-danger)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="save-bar">
            <p>Showing {filtered.length} of {modules.length} modules</p>
          </div>
        </div>
      </div>

      {/* Upload Modal — fully self-contained inline styles. No modal CSS exists
          anywhere in admin.css (ExamConfigPage/AccessControlPage use inline
          forms, not modals), so this doesn't depend on any external class
          to render as a proper centered overlay. */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
              background: 'var(--admin-bg-card, #ffffff)', borderRadius: 14,
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: '1px solid var(--admin-border)',
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>Upload Review Module</h3>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--admin-text-muted)', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 22 }}>

              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: '2px dashed var(--admin-border)', borderRadius: 12,
                  padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--admin-bg)', marginBottom: 20,
                }}
              >
                <Upload size={28} style={{ color: 'var(--admin-text-muted)', marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)', margin: '0 0 4px' }}>
                  {form.file ? form.file.name : 'Click to choose a file'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', margin: 0 }}>
                  {form.file ? formatFileSize(form.file.size) : 'PDF, Word, PowerPoint, or any file type'}
                </p>
                <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFilePick} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>
                  Module Title
                </label>
                <input
                  placeholder="e.g. GenEd Reviewer — Mathematics"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    borderRadius: 8, border: '1px solid var(--admin-border)',
                    fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    borderRadius: 8, border: '1px solid var(--admin-border)',
                    fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)',
                  }}
                >
                  <option value="GenEd">GenEd</option>
                  <option value="ProfEd">ProfEd</option>
                  <option value="Major">Major</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>
                  Description <span style={{ fontWeight: 400, color: 'var(--admin-text-muted)' }}>· Optional</span>
                </label>
                <textarea
                  placeholder="Short note about what this reviewer covers..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    borderRadius: 8, border: '1px solid var(--admin-border)',
                    fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)',
                    resize: 'vertical', fontFamily: 'inherit',
                  }}
                />
              </div>

            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              padding: '16px 22px', borderTop: '1px solid var(--admin-border)',
            }}>
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Uploading...' : 'Upload Module'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}