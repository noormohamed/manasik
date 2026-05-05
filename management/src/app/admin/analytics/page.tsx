'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsResponse } from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';
import { useAnalyticsWebSocket } from '@/hooks/useAnalyticsWebSocket';

import ConnectionStatusIndicator from '@/components/Analytics/ConnectionStatusIndicator';
import DateRangeSelector from '@/components/Analytics/DateRangeSelector';
import SectionSkeleton from '@/components/Analytics/SectionSkeleton';
import RevenueSection from '@/components/Analytics/RevenueSection';
import BookingsSection from '@/components/Analytics/BookingsSection';
import HotelPerformanceSection from '@/components/Analytics/HotelPerformanceSection';
import RatingDistributionSection from '@/components/Analytics/RatingDistributionSection';
import UsersAgentsSection from '@/components/Analytics/UsersAgentsSection';
import OperationalSection from '@/components/Analytics/OperationalSection';

export default function AnalyticsPage() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket hook for real-time updates
  const { connectionStatus, reconnect } = useAnalyticsWebSocket(data, setData);

  // Fetch analytics data
  const fetchData = useCallback(
    async (selectedRange: 7 | 30 | 90, isRangeChange = false) => {
      try {
        if (isRangeChange) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await analyticsService.getAnalytics(selectedRange);
        setData(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load analytics data';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  // Fetch on mount
  useEffect(() => {
    fetchData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle date range change
  const handleRangeChange = useCallback(
    (newRange: 7 | 30 | 90) => {
      setRange(newRange);
      fetchData(newRange, true);
    },
    [fetchData],
  );

  // Retry after error
  const handleRetry = useCallback(() => {
    fetchData(range, data !== null);
  }, [fetchData, range, data]);

  // --- Initial loading state (no data yet) ---
  if (loading && !data) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics &amp; Reporting
            </h1>
            <p className="text-gray-600 mt-1">Platform metrics and trends</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatusIndicator status={connectionStatus} />
            <DateRangeSelector value={range} onChange={handleRangeChange} />
          </div>
        </div>

        {/* Skeleton sections */}
        <SectionSkeleton kpiCount={3} showChart />
        <SectionSkeleton kpiCount={3} showChart />
        <SectionSkeleton kpiCount={1} showChart />
        <SectionSkeleton kpiCount={1} showChart />
        <SectionSkeleton kpiCount={1} showChart />
        <SectionSkeleton kpiCount={2} showChart />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics &amp; Reporting
          </h1>
          <p className="text-gray-600 mt-1">Platform metrics and trends</p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatusIndicator
            status={connectionStatus}
            onReconnect={reconnect}
            maxRetriesReached={connectionStatus === 'disconnected'}
          />
          <DateRangeSelector value={range} onChange={handleRangeChange} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm font-medium">
              {error}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="text-sm font-medium text-red-700 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dashboard sections with optional loading overlay */}
      {data && (
        <div className="relative">
          {/* Semi-transparent overlay during date range changes */}
          {refreshing && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-start justify-center pt-32">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <svg
                  className="animate-spin h-4 w-4 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Updating dashboard…
                </span>
              </div>
            </div>
          )}

          {/* Sections in logical order */}
          <div className="space-y-10">
            <RevenueSection data={data.revenue} />
            <BookingsSection data={data.bookings} />
            <HotelPerformanceSection data={data.hotels} />
            <RatingDistributionSection data={data.reviews} />
            <UsersAgentsSection data={data.users} />
            <OperationalSection data={data.bookings} />
          </div>
        </div>
      )}
    </div>
  );
}
