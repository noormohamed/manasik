/**
 * Shared TypeScript interfaces for the Admin Analytics Dashboard.
 *
 * These types mirror the backend AnalyticsResponse from
 * service/src/services/admin-analytics.service.ts and the WebSocket event
 * types from service/src/websocket/analytics-events.ts.
 */

// ---------------------------------------------------------------------------
// Analytics API Response
// ---------------------------------------------------------------------------

export interface AnalyticsResponse {
  revenue: RevenueMetrics;
  bookings: BookingMetrics;
  hotels: HotelMetrics;
  reviews: ReviewMetrics;
  users: UserMetrics;
  meta: AnalyticsMeta;
}

export interface RevenueMetrics {
  total: number;
  average: number;
  trend: number;
  daily: DailyRevenue[];
  byHotel: HotelRevenue[];
  bySource: SourceRevenue[];
  brokerFees: number;
  totalManasikFees: number;
  activeCount: number;
}

export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface HotelRevenue {
  hotelId: string;
  hotelName: string;
  revenue: number;
}

export interface SourceRevenue {
  source: string;
  revenue: number;
}

export interface BookingMetrics {
  total: number;
  conversionRate: number;
  averageStayDuration: number;
  averageLeadTime: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  dailyVolume: DailyBookingVolume[];
  byPaymentStatus: Record<string, number>;
  expiredRate: number;
}

export interface DailyBookingVolume {
  date: string;
  confirmed: number;
  completed: number;
  expired: number;
}

export interface HotelPerformance {
  hotelId: string;
  hotelName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface HotelMetrics {
  performance: HotelPerformance[];
  zeroBookingCount: number;
}

export interface ReviewMetrics {
  ratingDistribution: Record<number, number>;
  averageRating: number;
}

export interface TopAgent {
  agentId: string;
  agentName: string;
  revenue: number;
}

export interface UserMetrics {
  byRole: Record<string, number>;
  totalCount: number;
  topAgents: TopAgent[];
}

export interface AnalyticsMeta {
  generatedAt: string;
  range: number;
  periodStart: string;
  periodEnd: string;
}

// ---------------------------------------------------------------------------
// Analytics Query
// ---------------------------------------------------------------------------

export interface AnalyticsQuery {
  range: 7 | 30 | 90;
}

// ---------------------------------------------------------------------------
// WebSocket Event Types
// ---------------------------------------------------------------------------

export interface AnalyticsEvent {
  eventType:
    | 'booking:created'
    | 'booking:statusChanged'
    | 'payment:received'
    | 'review:submitted';
  timestamp: string;
  data:
    | BookingCreatedData
    | BookingStatusChangedData
    | PaymentReceivedData
    | ReviewSubmittedData;
  delta: IncrementalDelta;
}

export interface BookingCreatedData {
  bookingId: number;
  source: 'DIRECT' | 'BROKER' | 'STAFF_CREATED';
  amount: number;
  status: string;
}

export interface BookingStatusChangedData {
  bookingId: number;
  previousStatus: string;
  newStatus: string;
  revenueImpact: number;
}

export interface PaymentReceivedData {
  paymentId: number;
  bookingId: number;
  amount: number;
}

export interface ReviewSubmittedData {
  reviewId: number;
  hotelId: number;
  rating: number;
}

export interface IncrementalDelta {
  bookingCountAdjustment?: number;
  revenueAdjustment?: number;
  statusCountAdjustments?: Record<string, number>;
  sourceCountAdjustments?: Record<string, number>;
  paymentStatusAdjustments?: Record<string, number>;
  ratingAdjustment?: { rating: number; count: number } | null;
}

// ---------------------------------------------------------------------------
// Token Refresh Event (special WebSocket event shape)
// ---------------------------------------------------------------------------

export interface TokenRefreshedEvent {
  eventType: 'auth:tokenRefreshed';
  timestamp: string;
  data: { token: string };
  delta: null;
}

// ---------------------------------------------------------------------------
// Connection Status
// ---------------------------------------------------------------------------

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';
