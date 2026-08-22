import axiosInstance from './axiosInstance';

export const accessApi = {
  getPermissions: async () => {
    const response = await axiosInstance.get('/admin/role-permissions');
    return response.data.permissions;
  },

  savePermissions: async (perms) => {
    const response = await axiosInstance.put('/admin/role-permissions', { permissions: perms });
    return response.data.permissions;
  },
};

export default accessApi;