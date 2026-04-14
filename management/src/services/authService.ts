import { apiClient } from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
  requiresMFA?: boolean;
  tempToken?: string;
}

export interface CurrentUserResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<any> {
    const response = await apiClient.post<any>('/api/admin/auth/login', credentials);
    
    // Response structure: { success, token, refreshToken, expiresIn }
    return {
      message: 'Login successful',
      user: {
        id: '1',
        email: credentials.email,
        firstName: 'Admin',
        lastName: 'User',
      },
      tokens: {
        accessToken: response.token,
        refreshToken: response.refreshToken,
      },
    };
  },

  async logout(): Promise<{ message: string }> {
    return apiClient.post('/api/admin/auth/logout');
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<any>('/api/admin/users/me');
    
    // Response structure: { id, email, first_name, last_name, role, is_active, created_at }
    return {
      user: {
        id: response.id,
        email: response.email,
        firstName: response.first_name,
        lastName: response.last_name,
        role: response.role,
      },
    };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post('/api/admin/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
