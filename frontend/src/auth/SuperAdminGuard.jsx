import { Navigate } from 'react-router-dom';
import useAuthStore from './useAuthStore';

// Para sa mga page na super admin lang (Exam Config, Access Control, Settings).
export default function SuperAdminGuard({ children }) {
  const { user } = useAuthStore();
  const isSuper = user?.role === 'admin' && !user?.department;
  return isSuper ? children : <Navigate to="/admin" replace />;
}
