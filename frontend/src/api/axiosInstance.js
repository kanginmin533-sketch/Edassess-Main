// 📁 axiosInstance.js
import axios from 'axios';
import useAuthStore from '../auth/useAuthStore';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('edassess_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');

    if (token) {
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Log first so it's visible even without "Preserve log" toggled on
      console.error(
        '[axiosInstance] 401 received for',
        error.config?.url,
        '— response:',
        error.response?.data
      );

      // Sync the actual auth store instead of just wiping localStorage directly.
      // Zustand stores can be read/mutated outside React components via getState().
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