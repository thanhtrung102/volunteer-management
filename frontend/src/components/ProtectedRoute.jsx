import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner w-12 h-12 border-4"></div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (roles && !roles.includes(user.role)) {
    // Unauthorized role, redirect to appropriate dashboard
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'manager':
        return <Navigate to="/manager" replace />;
      case 'volunteer':
        return <Navigate to="/volunteer" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Authorized, render children
  return children;
};

export default ProtectedRoute;