// ============= src/context/AuthContext.jsx =============
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const data = await authAPI.getMe();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setUser(data.data);
        toast.success('Đăng nhập thành công!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Đăng nhập thất bại');
      return { success: false, message: error.message };
    }
  };

  const register = async (formData) => {
    try {
      const data = await authAPI.register(formData);
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setUser(data.data);
        toast.success('Đăng ký thành công!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Đăng ký thất bại');
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Đã đăng xuất');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      updateUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
