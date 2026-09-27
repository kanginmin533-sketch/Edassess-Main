import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, X, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { adminApi } from "../../api/adminApi";

const CREATABLE_ROLES = ['instructor', 'admin'];
const DEPARTMENTS = [
  { value: 'CIT', label: 'CIT', full: 'College of Information Technology' },
  { value: 'CTE', label: 'CTE', full: 'College of Teacher Education' },
];

const ROLE_BADGE = {
  admin: 'badge badge-purple',
  instructor: 'badge badge-info',
  user: 'badge badge-neutral',
};

const STATUS_BADGE = {
  active: 'badge badge-success',
  inactive: 'badge badge-warning',
};

// department: '' lang kapag hindi pa napili — required kapag role === 'instructor'
const EMPTY_FORM = { name: '', email: '', role: 'instructor', department: '', password: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export default function UserPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Users on Mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminApi.getUsers();
      const list = Array.isArray(data) ? data : (data.users || data.results || []);

      // Normalize user fields to safely display names
      const normalizedList = list.map(u => ({
        ...u,
        name: u.name || u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name',
        status: u.status || (u.is_active ? 'active' : 'inactive')
      }));

      setUsers(normalizedList);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filtered = users.filter((u) => {
    const nameStr = u.name || '';
    const emailStr = u.email || '';
    const matchSearch = nameStr.toLowerCase().includes(search.toLowerCase()) ||
                        emailStr.toLowerCase().includes(search.toLowerCase());
    const matchRole = filter === 'all' || u.role === filter;
    return matchSearch && matchRole;
  });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.toggleUserStatus(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to update user status.');
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, password: generatePassword() });
    setFormError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (u) => {
    if (!CREATABLE_ROLES.includes(u.role)) {
      alert('Only Instructor and Admin accounts can be edited from this panel.');
      return;
    }
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department || '', password: '' });
    setFormError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError('');
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) return setFormError('Full name is required.');
    if (!EMAIL_RE.test(form.email.trim())) return setFormError('Enter a valid email address.');
    if (!CREATABLE_ROLES.includes(form.role)) return setFormError('Role must be Instructor or Admin.');
    if (form.role === 'instructor' && !form.department) return setFormError('Select a department (CIT or CTE) for this instructor.');
    if (!editId && form.password.trim().length < 8) return setFormError('Password must be at least 8 characters.');

    const emailTaken = users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editId);
    if (emailTaken) return setFormError('That email is already registered to another account.');

    setSaving(true);

    // Split name for standard DRF User serializers (if needed by backend)
    const nameParts = form.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Hybrid payload to guarantee compatibility with DRF serializers
    const payload = {
      name: form.name.trim(),
      fullName: form.name.trim(),
      full_name: form.name.trim(),
      first_name: firstName,
      last_name: lastName,
      email: form.email.trim(),
      username: form.email.trim(), // Django default user model often uses username
      role: form.role,
      department: form.role === 'instructor' ? form.department : null,
      ...(form.password && { password: form.password })
    };

    try {
      if (editId) {
        const updatedUser = await adminApi.updateUser(editId, payload);
        const savedData = updatedUser.user || updatedUser;

        const normalized = {
          ...savedData,
          name: savedData.name || savedData.full_name || form.name.trim(),
          status: savedData.status || 'active'
        };

        setUsers((prev) => prev.map((u) => (u.id === editId ? normalized : u)));
      } else {
        const newUser = await adminApi.createUser(payload);
        const savedData = newUser.user || newUser;

        const normalized = {
          ...savedData,
          name: savedData.name || savedData.full_name || form.name.trim(),
          status: savedData.status || 'active',
          joined: savedData.joined || new Date().toISOString().split('T')[0]
        };

        setUsers((prev) => [normalized, ...prev]);
      }
      closeModal();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to save account details.';

      if (data) {
        if (typeof data.detail === 'string') msg = data.detail;
        else if (typeof data.message === 'string') msg = data.message;
        else {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            msg = `${firstKey}: ${data[firstKey][0]}`;
          }
        }
      }
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <div className="topbar-left">
          <h1>Users</h1>
          <p>Manage all registered accounts — students, instructors, and admins</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <UserPlus size={13} /> Add Instructor / Admin
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'user', 'instructor', 'admin'].map((role) => (
                <button
                  key={role}
                  className={`btn btn-sm ${filter === role ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(role)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {role === 'all' ? 'All Users' : role}
                </button>
              ))}
            </div>
            <div className="search-bar">
              <Search size={15} />
              <input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="empty-state">
              <Loader2 className="animate-spin" size={32} />
              <p>Loading accounts from backend...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={40} />
              <p>No users match your search.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--admin-accent-soft, #e2e8f0)',
                          color: 'var(--admin-accent, #0f172a)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, flexShrink: 0
                        }}>
                          {(u.name || u.email || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name || 'No Name'}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--admin-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={ROLE_BADGE[u.role] || 'badge'}>{u.role}</span>
                      {u.role === 'instructor' && u.department && (
                        <span className="badge badge-neutral" style={{ marginLeft: 6 }}>{u.department}</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to toggle status"
                      >
                        <span className={STATUS_BADGE[u.status] || 'badge'}>{u.status}</span>
                      </button>
                    </td>
                    <td style={{ color: 'var(--admin-text-sub)', fontSize: 13 }}>{u.joined || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-icon"
                          title={CREATABLE_ROLES.includes(u.role) ? 'Edit' : 'Only instructor/admin accounts are editable here'}
                          onClick={() => openEdit(u)}
                          style={{ opacity: CREATABLE_ROLES.includes(u.role) ? 1 : 0.4, cursor: CREATABLE_ROLES.includes(u.role) ? 'pointer' : 'not-allowed' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete"
                          style={{ color: 'var(--admin-danger, #ef4444)' }}
                          onClick={() => handleDelete(u.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="save-bar">
            <p>Showing {filtered.length} of {users.length} users</p>
          </div>
        </div>
      </div>

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
              width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
              background: 'var(--admin-bg-card, #ffffff)', borderRadius: 14,
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: '1px solid var(--admin-border, #e2e8f0)',
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--admin-text, #0f172a)' }}>
                {editId ? 'Edit Account' : 'Add Instructor / Admin Account'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--admin-text-muted)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              {!editId && (
                <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--admin-text-muted)', lineHeight: 1.6 }}>
                  Student accounts are created by self-registration on the public site. Use this form only for staff accounts — Instructor or Admin.
                </p>
              )}

              {formError && (
                <div style={{ padding: '9px 12px', marginBottom: 16, borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', fontSize: 12.5, color: 'var(--admin-danger, #ef4444)' }}>
                  {formError}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Dr. Ana Reyes"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--admin-border, #cbd5e1)', fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@prmsu.edu.ph"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--admin-border, #cbd5e1)', fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value, department: e.target.value === 'instructor' ? p.department : '' }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--admin-border, #cbd5e1)', fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)' }}
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Department — instructor-only. Button-style para malinaw agad ang pinili. */}
              {form.role === 'instructor' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>
                    Department
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DEPARTMENTS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, department: d.value }))}
                        title={d.full}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: `1px solid ${form.department === d.value ? 'var(--admin-accent, #0f172a)' : 'var(--admin-border, #cbd5e1)'}`,
                          background: form.department === d.value ? 'var(--admin-accent-soft, #e2e8f0)' : 'var(--admin-bg-card, #fff)',
                          color: 'var(--admin-text)',
                          fontSize: 13,
                          fontWeight: form.department === d.value ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--admin-text-muted)' }}>
                    {form.department ? DEPARTMENTS.find((d) => d.value === form.department)?.full : 'Select which college this instructor belongs to.'}
                  </p>
                </div>
              )}

              {!editId && (
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: 6 }}>
                    Temporary Password <span style={{ fontWeight: 400, color: 'var(--admin-text-muted)' }}>· min 8 characters</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 38px 10px 12px', borderRadius: 8, border: '1px solid var(--admin-border, #cbd5e1)', fontSize: 13.5, color: 'var(--admin-text)', background: 'var(--admin-bg-card, #fff)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', display: 'flex' }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setForm((p) => ({ ...p, password: generatePassword() }))}
                      title="Generate a new password"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--admin-border, #e2e8f0)' }}>
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}