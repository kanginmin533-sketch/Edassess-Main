import axiosInstance from './axiosInstance';

const authApi = {
  login: async ({ email, password }) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  // Student registration: kasama na ang department at major
  register: async ({ fullName, email, password, confirmPassword, department, major }) => {
    const response = await axiosInstance.post('/auth/register', {
      name: fullName, email, password, confirmPassword, department, major,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  me: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Sariling permission set ng naka-login (ginagamit ng sidebar layouts)
  getMyPermissions: async () => {
    const response = await axiosInstance.get('/auth/my-permissions');
    return response.data;
  },

  // Profile edit: { name, email, current_password?, new_password?, major? (student lang) }
  updateProfile: async (data) => {
    const response = await axiosInstance.patch('/auth/me', data);
    return response.data;
  },
};

export default authApi;