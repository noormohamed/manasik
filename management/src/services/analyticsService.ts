import { apiClient } from '@/lib/api';
import { DashboardMetrics } from '@/types';

export const analyticsService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return apiClient.get('/api/admin/analytics/dashboard');
  },

  async getChartData(
    dateRange?: string,
    metrics?: string[]
  ): Promise<Record<string, unknown>> {
    const params = new URLSearchParams();
    if (dateRange) params.append('dateRange', dateRange);
    if (metrics) params.append('metrics', metrics.join(','));

    return apiClient.get(`/api/admin/analytics/charts?${params.toString()}`);
  },
};
