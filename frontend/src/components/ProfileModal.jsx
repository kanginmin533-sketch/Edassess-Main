import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../auth/useAuthStore';
import authApi from '../api/authApi';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const input = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #d4d0c8', fontSize: 13.5, fontFamily: 'inherit', background: '#fff', color: '#1c1917' };
const label = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: '#4b5563' };

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    current_password: '', new_password: '', confirm: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k) => (e) => { setDone(false); setError(''); setForm((p) => ({ ...p, [k]: e.target.value })); };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Name is required.');
    if (!EMAIL_RE.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.new_password) {
      if (!form.current_password) return setError('Enter your current password to set a new one.');
      if (form.new_password.length < 8) return setError('New password must be at least 8 characters.');
      if (form.new_password !== form.confirm) return setError('New passwords do not match.');
    }

    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }
      const updated = await authApi.updateProfile(payload);
      updateUser(updated);
      setForm((p) => ({ ...p, current_password: '', new_password: '', confirm: '' }));
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1c1917' }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 22 }}>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b6560' }}>
            Role: <strong>{user?.role === 'user' ? 'student' : user?.role}</strong>
            {user?.department && <> · Department: <strong>{user.department}</strong></>}
            {' '}(hindi ito mababago dito)
          </p>

          {error && <div style={{ padding: '9px 12px', marginBottom: 14, borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', fontSize: 12.5, color: '#dc2626' }}>{error}</div>}
          {done && <div style={{ padding: '9px 12px', marginBottom: 14, borderRadius: 8, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', fontSize: 12.5, color: '#16a34a' }}>Profile updated.</div>}

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Full Name</label>
            <input style={input} value={form.name} onChange={set('name')} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={label}>Email</label>
            <input style={input} type="email" placeholder="name@gmail.com" value={form.email} onChange={set('email')} />
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
            <label style={{ ...label, marginBottom: 10 }}>Change Password <span style={{ fontWeight: 400, color: '#9c9890' }}>· optional</span></label>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input style={input} type={showPw ? 'text' : 'password'} placeholder="Current password" value={form.current_password} onChange={set('current_password')} />
              <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#9c9890' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <input style={{ ...input, marginBottom: 10 }} type={showPw ? 'text' : 'password'} placeholder="New password (min 8)" value={form.new_password} onChange={set('new_password')} />
            <input style={input} type={showPw ? 'text' : 'password'} placeholder="Confirm new password" value={form.confirm} onChange={set('confirm')} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #d4d0c8', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Close</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--dept-accent, #2563eb)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
