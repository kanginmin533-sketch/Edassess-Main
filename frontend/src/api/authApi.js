import axiosInstance from './axiosInstance';

const authApi = {
  /**
   * Login user
   * @param {{ email: string, password: string }} credentials
   * @returns {{ token: string, user: { id, name, email, role } }}
   */
  login: async ({ email, password }) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   * @param {{ fullName: string, email: string, password: string, confirmPassword: string }} data
   * @returns {{ message: string }}
   */
  register: async ({ fullName, email, password, confirmPassword, department }) => {
    const response = await axiosInstance.post('/auth/register', {
      name: fullName, email, password, confirmPassword, department,
    });
    return response.data;
  },

  /**
   * Logout user (invalidate token on server)
   */
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  /**
   * Get currently authenticated user
   * @returns {{ user: { id, name, email, role } }}
   */
  me: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  /**
   * Get the current user's own permission set (role-based), used by
   * AdminLayout/InstructorLayout to show/hide nav items.
   * @returns {{ [permKey]: boolean }}
   */
  getMyPermissions: async () => {
    const response = await axiosInstance.get('/auth/my-permissions');
    return response.data;
  },
};

export default authApi;