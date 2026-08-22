import { create } from 'zustand';

// ── Constants ──────────────────────────────────────────────────────────────
const TOKEN_KEY = 'edassess_token';
const USER_KEY  = 'edassess_user';

// ── Helpers ────────────────────────────────────────────────────────────────
const parseUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// ── Store ──────────────────────────────────────────────────────────────────
const useAuthStore = create((set, get) => ({

  // ── Auth State ────────────────────────────────────────────────────────────
  token:           localStorage.getItem(TOKEN_KEY) || null,
  user:            parseUser(),
  isAuthenticated: false,
  isLoading:       true,

  // ── Modal State ───────────────────────────────────────────────────────────
  isModalOpen: false,
  activeView:  'login', // 'login' | 'register'

  // ── Role Getters ──────────────────────────────────────────────────────────
  getRole:      () => get().user?.role || null,
  isAdmin:      () => get().user?.role === 'admin',
  isInstructor: () => get().user?.role === 'instructor',
  isUser:       () => get().user?.role === 'user',

  // ── Modal Actions ─────────────────────────────────────────────────────────
  /**
   * Open or close the auth modal, optionally switching view.
   * @param {boolean} open
   * @param {'login'|'register'} view
   */
  setAuthModal: (open, view = 'login') => {
    set({ isModalOpen: open, activeView: view });
  },

  // ── Auth Actions ──────────────────────────────────────────────────────────
  /**
   * Validate stored token on app boot.
   */
  initAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user  = parseUser();

    if (token && user && !isTokenExpired(token)) {
      set({ token, user, isAuthenticated: true, isLoading: false });
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Call after successful login API response.
   * @param {string} token  - JWT access token
   * @param {object} user   - { id, name, email, role }
   */
  login: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  /**
   * Clears all auth state.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  /**
   * Update user info in state and localStorage.
   */
  updateUser: (updatedUser) => {
    const merged = { ...get().user, ...updatedUser };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    set({ user: merged });
  },
}));

export default useAuthStore;