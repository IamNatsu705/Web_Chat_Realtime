/* eslint-disable no-useless-catch */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../features/auth/types';
import { authApi } from '../features/auth/api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to load user session", error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {


    try {
      const res = await authApi.login(credentials);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const res = await authApi.register(credentials);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed on server, cleaning client state anyway.", error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
