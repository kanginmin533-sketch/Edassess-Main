import axiosInstance from './axiosInstance';

export const accessApi = {
  // ── Global matrix (super admin lang) ─────────────────────────────────────
  getPermissions: async () => {
    const response = await axiosInstance.get('/admin/role-permissions');
    return response.data.permissions;
  },

  savePermissions: async (perms) => {
    const response = await axiosInstance.put('/admin/role-permissions', { permissions: perms });
    return response.data.permissions;
  },

  // ── Per-department (department admin = sariling department; super admin = kahit alin) ──
  // Returns { department, permissions, ceiling, controllable, updated_at }
  getDepartmentPermissions: async (department) => {
    const response = await axiosInstance.get('/admin/department-permissions/', {
      params: department ? { department } : {},
    });
    return response.data;
  },

  saveDepartmentPermissions: async (department, permissions) => {
    const response = await axiosInstance.put('/admin/department-permissions/', {
      department,
      permissions,
    });
    return response.data;
  },
};

export default accessApi;