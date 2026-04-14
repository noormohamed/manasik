import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  dashboardMetrics: {
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    platformUptime: number;
    totalReviews: number;
    averageRating: number;
    pendingTransactions: number;
    lastUpdated: string | null;
  };
  chartData: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

const initialState: AnalyticsState = {
  dashboardMetrics: {
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    platformUptime: 0,
    totalReviews: 0,
    averageRating: 0,
    pendingTransactions: 0,
    lastUpdated: null,
  },
  chartData: {},
  isLoading: false,
  error: null,
  dateRange: {
    from: null,
    to: null,
  },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDashboardMetrics: (
      state,
      action: PayloadAction<Partial<AnalyticsState['dashboardMetrics']>>
    ) => {
      state.dashboardMetrics = { ...state.dashboardMetrics, ...action.payload };
    },
    setChartData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.chartData = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<Partial<AnalyticsState['dateRange']>>
    ) => {
      state.dateRange = { ...state.dateRange, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  setDashboardMetrics,
  setChartData,
  setDateRange,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
