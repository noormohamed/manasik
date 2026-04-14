import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  serviceType: string;
  serviceName: string;
  bookingDate: string;
  checkInDate?: string;
  checkOutDate?: string;
  nights?: number;
  guests?: number;
  roomType?: string;
  hotelName?: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  currency: string;
  metadata?: any;
  bookingSource?: 'DIRECT' | 'AGENT' | 'API' | 'ADMIN';
  holdExpiresAt?: string;
  agentName?: string;
}

interface BookingsState {
  list: Booking[];
  detail: Booking | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status: string | null;
    serviceType: string | null;
    bookingSource: string | null;
    dateRange: { from: string | null; to: string | null };
    amountRange: { min: number | null; max: number | null };
  };
}

const initialState: BookingsState = {
  list: [],
  detail: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: null,
    serviceType: null,
    bookingSource: null,
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
  },
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setList: (state, action: PayloadAction<Booking[]>) => {
      state.list = action.payload;
    },
    setDetail: (state, action: PayloadAction<Booking | null>) => {
      state.detail = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<BookingsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<BookingsState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setLoading,
  setError,
  setList,
  setDetail,
  setPagination,
  setFilters,
  resetFilters,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
