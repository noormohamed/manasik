'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=604800; SameSite=Strict`;
};

const removeAuthCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await apiClient.get<{ user: User }>('/auth/me');
          setUser(response.user);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          removeAuthCookie('accessToken');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post<{
        message: string;
        user: User;
        tokens: { accessToken: string; refreshToken: string };
      }>('/auth/login', { email, password });

      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      setAuthCookie('accessToken', response.tokens.accessToken);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.post<{
        message: string;
        user: User;
        tokens: { accessToken: string; refreshToken: string };
      }>('/auth/register', { email, password, firstName, lastName });

      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      setAuthCookie('accessToken', response.tokens.accessToken);
      setUser(response.user);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    removeAuthCookie('accessToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      setUser(response.user);
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
