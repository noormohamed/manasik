/**
 * Analytics Service
 * Handles API calls for the admin analytics dashboard.
 */

import { api } from '@/lib/api';
import type { AnalyticsResponse } from '@/types/analytics';

export const analyticsService = {
  /**
   * Fetch aggregated analytics data for the given date range.
   *
   * @param range - Number of days to aggregate (7, 30, or 90)
   * @returns The full analytics response from the backend
   */
  async getAnalytics(range: number): Promise<AnalyticsResponse> {
    const response: any = await api.get(`/api/admin/analytics?range=${range}`);
    // Handle both response shapes:
    // 1. Direct: { revenue, bookings, ... } (from dedicated analytics router)
    // 2. Wrapped: { success, data: { revenue, bookings, ... } } (from admin router)
    if (response?.revenue) return response;
    if (response?.data?.revenue) return response.data;
    return response;
  },
};
