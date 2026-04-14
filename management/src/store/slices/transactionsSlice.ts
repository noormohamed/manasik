import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  id: string;
  userId: number;
  userName: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  bookingId: string;
}

interface TransactionsState {
  list: Transaction[];
  detail: Transaction | null;
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
    type: string | null;
    status: string | null;
    dateRange: { from: string | null; to: string | null };
    amountRange: { min: number | null; max: number | null };
    currency: string | null;
  };
}

const initialState: TransactionsState = {
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
    type: null,
    status: null,
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
    currency: null,
  },
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setList: (state, action: PayloadAction<Transaction[]>) => {
      state.list = action.payload;
    },
    setDetail: (state, action: PayloadAction<Transaction | null>) => {
      state.detail = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<TransactionsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<TransactionsState['filters']>>
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
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
