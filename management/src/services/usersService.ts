import { apiClient } from '@/lib/api';
import { User, UserDetail, PaginatedResponse } from '@/types';

export const usersService = {
  async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 25, search, role, status } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);

    return apiClient.get(`/api/admin/users?${params.toString()}`);
  },

  async getUserDetail(id: number): Promise<UserDetail> {
    return apiClient.get(`/api/admin/users/${id}`);
  },

  async suspendUser(id: number, reason: string): Promise<{ success: boolean; user: User }> {
    return apiClient.post(`/api/admin/users/${id}/suspend`, { reason });
  },

  async reactivateUser(id: number): Promise<{ success: boolean; user: User }> {
    return apiClient.post(`/api/admin/users/${id}/reactivate`);
  },

  async resetPassword(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/api/admin/users/${id}/reset-password`);
  },
};
