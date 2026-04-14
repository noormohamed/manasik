/**
 * API Client - Centralized fetch wrapper
 */

// Hardcoded for now - env variable not being picked up in Docker dev mode
const API_URL = 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('[API] Refreshing access token...');
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const json = await response.json();
        const data = json.data || json;
        const newAccessToken = data.tokens?.accessToken || data.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        // Update stored tokens
        localStorage.setItem('accessToken', newAccessToken);
        
        // Update cookie (24 hours to match token expiry)
        // Note: Don't use Secure on localhost for development
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `accessToken=${newAccessToken}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;

        console.log('[API] Token refreshed successfully');
        
        // Dispatch storage event to notify AuthContext
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'accessToken',
          newValue: newAccessToken,
          oldValue: this.getToken(),
          storageArea: localStorage,
          url: window.location.href
        }));

        return newAccessToken;
      } catch (error) {
        console.error('[API] Token refresh failed:', error);
        // Clear tokens on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
        
        // Dispatch storage event to notify AuthContext of logout
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'accessToken',
          newValue: null,
          oldValue: this.getToken(),
          storageArea: localStorage,
          url: window.location.href
        }));
        
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies in requests
      });

      const json = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !endpoint.includes('/auth/') && retryCount === 0) {
          try {
            console.log('[API] Received 401, attempting token refresh...');
            const newToken = await this.refreshAccessToken();
            
            // Retry the request with new token
            console.log('[API] Retrying request with new token');
            return this.request<T>(endpoint, options, retryCount + 1);
          } catch (refreshError) {
            console.error('[API] Token refresh failed, redirecting to login');
            // Only redirect to login if we're not already on an auth page
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
              // Use setTimeout to avoid blocking the current execution
              setTimeout(() => {
                window.location.href = '/auth/';
              }, 100);
            }
            throw refreshError;
          }
        }

        // Handle other error responses (4xx, 5xx)
        const error = {
          error: json.error || json.message || `HTTP ${response.status}`,
          status: response.status,
          details: json.details,
        };

        throw error;
      }

      // Handle successful responses (2xx)
      // Backend wraps success responses in { data: {...} }
      if (json.data !== undefined) {
        return json.data as T;
      }

      return json as T;
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      // Network error - don't clear auth, just throw
      console.error('[API] Network error:', error);
      throw {
        error: error.message || 'Network error',
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    let url = endpoint;
    
    // Add query parameters if provided
    if (options?.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
