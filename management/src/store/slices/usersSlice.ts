import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  registeredAt: string;
  lastLoginAt: string | null;
  bookingCount: number;
  totalSpent: number;
}

interface UsersState {
  list: User[];
  detail: User | null;
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
    role: string | null;
    status: string | null;
  };
}

const initialState: UsersState = {
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
    role: null,
    status: null,
  },
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setList: (state, action: PayloadAction<User[]>) => {
      state.list = action.payload;
    },
    setDetail: (state, action: PayloadAction<User | null>) => {
      state.detail = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<UsersState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<UsersState['filters']>>
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
} = usersSlice.actions;

export default usersSlice.reducer;
