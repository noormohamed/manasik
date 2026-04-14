// Auth Types
export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  mfaEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  requiresMFA: boolean;
  token?: string;
  tempToken?: string;
  expiresIn?: number;
}

export interface MFAVerifyRequest {
  mfaCode: string;
  tempToken: string;
}

export interface MFAVerifyResponse {
  success: boolean;
  token: string;
  expiresIn: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  registeredAt: string;
  lastLoginAt: string | null;
  bookingCount: number;
  totalSpent: number;
}

export interface UserDetail extends User {
  bookings: {
    total: number;
    recent: Booking[];
  };
  reviews: {
    total: number;
    averageRating: number;
    recent: Review[];
  };
  transactions: {
    total: number;
    totalSpent: number;
    recent: Transaction[];
  };
}

// Booking Types
export interface Booking {
  id: string;
  customerId: number;
  customerName: string;
  serviceType: string;
  serviceName: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate?: string;
  status: string;
  totalAmount: number;
  currency: string;
}

export interface BookingDetail extends Booking {
  pricingBreakdown: {
    roomRate: number;
    nights: number;
    subtotal: number;
    taxes: number;
    total: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
  }>;
  payment: {
    method: string;
    transactionId: string;
    paidAt: string;
  };
  cancellation?: {
    reason: string;
    date: string;
  };
  refund?: {
    amount: number;
    date: string;
  };
}

// Review Types
export interface Review {
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

export interface ReviewDetail extends Review {
  text: string;
  moderationNotes?: string;
}

// Transaction Types
export interface Transaction {
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

export interface TransactionDetail extends Transaction {
  paymentMethod: string;
  gatewayResponse: {
    code: string;
    message: string;
  };
  dispute?: {
    reason: string;
    amount: number;
  };
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Analytics Types
export interface DashboardMetrics {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  platformUptime: number;
  totalReviews: number;
  averageRating: number;
  pendingTransactions: number;
  lastUpdated: string;
}

// Audit Log Types
export interface AuditLogEntry {
  id: number;
  adminName: string;
  actionType: string;
  entityType: string;
  entityId: number;
  reason?: string;
  timestamp: string;
  ipAddress: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

// API Error Types
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
