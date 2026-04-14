import { apiClient } from '@/lib/api';
import { AuditLogEntry, PaginatedResponse } from '@/types';

export const auditLogService = {
  async getAuditLog(
    page: number = 1,
    limit: number = 25,
    actionType?: string,
    entityType?: string,
    adminName?: string,
    dateRange?: { from: string; to: string }
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (actionType) params.append('actionType', actionType);
    if (entityType) params.append('entityType', entityType);
    if (adminName) params.append('adminName', adminName);
    if (dateRange) {
      params.append('dateRange', `${dateRange.from}:${dateRange.to}`);
    }

    return apiClient.get(`/api/admin/audit-log?${params.toString()}`);
  },
};
