import { Navigate } from 'react-router-dom';
import useAuthStore from './useAuthStore';

// ── Role → redirect map ────────────────────────────────────────────────────
const ROLE_HOME = {
  admin:      '/admin',
  instructor: '/instructor',
  user:       '/dashboard',
};

/**
 * RoleGuard
 * Blocks access to routes that require a specific role (or roles).
 * If the user's role doesn't match, redirects them to their own home.
 *
 * Props:
 *   @param {string | string[]} role  - Allowed role(s): 'admin' | 'instructor' | 'user'
 *   @param {ReactNode} children
 *
 * Usage (single role):
 *   <RoleGuard role="admin"><AdminLayout /></RoleGuard>
 *
 * Usage (multiple roles):
 *   <RoleGuard role={['admin', 'instructor']}><SharedPage /></RoleGuard>
 */
export default function RoleGuard({ role, children }) {
  const { user } = useAuthStore();
  const userRole = user?.role;

  // Normalize to array for flexible multi-role support
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to the user's own dashboard, or landing if unknown role
    const redirectTo = ROLE_HOME[userRole] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}