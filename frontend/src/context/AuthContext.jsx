import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    try {
      console.log('AuthContext login called with:', email);
      const response = await authAPI.login({ email, password });
      console.log('Backend response:', response);

      if (response.success) {
        const { user, token } = response.data;

        // Lưu token và user vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Đăng nhập thất bại' };
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message };
    }
  };

  // Đăng ký
  const register = async (name, email, phone, password) => {
    try {
      console.log('AuthContext register called');
      const response = await authAPI.register({ username: name, email, phone, password });
      console.log('Register response:', response);

      if (response.success) {
        const { user, token } = response.data;

        // Lưu token và user vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('Register error in AuthContext:', error);
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, message };
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Cập nhật thông tin user
  const updateUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    return user?.roles?.some(role => role.name === 'admin') || user?.role === 'admin';
  };

  // Check if user is manager
  const isManager = () => {
    if (!user) return false;
    return user?.roles?.some(role => role.name === 'manager') || user?.role === 'manager';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isManager,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;