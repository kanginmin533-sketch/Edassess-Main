import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './useAuthStore';

/**
 * ProtectedRoute
 * Blocks access to any route that requires authentication.
 * Redirects unauthenticated users to "/" with the intended path saved in state.
 *
 * Usage:
 *   <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Wait for initAuth() to finish before making redirect decisions
  if (isLoading) {
    return null; // or <Spinner /> if you want a loading indicator
  }

  if (!isAuthenticated) {
    // Save intended destination so we can redirect back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}