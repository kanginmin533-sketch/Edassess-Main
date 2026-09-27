// 📁 frontend/src/components/AuthModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, X, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../auth/useAuthStore';
import authApi from '../api/authApi';
import '../styles/AuthModal.css';

// ── Role → route map ───────────────────────────────────────────────────────
const ROLE_REDIRECT = {
  admin:      '/admin',
  instructor: '/instructor',
  user:       '/dashboard',
};

const DEPARTMENTS = [
  { value: 'CIT', label: 'CIT', full: 'College of Information Technology' },
  { value: 'CTE', label: 'CTE', full: 'College of Teacher Education' },
];

// Pulls a readable message out of a DRF error response, which can show up
// in a few different shapes depending on which view raised it:
//   - APIView explicit Response: { "detail": "Invalid email or password." }
//   - Serializer validation errors: { "email": ["already exists."], ... }
//   - Non-field errors: { "non_field_errors": ["..."] }
function extractErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;
  const firstKey = Object.keys(data)[0];
  if (firstKey && Array.isArray(data[firstKey]) && data[firstKey].length) {
    return data[firstKey][0];
  }
  return fallback;
}

// ── Sub-components ─────────────────────────────────────────────────────────
const InputField = ({ icon: Icon, type, placeholder, value, onChange }) => (
  <div className="enhanced-input-group">
    <Icon className="enhanced-field-icon" size={18} />
    <input
      type={type}
      placeholder={placeholder}
      className="sans-input"
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

// Password field with a show/hide toggle. Same visual shell as InputField,
// but swaps the input type and renders an eye icon button on the right.
const PasswordField = ({ placeholder, value, onChange, show, onToggle }) => (
  <div className="enhanced-input-group">
    <KeyRound className="enhanced-field-icon" size={18} />
    <input
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      className="sans-input"
      value={value}
      onChange={onChange}
      required
    />
    <button
      type="button"
      className="password-toggle-btn"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);

// Department selector for registration — CIT vs CTE. Button-style, same
// pattern as the admin UserPage instructor department picker.
const DepartmentField = ({ value, onChange }) => (
  <div style={{ marginBottom: 14, width: '100%' }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-light)' }}>
      Which college are you under?
    </label>
    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
      {DEPARTMENTS.map((d) => (
        <button
          key={d.value}
          type="button"
          onClick={() => onChange(d.value)}
          title={d.full}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            boxSizing: 'border-box',
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${value === d.value ? 'var(--prmsu-gold)' : 'var(--border-subtle)'}`,
            background: value === d.value ? 'var(--prmsu-gold-pale)' : '#ffffff',
            color: 'var(--text-dark)',
            fontSize: 13.5,
            fontWeight: value === d.value ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          {d.label}
        </button>
      ))}
    </div>
    <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-light)' }}>
      {value ? DEPARTMENTS.find((d) => d.value === value)?.full : 'Select your college.'}
    </p>
  </div>
);

const SubmitButton = ({ text, disabled }) => (
  <button
    className="enhanced-submit-btn"
    type="submit"
    disabled={disabled}
  >
    {text} <ArrowRight size={16} />
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────
const AuthModal = () => {
  const navigate   = useNavigate();
  const { isModalOpen, activeView, setAuthModal, login } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    department:      '', // 'CIT' | 'CTE' — register only
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [notice, setNotice]       = useState('');

  // ── Show/hide password state (register form only) ──────────────────────
  const [showPw, setShowPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '', department: '' });
    setError('');
    setShowPw(false);
    setShowConfirmPw(false);
  };

  const closeModal = () => {
    resetForm();
    setNotice('');
    setAuthModal(false);
  };

  const handleInputChange = (e, field) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(''); // Clear error on new input
  };

  // ── Login ───────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const userData = await authApi.login({ email, password });

      login(userData.access, userData.user);

      closeModal();

      // Redirect based on role
      const redirectTo = ROLE_REDIRECT[userData.user.role] || '/';
      navigate(redirectTo, { replace: true });

    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword, department } = formData;

    if (!fullName || !email || !password || !confirmPassword || !department) {
      setError('Please complete all fields, including your college.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await authApi.register({ fullName, email, password, confirmPassword, department });

      resetForm();
      setNotice('Account created! You can now log in.');
      setAuthModal(true, 'login'); // Switch to login after success

    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="auth-enhanced-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      >
        <motion.div
          className="auth-enhanced-container"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="enhanced-close-btn" onClick={closeModal}>
            <X size={20} />
          </button>

          {/* Header */}
          <div className="modal-header centered">
            <h3 className="serif-title">
              {activeView === 'login' ? 'Institutional Login' : 'Student Registration'}
            </h3>
            <p className="sans-subtitle">EduAssess Secure Access</p>
          </div>

          {/* Notice (e.g. after successful registration) */}
          {notice && !error && (
            <div className="auth-error-message" style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', borderColor: 'rgba(22,163,74,0.25)' }}>
              {notice}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={activeView === 'login' ? handleLogin : handleRegister}>
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="form-step-wrapper"
            >
              {activeView === 'login' ? (
                <>
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange(e, 'email')}
                  />
                  <InputField
                    icon={KeyRound}
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange(e, 'password')}
                  />
                  <SubmitButton
                    text={isLoading ? 'Verifying...' : 'Sign In'}
                    disabled={isLoading}
                  />
                </>
              ) : (
                <>
                  <InputField
                    icon={User}
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange(e, 'fullName')}
                  />
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="University Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange(e, 'email')}
                  />
                  <DepartmentField
                    value={formData.department}
                    onChange={(val) => setFormData((p) => ({ ...p, department: val }))}
                  />
                  <PasswordField
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange(e, 'password')}
                    show={showPw}
                    onToggle={() => setShowPw((v) => !v)}
                  />
                  <PasswordField
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange(e, 'confirmPassword')}
                    show={showConfirmPw}
                    onToggle={() => setShowConfirmPw((v) => !v)}
                  />
                  <SubmitButton
                    text={isLoading ? 'Processing...' : 'Create Account'}
                    disabled={isLoading}
                  />
                </>
              )}
            </motion.div>
          </form>

          {/* Footer Toggle */}
          <div className="modal-footer">
            <button
              className="toggle-view-link gold"
              type="button"
              onClick={() => {
                resetForm();
                setNotice('');
                setAuthModal(true, activeView === 'login' ? 'register' : 'login');
              }}
            >
              {activeView === 'login'
                ? 'Need an account? Register here'
                : 'Already registered? Sign in'}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;