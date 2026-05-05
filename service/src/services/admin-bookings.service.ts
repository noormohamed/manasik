/**
 * Admin Bookings Service
 * Handles booking management operations for the admin panel
 */

import { Database } from '../database/connection';

export interface BookingFilter {
  search?: string;
  status?: string;
  serviceType?: string;
  bookingSource?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  amountRangeMin?: number;
  amountRangeMax?: number;
  limit: number;
  offset: number;
}

export interface AdminBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  serviceName: string;
  bookingDate: string;
  checkInDate?: string;
  checkOutDate?: string;
  nights?: number;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  currency: string;
  bookingSource?: 'DIRECT' | 'AGENT' | 'API' | 'ADMIN';
  holdExpiresAt?: string;
  agentName?: string;
  hotelId?: string;
  hotelName?: string;
  hotelCity?: string;
  hotelCountry?: string;
  starRating?: number;
}

export interface BookingDetail extends AdminBooking {
  companyId: string;
  subtotal: number;
  tax: number;
  pricingBreakdown: any;
  timeline: Array<{ status: string; timestamp: string }>;
  payment?: any;
  cancellation?: any;
  refund?: any;
  metadata: any;
  guests?: number;
  roomType?: string;
  hotelName?: string;
  hotelAddress?: string;
  hotelCity?: string;
  hotelCountry?: string;
  hotelFullAddress?: string;
  agentId?: string;
  agentEmail?: string | null;
  agentPhone?: string | null;
  agentCommissionRate?: number | null;
  agentStatus?: string | null;
  agentTotalBookings?: number | null;
  agentTotalRevenue?: number | null;
  agentCompany?: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
  } | null;
  paymentLinkUrl?: string;
  brokerNotes?: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
}

export class AdminBookingsService {
  constructor(private database: Database) {}

  /**
   * Get bookings list with pagination, search, and filtering
   */
  async getBookings(filter: BookingFilter): Promise<{ bookings: AdminBooking[]; total: number }> {
    let query = `
      SELECT 
        b.id,
        UPPER(SUBSTRING(MD5(b.id), 1, 8)) as bookingRef,
        b.customer_id as customerId,
        CONCAT(u.first_name, ' ', u.last_name) as customerName,
        u.email as customerEmail,
        b.service_type as serviceType,
        COALESCE(h.name, COALESCE(c.name, 'N/A')) as serviceName,
        b.created_at as bookingDate,
        b.metadata,
        b.status,
        b.payment_status as paymentStatus,
        b.total as totalAmount,
        b.currency,
        b.booking_source as bookingSource,
        b.hold_expires_at as holdExpiresAt,
        CONCAT(agent_user.first_name, ' ', agent_user.last_name) as agentName,
        h.name as hotelName,
        h.city as hotelCity,
        h.country as hotelCountry,
        h.star_rating as starRating,
        JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) as hotelId
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN companies c ON b.company_id = c.id
      LEFT JOIN hotels h ON JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) = h.id
      LEFT JOIN agents a ON b.agent_id = a.id
      LEFT JOIN users agent_user ON a.user_id = agent_user.id
    `;

    const params: any[] = [];
    let hasWhere = false;

    // Search filter
    if (filter.search) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `(b.id LIKE ? OR u.email LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR c.name LIKE ? OR h.name LIKE ?)`;
      const searchTerm = `%${filter.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Status filter
    if (filter.status) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.status = ?`;
      params.push(filter.status);
    }

    // Service type filter
    if (filter.serviceType) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.service_type = ?`;
      params.push(filter.serviceType);
    }

    // Booking source filter (DIRECT, AGENT, API, ADMIN)
    if (filter.bookingSource) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.booking_source = ?`;
      params.push(filter.bookingSource);
    }

    // Date range filter
    if (filter.dateRangeStart) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.created_at >= ?`;
      params.push(filter.dateRangeStart);
    }
    if (filter.dateRangeEnd) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.created_at <= ?`;
      params.push(filter.dateRangeEnd);
    }

    // Amount range filter
    if (filter.amountRangeMin !== undefined) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.total >= ?`;
      params.push(filter.amountRangeMin);
    }
    if (filter.amountRangeMax !== undefined) {
      if (!hasWhere) {
        query += ` WHERE `;
        hasWhere = true;
      } else {
        query += ` AND `;
      }
      query += `b.total <= ?`;
      params.push(filter.amountRangeMax);
    }

    // Get total count (use a copy of params before adding pagination)
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as count FROM'
    );
    const countResult = await this.database.query(countQuery, [...params]);
    const total = countResult[0]?.count || 0;

    // Add sorting and pagination (LIMIT and OFFSET must be literals, not parameters)
    query += ` ORDER BY b.created_at DESC LIMIT ${filter.limit} OFFSET ${filter.offset}`;

    const bookings = await this.database.query(query, params);

    return {
      bookings: bookings.map((b: any) => {
        const metadata = b.metadata ? (typeof b.metadata === 'string' ? JSON.parse(b.metadata) : b.metadata) : null;
        return {
          ...b,
          metadata,
          checkInDate: metadata?.checkInDate || null,
          checkOutDate: metadata?.checkOutDate || null,
          nights: metadata?.nights || null,
          roomType: metadata?.roomType || null,
          hotelId: b.hotelId || metadata?.hotelId || null,
          hotelName: b.hotelName || metadata?.hotelName || null,
        };
      }),
      total,
    };
  }

  /**
   * Get booking detail with all related information
   */
  async getBookingDetail(bookingId: string): Promise<BookingDetail | null> {
    const query = `
      SELECT 
        b.*,
        CONCAT(u.first_name, ' ', u.last_name) as customerName,
        u.email as customerEmail,
        COALESCE(h.name, c.name) as serviceName,
        h.name as hotelName,
        h.address as hotelAddress,
        h.city as hotelCity,
        h.country as hotelCountry,
        CONCAT(agent_user.first_name, ' ', agent_user.last_name) as agentName,
        agent_user.email as agentEmail,
        a.phone as agentPhone,
        a.commission_rate as agentCommissionRate,
        a.status as agentStatus,
        a.total_bookings as agentTotalBookings,
        a.total_revenue as agentTotalRevenue,
        agent_company.name as agentCompanyName,
        agent_company.address as agentCompanyAddress,
        agent_company.city as agentCompanyCity,
        agent_company.country as agentCompanyCountry,
        agent_company.phone as agentCompanyPhone,
        agent_company.email as agentCompanyEmail,
        agent_company.website as agentCompanyWebsite
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN companies c ON b.company_id = c.id
      LEFT JOIN hotels h ON JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) = h.id
      LEFT JOIN agents a ON b.agent_id = a.id
      LEFT JOIN users agent_user ON a.user_id = agent_user.id
      LEFT JOIN companies agent_company ON a.company_id = agent_company.id
      WHERE b.id = ?
    `;

    const results = await this.database.query(query, [bookingId]);

    if (results.length === 0) {
      return null;
    }

    const booking = results[0];
    const metadata = booking.metadata ? (typeof booking.metadata === 'string' ? JSON.parse(booking.metadata) : booking.metadata) : {};

    // Extract stay dates from metadata
    const checkInDate = metadata.checkInDate || metadata.check_in_date || null;
    const checkOutDate = metadata.checkOutDate || metadata.check_out_date || null;
    let nights = metadata.nights || null;
    
    // Calculate nights if not provided but dates are available
    if (!nights && checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Determine booking source - check column first, then metadata for backwards compatibility
    const bookingSource = booking.booking_source || metadata.bookingSource || metadata.source || 'DIRECT';

    // Build hotel full address
    const hotelFullAddress = [booking.hotelAddress, booking.hotelCity, booking.hotelCountry]
      .filter(Boolean)
      .join(', ') || null;

    return {
      id: booking.id,
      customerId: booking.customer_id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      companyId: booking.company_id,
      serviceType: booking.service_type,
      serviceName: booking.serviceName,
      hotelName: booking.hotelName || booking.serviceName,
      hotelAddress: booking.hotelAddress || null,
      hotelCity: booking.hotelCity || null,
      hotelCountry: booking.hotelCountry || null,
      hotelFullAddress,
      bookingDate: booking.created_at,
      checkInDate,
      checkOutDate,
      nights,
      guests: metadata.guests || metadata.numberOfGuests || 1,
      roomType: metadata.roomType || metadata.room_type || null,
      status: booking.status,
      paymentStatus: booking.payment_status || 'PENDING',
      totalAmount: booking.total,
      currency: booking.currency,
      subtotal: booking.subtotal,
      tax: booking.tax,
      bookingSource,
      agentId: booking.agent_id || null,
      agentName: booking.agentName || null,
      agentEmail: booking.agentEmail || null,
      agentPhone: booking.agentPhone || null,
      agentCommissionRate: booking.agentCommissionRate || null,
      agentStatus: booking.agentStatus || null,
      agentTotalBookings: booking.agentTotalBookings || null,
      agentTotalRevenue: booking.agentTotalRevenue || null,
      agentCompany: booking.agentCompanyName ? {
        name: booking.agentCompanyName,
        address: booking.agentCompanyAddress,
        city: booking.agentCompanyCity,
        country: booking.agentCompanyCountry,
        phone: booking.agentCompanyPhone,
        email: booking.agentCompanyEmail,
        website: booking.agentCompanyWebsite,
      } : null,
      holdExpiresAt: booking.hold_expires_at || null,
      paymentLinkUrl: booking.payment_link_url || null,
      brokerNotes: booking.broker_notes || null,
      // Guest info from metadata (actual guest, not the booking agent)
      guestName: metadata.guestName || null,
      guestEmail: metadata.guestEmail || null,
      guestPhone: metadata.guestPhone || null,
      pricingBreakdown: {
        subtotal: booking.subtotal,
        tax: booking.tax,
        total: booking.total,
      },
      timeline: [
        {
          status: booking.status,
          timestamp: booking.created_at,
        },
      ],
      metadata,
    };
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const query = `
      UPDATE bookings 
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.database.query(query, [bookingId]);
    return result.affectedRows > 0;
  }

  /**
   * Issue a refund for a booking
   */
  async refundBooking(bookingId: string, amount: number, reason: string): Promise<boolean> {
    const query = `
      UPDATE bookings 
      SET status = 'REFUNDED', updated_at = NOW()
      WHERE id = ?
    `;

    const result = await this.database.query(query, [bookingId]);
    return result.affectedRows > 0;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<any> {
    const query = `
      SELECT * FROM bookings WHERE id = ?
    `;

    const results = await this.database.query(query, [bookingId]);
    return results.length > 0 ? results[0] : null;
  }
}

export const createAdminBookingsService = (database: Database): AdminBookingsService => {
  return new AdminBookingsService(database);
};
