import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Verify token is still valid by fetching profile
          try {
            const response = await authService.getProfile();
            setUser(response.data);
          } catch (err) {
            // Token invalid, clear storage
            authService.logout();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.data);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(userData);
      setUser(response.data);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Đăng ký thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(profileData);
      setUser(response.data);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Cập nhật thất bại';
      setError(errorMessage);
      throw err;
    }
  };

  // Check role
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};