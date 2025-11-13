// ============= src/routes/index.jsx =============
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Loading } from '@components/common/Loading';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import Dashboard from '@pages/Dashboard';
import Events from '@pages/Events';
import EventDetail from '@pages/EventDetail';
import Registrations from '@pages/Registrations';
import Notifications from '@pages/Notifications';
import Profile from '@pages/Profile';
import Login from '@pages/Login';
import Register from '@pages/Register';
import NotFound from '@pages/NotFound';

// Protected Route
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  return !user ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout><Login /></AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout><Register /></AuthLayout>
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout><Dashboard /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/events" element={
        <PrivateRoute>
          <MainLayout><Events /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/events/:id" element={
        <PrivateRoute>
          <MainLayout><EventDetail /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/registrations" element={
        <PrivateRoute>
          <MainLayout><Registrations /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/notifications" element={
        <PrivateRoute>
          <MainLayout><Notifications /></MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <MainLayout><Profile /></MainLayout>
        </PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
