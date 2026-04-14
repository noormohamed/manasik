'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { RootState } from '@/store';
import {
  setLoading,
  setError,
  setToken,
  setUser,
  setAuthenticated,
  logout as logoutAction,
} from '@/store/slices/authSlice';
import { authService, LoginCredentials } from '@/services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (token) {
          dispatch(setToken(token));
          dispatch(setAuthenticated(true));

          // Try to fetch current user
          try {
            const response = await authService.getCurrentUser();
            dispatch(
              setUser({
                id: response.user.id as any,
                email: response.user.email,
                fullName: `${response.user.firstName} ${response.user.lastName}`,
                role: response.user.role,
              })
            );
          } catch (error) {
            // Token might be invalid, clear auth
            dispatch(logoutAction());
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await authService.login(credentials);

        // Store tokens
        localStorage.setItem('admin_token', response.tokens.accessToken);
        localStorage.setItem('admin_refresh_token', response.tokens.refreshToken);
        localStorage.setItem(
          'admin_user',
          JSON.stringify({
            id: response.user.id,
            email: response.user.email,
            fullName: `${response.user.firstName} ${response.user.lastName}`,
          })
        );

        // Update Redux state
        dispatch(setToken(response.tokens.accessToken));
        dispatch(
          setUser({
            id: response.user.id as any,
            email: response.user.email,
            fullName: `${response.user.firstName} ${response.user.lastName}`,
            role: 'ADMIN', // Will be updated when fetching current user
          })
        );
        dispatch(setAuthenticated(true));

        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Login failed';
        dispatch(setError(errorMessage));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      dispatch(logoutAction());
      dispatch(setLoading(false));
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [dispatch]);

  return {
    ...auth,
    isInitialized,
    login,
    logout,
  };
};
