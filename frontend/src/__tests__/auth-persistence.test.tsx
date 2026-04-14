/**
 * Auth Persistence Tests
 * Tests to ensure users don't get randomly logged out
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import React from 'react';

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('Auth Persistence', () => {
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocalStorage = {};

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key: string) => {
      delete mockLocalStorage[key];
    });

    // Reset document.cookie
    document.cookie = '';
  });

  describe('Token Refresh', () => {
    it('should maintain user state after token refresh', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      // Set initial token
      mockLocalStorage['accessToken'] = 'old-token';
      mockLocalStorage['refreshToken'] = 'refresh-token';

      // Mock initial user load
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      // Simulate token refresh by updating localStorage
      act(() => {
        mockLocalStorage['accessToken'] = 'new-token';
        // Dispatch storage event
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'accessToken',
            newValue: 'new-token',
            oldValue: 'old-token',
            storageArea: localStorage,
          })
        );
      });

      // User should still be logged in
      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
        expect(result.current?.isAuthenticated).toBe(true);
      });
    });

    it('should update cookie when token changes', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'initial-token';
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      // Simulate token refresh
      act(() => {
        mockLocalStorage['accessToken'] = 'refreshed-token';
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'accessToken',
            newValue: 'refreshed-token',
            oldValue: 'initial-token',
            storageArea: localStorage,
          })
        );
      });

      // Cookie should be updated (check that document.cookie was set)
      await waitFor(() => {
        expect(document.cookie).toContain('accessToken=refreshed-token');
      });
    });

    it('should logout when token is removed', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'token';
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      // Simulate token removal
      act(() => {
        delete mockLocalStorage['accessToken'];
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'accessToken',
            newValue: null,
            oldValue: 'token',
            storageArea: localStorage,
          })
        );
      });

      // User should be logged out
      await waitFor(() => {
        expect(result.current?.user).toBeNull();
        expect(result.current?.isAuthenticated).toBe(false);
      });
    });
  });

  describe('Race Condition Prevention', () => {
    it('should not load user multiple times concurrently', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'token';
      
      // Mock API to delay response
      let resolveCount = 0;
      (apiClient.get as jest.Mock).mockImplementation(() => {
        resolveCount++;
        return new Promise((resolve) => {
          setTimeout(() => resolve({ user: mockUser }), 100);
        });
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      // Try to refresh user multiple times quickly
      act(() => {
        result.current?.refreshUser();
        result.current?.refreshUser();
        result.current?.refreshUser();
      });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      // Should only call API once (initial load) despite multiple refresh calls
      // The race condition protection should prevent concurrent loads
      expect(resolveCount).toBeLessThanOrEqual(2); // Initial + 1 refresh (others blocked)
    });
  });

  describe('Session Recovery', () => {
    it('should recover user state if lost but token exists', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'token';
      
      // First call returns user, second call (recovery) also returns user
      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce({ user: mockUser })
        .mockResolvedValueOnce({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result, rerender } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      // Simulate user state being lost (but token still exists)
      // This shouldn't happen, but if it does, the system should recover
      act(() => {
        result.current?.refreshUser();
      });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
        expect(result.current?.isAuthenticated).toBe(true);
      });
    });

    it('should handle 401 errors by clearing auth', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'invalid-token';
      mockLocalStorage['refreshToken'] = 'refresh-token';

      // Mock 401 error
      (apiClient.get as jest.Mock).mockRejectedValueOnce({
        status: 401,
        error: 'Invalid token',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Should clear tokens on 401
      expect(mockLocalStorage['accessToken']).toBeUndefined();
      expect(mockLocalStorage['refreshToken']).toBeUndefined();
      expect(result.current?.user).toBeNull();
      expect(result.current?.isAuthenticated).toBe(false);
    });

    it('should NOT clear auth on network errors', async () => {
      mockLocalStorage['accessToken'] = 'token';
      mockLocalStorage['refreshToken'] = 'refresh-token';

      // Mock network error (status 0)
      (apiClient.get as jest.Mock).mockRejectedValueOnce({
        status: 0,
        error: 'Network error',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Should NOT clear tokens on network error
      expect(mockLocalStorage['accessToken']).toBe('token');
      expect(mockLocalStorage['refreshToken']).toBe('refresh-token');
    });
  });

  describe('Login/Logout', () => {
    it('should set tokens and user on login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        message: 'Login successful',
        user: mockUser,
        tokens: mockTokens,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Login
      await act(async () => {
        await result.current?.login('test@example.com', 'password');
      });

      // Should set tokens and user
      expect(mockLocalStorage['accessToken']).toBe('access-token');
      expect(mockLocalStorage['refreshToken']).toBe('refresh-token');
      expect(result.current?.user).toEqual(mockUser);
      expect(result.current?.isAuthenticated).toBe(true);
    });

    it('should clear tokens and user on logout', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'token';
      mockLocalStorage['refreshToken'] = 'refresh-token';
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      // Logout
      act(() => {
        result.current?.logout();
      });

      // Should clear everything
      expect(mockLocalStorage['accessToken']).toBeUndefined();
      expect(mockLocalStorage['refreshToken']).toBeUndefined();
      expect(result.current?.user).toBeNull();
      expect(result.current?.isAuthenticated).toBe(false);
    });
  });

  describe('Cookie Management', () => {
    it('should set cookie on login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        message: 'Login successful',
        user: mockUser,
        tokens: mockTokens,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      await act(async () => {
        await result.current?.login('test@example.com', 'password');
      });

      // Cookie should be set
      expect(document.cookie).toContain('accessToken=access-token');
    });

    it('should remove cookie on logout', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      mockLocalStorage['accessToken'] = 'token';
      document.cookie = 'accessToken=token; path=/';
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: mockUser });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.user).toEqual(mockUser);
      });

      act(() => {
        result.current?.logout();
      });

      // Cookie should be removed (max-age=0)
      expect(document.cookie).toContain('max-age=0');
    });
  });
});
