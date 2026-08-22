import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, X, Pin } from 'lucide-react';
import { announcementApi } from '../../api/modulesApi';

const AUDIENCE_OPTIONS = ['All Students', 'GenEd Students', 'ProfEd Students', 'Major Students'];

const EMPTY_FORM = { title: '', body: '', audience: 'All Students', pinned: false };

export default function AnnouncementsPage() {
  const [items, setItems]         = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await announcementApi.getAnnouncements();
        setItems(data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setFetching(false);
      }
    }
    loadAnnouncements();
  }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (a) => { setEditItem(a.id); setForm({ title: a.title, body: a.body, audience: a.audience, pinned: a.pinned }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditItem(null); };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Title is required.');
    if (!form.body.trim())  return alert('Message body is required.');

    setSaving(true);
    try {
      if (editItem) {
        const updated = await announcementApi.updateAnnouncement(editItem, form);
        setItems((prev) => prev.map((a) => a.id === editItem ? updated : a));
      } else {
        const created = await announcementApi.createAnnouncement(form);
        setItems((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementApi.deleteAnnouncement(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete announcement.');
    }
  };

  const togglePin = async (id) => {
    const target = items.find((a) => a.id === id);
    if (!target) return;
    try {
      const updated = await announcementApi.updateAnnouncement(id, { ...target, pinned: !target.pinned });
      setItems((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to update pin status.');
    }
  };

  const sorted = [...items].sort((a, b) => b.pinned - a.pinned);

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading announcements...</div>;
  }

  return (
    <>
      {/* Topbar */}
      <div className="inst-topbar">
        <div className="inst-topbar-left">
          <h1>Announcements</h1>
          <p>Post and manage announcements for your students</p>
        </div>
        <div className="inst-topbar-right">
          <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={openAdd}>
            <Plus size={13} /> New Announcement
          </button>
        </div>
      </div>

      <div className="inst-content">
        <div className="inst-card">
          <div className="inst-card-header">
            <div>
              <h3>Posted Announcements</h3>
              <p>{items.length} announcement(s) — pinned items appear first</p>
            </div>
            <Megaphone size={16} style={{ color: 'var(--inst-text-muted)' }} />
          </div>

          {sorted.length === 0 ? (
            <div className="inst-empty">
              <Megaphone size={40} />
              <p>No announcements yet. Post your first one!</p>
            </div>
          ) : (
            sorted.map((a) => (
              <div className="ann-item" key={a.id}>
                <div className="ann-item-header">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {a.pinned && (
                        <span className="inst-badge inst-badge-purple" style={{ fontSize: 10 }}>
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      <span className="inst-badge inst-badge-neutral" style={{ fontSize: 10 }}>
                        {a.audience}
                      </span>
                    </div>
                    <h4 className="ann-item-title">{a.title}</h4>
                    <p className="ann-item-meta">Posted {a.date}</p>
                  </div>
                  <div className="ann-item-actions">
                    <button
                      className="inst-btn-icon"
                      onClick={() => togglePin(a.id)}
                      title={a.pinned ? 'Unpin' : 'Pin'}
                      style={{ color: a.pinned ? 'var(--inst-purple)' : 'var(--inst-text-muted)' }}
                    >
                      <Pin size={13} />
                    </button>
                    <button className="inst-btn-icon" onClick={() => openEdit(a)} title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="inst-btn-icon"
                      onClick={() => handleDelete(a.id)}
                      title="Delete"
                      style={{ color: 'var(--inst-danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="ann-item-body">{a.body}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="inst-modal-backdrop" onClick={closeModal}>
          <div className="inst-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inst-modal-header">
              <h3>{editItem ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button className="inst-btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>

            <div className="inst-modal-body">
              <div className="inst-form-group">
                <label className="inst-form-label">Title</label>
                <input
                  className="inst-form-input"
                  placeholder="Announcement title..."
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="inst-form-group">
                <label className="inst-form-label">Audience</label>
                <select
                  className="inst-form-select"
                  value={form.audience}
                  onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                >
                  {AUDIENCE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="inst-form-group">
                <label className="inst-form-label">Message</label>
                <textarea
                  className="inst-form-textarea"
                  placeholder="Write your announcement here..."
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  style={{ minHeight: 120 }}
                />
              </div>

              <div className="inst-toggle-row" style={{ paddingTop: 0 }}>
                <div className="inst-toggle-info">
                  <h4>Pin Announcement</h4>
                  <p>Pinned announcements appear at the top of the list</p>
                </div>
                <label className="inst-toggle">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))}
                  />
                  <span className="inst-toggle-slider" />
                </label>
              </div>
            </div>

            <div className="inst-modal-footer">
              <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={closeModal}>Cancel</button>
              <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Posting...' : editItem ? 'Update' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}