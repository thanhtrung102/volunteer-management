import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder Pages (will be built in Phase 2)
import VolunteerDashboard from './pages/volunteer/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Volunteer */}
          <Route
            path="/volunteer/*"
            element={
              <ProtectedRoute roles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Manager */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root - Redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;