import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Review {
  id: string;
  reviewerId: number;
  reviewerName: string;
  serviceType: string;
  serviceName: string;
  rating: number;
  reviewDate: string;
  status: string;
  preview: string;
}

interface ReviewsState {
  list: Review[];
  detail: Review | null;
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
    rating: number | null;
    dateRange: { from: string | null; to: string | null };
    serviceType: string | null;
  };
}

const initialState: ReviewsState = {
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
    rating: null,
    dateRange: { from: null, to: null },
    serviceType: null,
  },
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setList: (state, action: PayloadAction<Review[]>) => {
      state.list = action.payload;
    },
    setDetail: (state, action: PayloadAction<Review | null>) => {
      state.detail = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<ReviewsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ReviewsState['filters']>>
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
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
