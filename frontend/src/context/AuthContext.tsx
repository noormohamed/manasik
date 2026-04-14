'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  // Set cookie with proper attributes for Next.js middleware access
  // max-age=86400 = 24 hours (same as access token)
  // Note: Don't use Secure on localhost for development
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const cookieValue = `${name}=${value}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  document.cookie = cookieValue;
  console.log('[Auth] Cookie set:', name, 'secure:', isSecure);
};

const removeAuthCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingUserRef = useRef(false);
  const lastTokenCheckRef = useRef<string | null>(null);

  // Immediately sync cookie from localStorage on mount (before any async operations)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Set cookie immediately to prevent middleware redirect issues
        setAuthCookie('accessToken', token);
        lastTokenCheckRef.current = token;
        console.log('[Auth] Cookie synced from localStorage on mount');
      }
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          loadingUserRef.current = true;
          const response = await apiClient.get<{ user: User }>('/auth/me');
          setUser(response.user);
          // Ensure cookie is set (in case it was lost)
          setAuthCookie('accessToken', token);
          lastTokenCheckRef.current = token;
          console.log('[Auth] User loaded successfully:', response.user.email);
        } catch (error: any) {
          console.error('[Auth] Failed to load user:', error);
          // Only clear auth if it's a 401 (unauthorized), not network errors
          if (error.status === 401) {
            console.log('[Auth] Token invalid, clearing auth');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            removeAuthCookie('accessToken');
            setUser(null);
          }
          // For other errors (network, 500, etc), keep the token and try again later
        } finally {
          loadingUserRef.current = false;
        }
      }
      setLoading(false);
      setIsInitialized(true);
    };

    loadUser();
  }, []);

  // Listen for storage changes (token updates from API client)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        const newToken = e.newValue;
        console.log('[Auth] Token changed in storage:', newToken ? 'new token' : 'removed');
        
        if (newToken && newToken !== lastTokenCheckRef.current) {
          // Token was updated (likely by token refresh), update cookie
          setAuthCookie('accessToken', newToken);
          lastTokenCheckRef.current = newToken;
          console.log('[Auth] Cookie updated with new token');
        } else if (!newToken) {
          // Token was removed
          removeAuthCookie('accessToken');
          setUser(null);
          console.log('[Auth] Token removed, user logged out');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodically sync cookie with localStorage (every 30 seconds)
  useEffect(() => {
    if (!isInitialized) return;

    const syncCookie = () => {
      const token = localStorage.getItem('accessToken');
      if (token && token !== lastTokenCheckRef.current) {
        console.log('[Auth] Syncing cookie with localStorage');
        setAuthCookie('accessToken', token);
        lastTokenCheckRef.current = token;
      }
    };

    const interval = setInterval(syncCookie, 30 * 1000); // 30 seconds
    return () => clearInterval(interval);
  }, [isInitialized]);

  // Periodically verify user is still authenticated (every 2 minutes)
  useEffect(() => {
    if (!isInitialized) return;

    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      // If we have a token but no user, and we're not already loading
      if (token && !user && !loadingUserRef.current) {
        console.log('[Auth] Have token but no user, attempting to load user');
        try {
          loadingUserRef.current = true;
          const response = await apiClient.get<{ user: User }>('/auth/me');
          setUser(response.user);
          setAuthCookie('accessToken', token);
          lastTokenCheckRef.current = token;
          console.log('[Auth] User reloaded successfully');
        } catch (error: any) {
          console.error('[Auth] Failed to reload user:', error);
          if (error.status === 401) {
            console.log('[Auth] Token invalid during check, clearing auth');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            removeAuthCookie('accessToken');
            setUser(null);
          }
        } finally {
          loadingUserRef.current = false;
        }
      }
      
      // If we have a user, verify the token is still in localStorage
      if (user && !token) {
        console.log('[Auth] User exists but token missing, logging out');
        setUser(null);
        removeAuthCookie('accessToken');
      }
    };

    const interval = setInterval(checkAuth, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [isInitialized, user]);

  // Re-check auth when user returns to the tab
  useEffect(() => {
    if (!isInitialized) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('accessToken');
        console.log('[Auth] Tab became visible, token exists:', !!token, 'user exists:', !!user);
        
        if (token && !user && !loadingUserRef.current) {
          console.log('[Auth] Reloading user on tab focus');
          refreshUser();
        }
        
        // Sync cookie when tab becomes visible
        if (token) {
          setAuthCookie('accessToken', token);
          lastTokenCheckRef.current = token;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInitialized, user]);

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
      lastTokenCheckRef.current = response.tokens.accessToken;
      setUser(response.user);
      console.log('[Auth] Login successful:', response.user.email);

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
      lastTokenCheckRef.current = response.tokens.accessToken;
      setUser(response.user);
      console.log('[Auth] Registration successful:', response.user.email);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    console.log('[Auth] Logging out');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    removeAuthCookie('accessToken');
    lastTokenCheckRef.current = null;
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (loadingUserRef.current) {
      console.log('[Auth] Already loading user, skipping refresh');
      return;
    }
    
    try {
      loadingUserRef.current = true;
      const response = await apiClient.get<{ user: User }>('/auth/me');
      setUser(response.user);
      
      // Ensure token and cookie are in sync
      const token = localStorage.getItem('accessToken');
      if (token) {
        setAuthCookie('accessToken', token);
        lastTokenCheckRef.current = token;
      }
      console.log('[Auth] User refreshed successfully');
    } catch (error: any) {
      console.error('[Auth] Failed to refresh user:', error);
      if (error.status === 401) {
        logout();
      }
    } finally {
      loadingUserRef.current = false;
    }
  }, [logout]);

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
