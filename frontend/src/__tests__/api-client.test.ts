/**
 * API Client Tests
 * Tests for automatic token refresh and error handling
 */

import { apiClient } from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
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

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    // Mock window.dispatchEvent
    window.dispatchEvent = jest.fn();
  });

  describe('Token Refresh', () => {
    it('should automatically refresh token on 401 and retry request', async () => {
      mockLocalStorage['accessToken'] = 'expired-token';
      mockLocalStorage['refreshToken'] = 'valid-refresh-token';

      const mockData = { data: { message: 'Success' } };

      // First call returns 401
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Token expired' }),
        })
        // Refresh token call succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              tokens: {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
              },
            },
          }),
        })
        // Retry original request succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockData,
        });

      const result = await apiClient.get('/test-endpoint');

      // Should return the data from retried request
      expect(result).toEqual({ message: 'Success' });

      // Should have called fetch 3 times (original, refresh, retry)
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Should have updated tokens
      expect(mockLocalStorage['accessToken']).toBe('new-access-token');

      // Should have dispatched storage event
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage',
          key: 'accessToken',
          newValue: 'new-access-token',
        })
      );
    });

    it('should not retry on 401 for auth endpoints', async () => {
      mockLocalStorage['accessToken'] = 'token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(apiClient.post('/auth/login', { email: 'test', password: 'test' }))
        .rejects
        .toMatchObject({ status: 401 });

      // Should only call fetch once (no retry for auth endpoints)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear tokens and redirect on refresh failure', async () => {
      mockLocalStorage['accessToken'] = 'expired-token';
      mockLocalStorage['refreshToken'] = 'invalid-refresh-token';

      // Mock window.location
      delete (window as any).location;
      (window as any).location = { href: '', pathname: '/dashboard' };

      // First call returns 401
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Token expired' }),
        })
        // Refresh token call fails
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Invalid refresh token' }),
        });

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();

      // Should have cleared tokens
      expect(mockLocalStorage['accessToken']).toBeUndefined();
      expect(mockLocalStorage['refreshToken']).toBeUndefined();

      // Should have dispatched storage event for logout
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage',
          key: 'accessToken',
          newValue: null,
        })
      );
    });

    it('should not refresh token multiple times concurrently', async () => {
      mockLocalStorage['accessToken'] = 'expired-token';
      mockLocalStorage['refreshToken'] = 'valid-refresh-token';

      // Mock refresh to take some time
      let refreshCallCount = 0;
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/auth/refresh')) {
          refreshCallCount++;
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                json: async () => ({
                  data: {
                    tokens: {
                      accessToken: 'new-token',
                      refreshToken: 'new-refresh',
                    },
                  },
                }),
              });
            }, 100);
          });
        }
        
        // Other calls return 401
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Token expired' }),
        });
      });

      // Make multiple concurrent requests
      const requests = [
        apiClient.get('/endpoint1'),
        apiClient.get('/endpoint2'),
        apiClient.get('/endpoint3'),
      ];

      await Promise.allSettled(requests);

      // Should only refresh token once despite multiple 401s
      expect(refreshCallCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors without clearing auth', async () => {
      mockLocalStorage['accessToken'] = 'valid-token';
      mockLocalStorage['refreshToken'] = 'valid-refresh-token';

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test-endpoint')).rejects.toMatchObject({
        error: 'Network error',
        status: 0,
      });

      // Should NOT clear tokens on network error
      expect(mockLocalStorage['accessToken']).toBe('valid-token');
      expect(mockLocalStorage['refreshToken']).toBe('valid-refresh-token');
    });

    it('should handle 500 errors without clearing auth', async () => {
      mockLocalStorage['accessToken'] = 'valid-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(apiClient.get('/test-endpoint')).rejects.toMatchObject({
        status: 500,
      });

      // Should NOT clear tokens on 500 error
      expect(mockLocalStorage['accessToken']).toBe('valid-token');
    });

    it('should handle 404 errors without clearing auth', async () => {
      mockLocalStorage['accessToken'] = 'valid-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(apiClient.get('/test-endpoint')).rejects.toMatchObject({
        status: 404,
      });

      // Should NOT clear tokens on 404 error
      expect(mockLocalStorage['accessToken']).toBe('valid-token');
    });
  });

  describe('Request Headers', () => {
    it('should include Authorization header when token exists', async () => {
      mockLocalStorage['accessToken'] = 'test-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      await apiClient.get('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include Authorization header when token does not exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      await apiClient.get('/test-endpoint');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBeUndefined();
    });

    it('should include credentials in requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      await apiClient.get('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('Response Handling', () => {
    it('should unwrap data from backend response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success', value: 123 } }),
      });

      const result = await apiClient.get('/test-endpoint');

      expect(result).toEqual({ message: 'Success', value: 123 });
    });

    it('should handle response without data wrapper', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: 'Success', value: 123 }),
      });

      const result = await apiClient.get('/test-endpoint');

      expect(result).toEqual({ message: 'Success', value: 123 });
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      await apiClient.get('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST requests with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      const body = { name: 'Test', value: 123 };
      await apiClient.post('/test-endpoint', body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });

    it('should make PUT requests with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      const body = { name: 'Updated', value: 456 };
      await apiClient.put('/test-endpoint', body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
    });

    it('should make DELETE requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { message: 'Success' } }),
      });

      await apiClient.delete('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
