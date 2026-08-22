import useAuthStore from '../auth/useAuthStore';

export const useAuth = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isModalOpen = useAuthStore((state) => state.isModalOpen);
  const activeView = useAuthStore((state) => state.activeView);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setAuthModal = useAuthStore((state) => state.setAuthModal);
  const updateUser = useAuthStore((state) => state.updateUser);
  const initAuth = useAuthStore((state) => state.initAuth);

  const getRole = useAuthStore((state) => state.getRole);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isInstructor = useAuthStore((state) => state.isInstructor);
  const isUser = useAuthStore((state) => state.isUser);

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    isModalOpen,
    activeView,
    login,
    logout,
    setAuthModal,
    updateUser,
    initAuth,
    getRole,
    isAdmin,
    isInstructor,
    isUser,
  };
};

export default useAuth;