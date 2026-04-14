import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import bookingsReducer from './slices/bookingsSlice';
import reviewsReducer from './slices/reviewsSlice';
import transactionsReducer from './slices/transactionsSlice';
import analyticsReducer from './slices/analyticsSlice';
import auditLogReducer from './slices/auditLogSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    bookings: bookingsReducer,
    reviews: reviewsReducer,
    transactions: transactionsReducer,
    analytics: analyticsReducer,
    auditLog: auditLogReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setToken'],
        ignoredPaths: ['auth.token'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
