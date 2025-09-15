
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { login as mockLogin, signup as mockSignup, getUserById } from '../services/mockApiService';
import type { LoginCredentials, SignupData } from '../services/mockApiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (token && userId) {
          const fetchedUser = await getUserById(userId);
          if (fetchedUser) {
            setUser(fetchedUser);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, [logout]);

  const login = async (credentials: LoginCredentials) => {
    const { user: loggedInUser, token } = await mockLogin(credentials);
    setUser(loggedInUser);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', loggedInUser.id);
  };

  const signup = async (data: SignupData) => {
    const { user: newUser, token } = await mockSignup(data);
    setUser(newUser);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', newUser.id);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
