// frontend/src/api/axiosInstance.js
import axios from 'axios';
import useAuthStore from '../auth/useAuthStore';

const TOKEN_KEY = 'edassess_token';

// Endpoints that must NEVER carry an Authorization header and whose 401
// means "wrong credentials", not "session expired".
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register'];

const isPublicEndpoint = (url = '') =>
  PUBLIC_ENDPOINTS.some((path) => url.includes(path));

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Don't attach a (possibly stale) token to login/register.
    // DRF validates the header BEFORE the view runs, so a bad token
    // causes "Given token not valid for any token type" even on AllowAny views.
    if (isPublicEndpoint(config.url)) {
      delete config.headers.Authorization;
      return config;
    }

    const raw = localStorage.getItem(TOKEN_KEY);
    if (raw) {
      const cleanToken = raw.replace(/^"(.*)"$/, '$1');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // A 401 from login/register just means bad credentials.
    // Let the modal show the error; don't wipe state or redirect.
    if (status === 401 && !isPublicEndpoint(url)) {
      console.error('[axiosInstance] 401 received for', url, '— response:', error.response?.data);

      useAuthStore.getState().logout();

      // Avoid redirect loop if we're already on the landing page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;