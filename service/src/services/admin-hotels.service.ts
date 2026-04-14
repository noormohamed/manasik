/**
 * Admin Hotels Service
 * Provides hotel management functionality for super admins
 */

import { getPool } from '../database/connection';

export interface AdminHotel {
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
  createdAt: Date;
}

export interface AdminHotelDetails extends AdminHotel {
  description: string;
  address: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  images: { id: number; url: string; displayOrder: number }[];
  amenities: { name: string; available: boolean }[];
  rooms: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    totalRooms: number;
    availableRooms: number;
    basePrice: number;
    currency: string;
    status: string;
  }[];
  bookingStats: {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    occupancyRate: number;
  };
  recentBookings: {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    total: number;
    status: string;
    createdAt: Date;
  }[];
}

export class AdminHotelsService {
  /**
   * Get paginated list of hotels with stats
   */
  async getHotels(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    city?: string;
    country?: string;
  }): Promise<{ hotels: AdminHotel[]; total: number }> {
    const pool = getPool();
    const { page = 1, limit = 20, search, status, city, country } = params;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const queryParams: any[] = [];

    if (search) {
      whereClause += ' AND (h.name LIKE ? OR h.city LIKE ? OR c.name LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      whereClause += ' AND h.status = ?';
      queryParams.push(status);
    }

    if (city) {
      whereClause += ' AND h.city = ?';
      queryParams.push(city);
    }

    if (country) {
      whereClause += ' AND h.country = ?';
      queryParams.push(country);
    }

    // Get hotels with stats
    const [hotels] = await pool.query<any>(
      `SELECT 
        h.id,
        h.name,
        h.company_id as companyId,
        COALESCE(c.name, 'N/A') as companyName,
        h.agent_id as agentId,
        COALESCE(a.name, 'N/A') as agentName,
        h.status,
        h.city,
        h.country,
        h.star_rating as starRating,
        h.average_rating as averageRating,
        h.total_reviews as totalReviews,
        h.total_rooms as totalRooms,
        h.created_at as createdAt,
        COALESCE(bs.total_bookings, 0) as totalBookings,
        COALESCE(bs.total_revenue, 0) as totalRevenue
      FROM hotels h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN agents a ON h.agent_id = a.id
      LEFT JOIN (
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.hotelId')) as hotel_id,
          COUNT(*) as total_bookings,
          SUM(total) as total_revenue
        FROM bookings
        WHERE service_type = 'HOTEL'
        GROUP BY JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.hotelId'))
      ) bs ON bs.hotel_id = h.id
      WHERE ${whereClause}
      ORDER BY h.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const [countResult] = await pool.query<any>(
      `SELECT COUNT(*) as total
      FROM hotels h
      LEFT JOIN companies c ON h.company_id = c.id
      WHERE ${whereClause}`,
      queryParams
    );

    return {
      hotels: hotels.map((h: any) => ({
        ...h,
        totalRevenue: parseFloat(h.totalRevenue) || 0,
        averageRating: parseFloat(h.averageRating) || 0,
      })),
      total: countResult[0].total,
    };
  }

  /**
   * Get detailed hotel information
   */
  async getHotelById(hotelId: string): Promise<AdminHotelDetails | null> {
    const pool = getPool();

    // Get basic hotel info
    const [hotels] = await pool.query<any>(
      `SELECT 
        h.*,
        COALESCE(c.name, 'N/A') as company_name,
        COALESCE(a.name, 'N/A') as agent_name
      FROM hotels h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN agents a ON h.agent_id = a.id
      WHERE h.id = ?`,
      [hotelId]
    );

    if (!hotels || hotels.length === 0) {
      return null;
    }

    const hotel = hotels[0];

    // Get images
    const [images] = await pool.query<any>(
      `SELECT id, image_url as url, display_order as displayOrder
      FROM hotel_images
      WHERE hotel_id = ?
      ORDER BY display_order`,
      [hotelId]
    );

    // Get amenities
    const [amenities] = await pool.query<any>(
      `SELECT amenity_name as name, is_available as available
      FROM hotel_amenities
      WHERE hotel_id = ?`,
      [hotelId]
    );

    // Get rooms
    const [rooms] = await pool.query<any>(
      `SELECT 
        id, name, description, capacity,
        total_rooms as totalRooms,
        available_rooms as availableRooms,
        base_price as basePrice,
        currency, status
      FROM room_types
      WHERE hotel_id = ?`,
      [hotelId]
    );

    // Get booking stats
    const [bookingStats] = await pool.query<any>(
      `SELECT 
        COUNT(*) as totalBookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmedBookings,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingBookings,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledBookings,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageBookingValue
      FROM bookings
      WHERE service_type = 'HOTEL'
        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.hotelId')) = ?`,
      [hotelId]
    );

    // Get recent bookings
    const [recentBookings] = await pool.query<any>(
      `SELECT 
        b.id,
        JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.guestName')) as guestName,
        JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.checkInDate')) as checkIn,
        JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.checkOutDate')) as checkOut,
        b.total,
        b.status,
        b.created_at as createdAt
      FROM bookings b
      WHERE b.service_type = 'HOTEL'
        AND JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) = ?
      ORDER BY b.created_at DESC
      LIMIT 10`,
      [hotelId]
    );

    const stats = bookingStats[0] || {};
    const totalRooms = hotel.total_rooms || 1;
    const occupancyRate = totalRooms > 0 
      ? Math.min(100, ((stats.confirmedBookings || 0) / totalRooms) * 100)
      : 0;

    return {
      id: hotel.id,
      name: hotel.name,
      companyId: hotel.company_id,
      companyName: hotel.company_name,
      agentId: hotel.agent_id,
      agentName: hotel.agent_name,
      status: hotel.status,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      country: hotel.country,
      zipCode: hotel.zip_code,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      starRating: hotel.star_rating,
      averageRating: parseFloat(hotel.average_rating) || 0,
      totalReviews: hotel.total_reviews,
      totalRooms: hotel.total_rooms,
      checkInTime: hotel.check_in_time,
      checkOutTime: hotel.check_out_time,
      cancellationPolicy: hotel.cancellation_policy,
      totalBookings: stats.totalBookings || 0,
      totalRevenue: parseFloat(stats.totalRevenue) || 0,
      createdAt: hotel.created_at,
      images,
      amenities: amenities.map((a: any) => ({ name: a.name, available: !!a.available })),
      rooms: rooms.map((r: any) => ({
        ...r,
        basePrice: parseFloat(r.basePrice) || 0,
      })),
      bookingStats: {
        totalBookings: stats.totalBookings || 0,
        confirmedBookings: stats.confirmedBookings || 0,
        pendingBookings: stats.pendingBookings || 0,
        cancelledBookings: stats.cancelledBookings || 0,
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        averageBookingValue: parseFloat(stats.averageBookingValue) || 0,
        occupancyRate,
      },
      recentBookings: recentBookings.map((b: any) => ({
        ...b,
        total: parseFloat(b.total) || 0,
      })),
    };
  }

  /**
   * Update hotel status
   */
  async updateHotelStatus(hotelId: string, status: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.query<any>(
      `UPDATE hotels SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, hotelId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get unique cities for filter
   */
  async getCities(): Promise<string[]> {
    const pool = getPool();
    const [cities] = await pool.query<any>(
      `SELECT DISTINCT city FROM hotels WHERE city IS NOT NULL ORDER BY city`
    );
    return cities.map((c: any) => c.city);
  }

  /**
   * Get unique countries for filter
   */
  async getCountries(): Promise<string[]> {
    const pool = getPool();
    const [countries] = await pool.query<any>(
      `SELECT DISTINCT country FROM hotels WHERE country IS NOT NULL ORDER BY country`
    );
    return countries.map((c: any) => c.country);
  }
}

export const adminHotelsService = new AdminHotelsService();
