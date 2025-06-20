import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../lib/user-api';

interface User {
  id: string;
  mobile: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (mobile: string, password: string) => Promise<boolean>;
  register: (mobile: string, password: string) => Promise<boolean>;
  verifyCode: (mobile: string, code: string) => Promise<boolean>;
  completeRegistration: (mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userApi.login(mobile, password);
      
      if (result.success && result.user) {
        const userData = {
          id: result.user.id,
          mobile: result.user.mobile,
          isVerified: result.user.isVerified,
          createdAt: result.user.createdAt
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('حدث خطأ أثناء تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userApi.register(mobile, password);
      
      if (result.success) {
        // Store password temporarily for later use
        sessionStorage.setItem('tempPassword', password);
        sessionStorage.setItem('registrationMobile', mobile);
        return true;
      } else {
        setError(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('حدث خطأ أثناء التسجيل');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (mobile: string, code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userApi.verifyCode(mobile, code);
      
      if (result.success && result.user) {
        const userData = {
          id: result.user.id,
          mobile: result.user.mobile,
          isVerified: result.user.isVerified,
          createdAt: result.user.createdAt
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clear temporary data
        sessionStorage.removeItem('tempPassword');
        sessionStorage.removeItem('registrationMobile');
        
        return true;
      } else {
        setError(result.error || 'Verification failed');
        return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('حدث خطأ أثناء التحقق');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userApi.completeRegistration(mobile, password);
      
      if (result.success && result.user) {
        const userData = {
          id: result.user.id,
          mobile: result.user.mobile,
          isVerified: result.user.isVerified,
          createdAt: result.user.createdAt
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        setError(result.error || 'Registration completion failed');
        return false;
      }
    } catch (error) {
      console.error('Complete registration error:', error);
      setError('حدث خطأ أثناء إكمال التسجيل');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('tempPassword');
    sessionStorage.removeItem('registrationMobile');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    verifyCode,
    completeRegistration,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
