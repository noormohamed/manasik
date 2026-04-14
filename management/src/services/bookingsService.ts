/**
 * Bookings Service
 * Handles API calls for bookings management
 */

import { api } from '@/lib/api';

export interface BookingListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  bookingSource?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  amountRangeMin?: number;
  amountRangeMax?: number;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  serviceName: string;
  bookingDate: string;
  checkInDate?: string;
  checkOutDate?: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  currency: string;
  bookingSource?: 'DIRECT' | 'AGENT' | 'API' | 'ADMIN';
  holdExpiresAt?: string;
  agentName?: string;
}

export interface BookingDetail extends Booking {
  companyId: string;
  subtotal: number;
  tax: number;
  pricingBreakdown: {
    subtotal: number;
    tax: number;
    total: number;
  };
  timeline: Array<{ status: string; timestamp: string }>;
  payment?: any;
  cancellation?: any;
  refund?: any;
  metadata: any;
  nights?: number;
  guests?: number;
  roomType?: string;
  hotelName?: string;
  agentId?: string;
  paymentLinkUrl?: string;
  brokerNotes?: string;
}

export interface BookingListResponse {
  success: boolean;
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookingDetailResponse {
  success: boolean;
  data: BookingDetail;
}

export const bookingsService = {
  /**
   * Get bookings list
   */
  async getBookings(params: BookingListParams): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.serviceType) queryParams.append('serviceType', params.serviceType);
    if (params.bookingSource) queryParams.append('bookingSource', params.bookingSource);
    if (params.dateRangeStart) queryParams.append('dateRangeStart', params.dateRangeStart);
    if (params.dateRangeEnd) queryParams.append('dateRangeEnd', params.dateRangeEnd);
    if (params.amountRangeMin) queryParams.append('amountRangeMin', params.amountRangeMin.toString());
    if (params.amountRangeMax) queryParams.append('amountRangeMax', params.amountRangeMax.toString());

    return await api.get(`/api/admin/bookings?${queryParams.toString()}`);
  },

  /**
   * Get booking detail
   */
  async getBookingDetail(bookingId: string): Promise<BookingDetailResponse> {
    return await api.get(`/api/admin/bookings/${bookingId}`);
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason: string): Promise<BookingDetailResponse> {
    return await api.post(`/api/admin/bookings/${bookingId}/cancel`, {
      reason,
    });
  },

  /**
   * Issue a refund
   */
  async refundBooking(bookingId: string, amount: number, reason: string): Promise<BookingDetailResponse> {
    return await api.post(`/api/admin/bookings/${bookingId}/refund`, {
      amount,
      reason,
    });
  },
};
