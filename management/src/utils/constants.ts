// User Roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  HOTEL_MANAGER: 'HOTEL_MANAGER',
  AGENT: 'AGENT',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

// Service Types
export const SERVICE_TYPES = {
  HOTEL: 'HOTEL',
  TAXI: 'TAXI',
  EXPERIENCE: 'EXPERIENCE',
  CAR: 'CAR',
  FOOD: 'FOOD',
};

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
};

// Transaction Type
export const TRANSACTION_TYPE = {
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT',
  CHARGEBACK: 'CHARGEBACK',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  DISPUTED: 'DISPUTED',
};

// Action Types for Audit Log
export const ACTION_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  SUSPEND: 'SUSPEND',
  REACTIVATE: 'REACTIVATE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  FLAG: 'FLAG',
  CANCEL: 'CANCEL',
  REFUND: 'REFUND',
  DISPUTE: 'DISPUTE',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// API
export const API_TIMEOUT = 30000;
export const JWT_EXPIRY = 86400; // 24 hours
export const SESSION_TIMEOUT = 86400; // 24 hours
