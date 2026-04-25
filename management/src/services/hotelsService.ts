import { apiClient } from '@/lib/api';

export interface Hotel {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  agentId: string;
  agentName: string;
  status: string;
  city: string;
  country: string;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  createdAt: string;
}

export interface HotelImage {
  id: number;
  url: string;
  displayOrder: number;
}

export interface HotelAmenity {
  name: string;
  available: boolean;
}

export interface HotelRoom {
  id: string;
  name: string;
  description: string;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  basePrice: number;
  currency: string;
  status: string;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
}

export interface RecentBooking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface HotelDetail extends Hotel {
  description: string;
  address: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  hotelRules?: string;
  images: HotelImage[];
  amenities: HotelAmenity[];
  rooms: HotelRoom[];
  bookingStats: BookingStats;
  recentBookings: RecentBooking[];
}

export interface TransactionStats {
  revenueByDate: { date: string; revenue: number; bookings: number }[];
  revenueByHotel: { hotelName: string; revenue: number; bookings: number }[];
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  };
}

export interface HotelReview {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  bookingId: string;
}

export interface HotelReviewsResponse {
  reviews: HotelReview[];
  total: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export interface HotelTransaction {
  id: string;
  bookingId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  guestName: string;
  createdAt: string;
}

export interface HotelTransactionsResponse {
  transactions: HotelTransaction[];
  total: number;
  totalAmount: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export const hotelsService = {
  async getHotels(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    city?: string;
    country?: string;
  } = {}): Promise<PaginatedResponse<Hotel>> {
    const { page = 1, limit = 25, search, status, city, country } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (city) params.append('city', city);
    if (country) params.append('country', country);

    return apiClient.get(`/api/admin/hotels?${params.toString()}`);
  },

  async getHotelDetail(id: string): Promise<{ success: boolean; data: HotelDetail }> {
    return apiClient.get(`/api/admin/hotels/${id}`);
  },

  async getCities(): Promise<{ success: boolean; data: string[] }> {
    return apiClient.get('/api/admin/hotels/cities');
  },

  async getCountries(): Promise<{ success: boolean; data: string[] }> {
    return apiClient.get('/api/admin/hotels/countries');
  },

  async updateHotelStatus(id: string, status: string): Promise<{ success: boolean; data: HotelDetail }> {
    return apiClient.post(`/api/admin/hotels/${id}/status`, { status });
  },

  async updateHotelDetails(id: string, updates: Partial<HotelDetail>): Promise<{ success: boolean; data: HotelDetail }> {
    return apiClient.put(`/api/hotels/${id}`, updates);
  },

  async getTransactionStats(options: {
    period?: 'daily' | 'weekly' | 'monthly';
    days?: number;
  } = {}): Promise<{ success: boolean; data: TransactionStats }> {
    const { period = 'daily', days = 30 } = options;
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('days', days.toString());
    return apiClient.get(`/api/admin/hotels/stats/transactions?${params.toString()}`);
  },

  async getHotelReviews(hotelId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: HotelReviewsResponse }> {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return apiClient.get(`/api/admin/hotels/${hotelId}/reviews?${params.toString()}`);
  },

  async getHotelTransactions(hotelId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: HotelTransactionsResponse }> {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return apiClient.get(`/api/admin/hotels/${hotelId}/transactions?${params.toString()}`);
  },
};
