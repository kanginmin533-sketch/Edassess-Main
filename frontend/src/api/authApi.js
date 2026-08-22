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
  register: async ({ fullName, email, password, confirmPassword }) => {
    const response = await axiosInstance.post('/auth/register', {
      name: fullName,
      email,
      password,
      password_confirmation: confirmPassword,
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
};

export default authApi;