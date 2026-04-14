import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuditLogEntry {
  id: number;
  adminName: string;
  actionType: string;
  entityType: string;
  entityId: number;
  reason: string | null;
  timestamp: string;
  ipAddress: string;
}

interface AuditLogState {
  list: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    actionType: string | null;
    entityType: string | null;
    adminName: string | null;
    dateRange: { from: string | null; to: string | null };
  };
}

const initialState: AuditLogState = {
  list: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },
  filters: {
    actionType: null,
    entityType: null,
    adminName: null,
    dateRange: { from: null, to: null },
  },
};

const auditLogSlice = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setList: (state, action: PayloadAction<AuditLogEntry[]>) => {
      state.list = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<AuditLogState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<AuditLogState['filters']>>
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
  setPagination,
  setFilters,
  resetFilters,
} = auditLogSlice.actions;

export default auditLogSlice.reducer;
