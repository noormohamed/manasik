import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
          originalRequest._retry = true;

          // If already refreshing, wait for the existing refresh promise
          if (this.isRefreshing && this.refreshPromise) {
            try {
              const newToken = await this.refreshPromise;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          this.isRefreshing = true;
          this.refreshPromise = this.performTokenRefresh();

          try {
            const newToken = await this.refreshPromise;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
              window.location.href = '/admin/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
            window.location.href = '/admin/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post('/auth/refresh', {
        refreshToken,
      });

      const tokens = response.data.tokens || response.data.data?.tokens;
      if (!tokens?.accessToken) {
        throw new Error('No access token in refresh response');
      }

      this.setToken(tokens.accessToken);
      if (tokens.refreshToken) {
        this.setRefreshToken(tokens.refreshToken);
      }

      return tokens.accessToken;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_token', token);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_refresh_token');
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_refresh_token', token);
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<any>(url, config);
    return this.handleResponse(response);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<any>(url, data, config);
    return this.handleResponse(response);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<any>(url, data, config);
    return this.handleResponse(response);
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<any>(url, data, config);
    return this.handleResponse(response);
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<any>(url, config);
    return this.handleResponse(response);
  }

  private handleResponse<T>(response: AxiosResponse<any>): T {
    const data = response.data;

    // Handle error responses
    if (data.error) {
      throw new Error(data.error);
    }

    // If response has a 'data' wrapper (from API), return the inner data object
    // which contains { success, data, pagination }
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return data.data;
    }

    // Otherwise return the whole response
    return data;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;
