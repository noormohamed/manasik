/**
 * Hotel Repository
 */

import { BaseRepository } from '../../../database/repository';
import { Hotel } from '../models/hotel';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { HotelFilterService, HotelFilterParams } from '../services/hotel-filter.service';

export interface HotelRow extends RowDataPacket {
  id: string;
  company_id: string;
  agent_id: string;
  name: string;
  description: string;
  status: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  star_rating: number;
  total_rooms: number;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy?: string;
  custom_policies?: string;
  average_rating: number;
  total_reviews: number;
  created_at: Date;
  updated_at: Date;
}

export class HotelRepository extends BaseRepository<Hotel> {
  private filterService: HotelFilterService;

  constructor() {
    super('hotels');
    this.filterService = new HotelFilterService();
  }

  /**
   * Find hotel by ID with proper field parsing
   */
  async findById(id: string): Promise<Hotel | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await this.query<HotelRow>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return this.mapRowToHotel(row);
  }

  /**
   * Find hotels by company
   */
  async findByCompany(companyId: string, limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [companyId, limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Find hotels by agent
   */
  async findByAgent(agentId: string, limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE agent_id = ? LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [agentId, limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Find hotels by city
   */
  async findByCity(city: string, limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE city = ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [city, limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Find hotels by country
   */
  async findByCountry(country: string, limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE country = ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [country, limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Find active hotels
   */
  async findActive(limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Search hotels by name
   */
  async searchByName(name: string, limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE name LIKE ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [`%${name}%`, limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Find hotels by rating
   */
  async findByMinRating(minRating: number, limit: number = 10, offset: number = 0): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE average_rating >= ? AND status = 'ACTIVE' ORDER BY average_rating DESC LIMIT ? OFFSET ?`;
    const results = await this.query<HotelRow>(query, [minRating, limit, offset]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Find top rated hotels
   */
  async findTopRated(limit: number = 10): Promise<Hotel[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY average_rating DESC LIMIT ?`;
    const results = await this.query<HotelRow>(query, [limit]);
    
    return results.map(row => this.mapRowToHotel(row));
  }

  /**
   * Count hotels by company
   */
  async countByCompany(companyId: string): Promise<number> {
    return this.count('company_id = ?', [companyId]);
  }

  /**
   * Count hotels by city
   */
  async countByCity(city: string): Promise<number> {
    return this.count('city = ? AND status = "ACTIVE"', [city]);
  }

  /**
   * Get hotel with amenities
   */
  async getWithAmenities(hotelId: string): Promise<any> {
    const hotel = await this.findById(hotelId);
    if (!hotel) return null;

    const amenitiesQuery = `SELECT amenity_name, is_available FROM hotel_amenities WHERE hotel_id = ?`;
    const amenities = await this.query<any>(amenitiesQuery, [hotelId]);

    const imagesQuery = `SELECT image_url FROM hotel_images WHERE hotel_id = ? ORDER BY display_order`;
    const images = await this.query<any>(imagesQuery, [hotelId]);

    return {
      ...hotel,
      amenities: amenities.reduce((acc, a) => ({ ...acc, [a.amenity_name]: a.is_available }), {}),
      images: images.map(i => i.image_url),
    };
  }

  /**
   * Find hotels managed by a user (via company_admins OR as agent)
   */
  async findByUserManaged(userId: string, limit: number = 100, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        h.*,
        COALESCE(c.name, 'Personal') as company_name,
        COALESCE(ca.admin_role, 'OWNER') as admin_role
      FROM ${this.tableName} h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
      LEFT JOIN agents a ON h.agent_id = a.id
      WHERE ca.user_id = ? OR h.agent_id = ? OR a.user_id = ?
      ORDER BY h.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const results = await this.query<any>(query, [userId, userId, userId, userId, limit.toString(), offset.toString()]);
    
    // Fetch images for each hotel
    const hotelsWithImages = await Promise.all(results.map(async (row) => {
      const imagesQuery = `SELECT image_url FROM hotel_images WHERE hotel_id = ? ORDER BY display_order`;
      const images = await this.query<any>(imagesQuery, [row.id]);
      
      return {
        id: row.id,
        companyId: row.company_id,
        companyName: row.company_name,
        adminRole: row.admin_role,
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        status: row.status,
        address: row.address,
        city: row.city,
        state: row.state,
        country: row.country,
        zipCode: row.zip_code,
        latitude: row.latitude,
        longitude: row.longitude,
        starRating: row.star_rating,
        totalRooms: row.total_rooms,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        cancellationPolicy: row.cancellation_policy,
        customPolicies: row.custom_policies ? (typeof row.custom_policies === 'string' ? JSON.parse(row.custom_policies) : row.custom_policies) : [],
        averageRating: row.average_rating,
        totalReviews: row.total_reviews,
        images: images.map(img => img.image_url),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }));
    
    return hotelsWithImages;
  }

  /**
   * Count hotels managed by a user
   */
  async countByUserManaged(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT h.id) as count
      FROM ${this.tableName} h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
      LEFT JOIN agents a ON h.agent_id = a.id
      WHERE ca.user_id = ? OR h.agent_id = ? OR a.user_id = ?
    `;
    const results = await this.query<any>(query, [userId, userId, userId, userId]);
    return results[0]?.count || 0;
  }

  /**
   * Check if a user manages a specific hotel
   */
  async isUserManagingHotel(userId: string, hotelId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${this.tableName} h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
      LEFT JOIN agents a ON h.agent_id = a.id
      WHERE (ca.user_id = ? OR h.agent_id = ? OR a.user_id = ?) AND h.id = ?
    `;
    const results = await this.query<any>(query, [userId, userId, userId, userId, hotelId]);
    return (results[0]?.count || 0) > 0;
  }

  /**
   * Search hotels with advanced filters
   */
  async searchWithFilters(filters: HotelFilterParams): Promise<any[]> {
    const { query, params } = await this.filterService.buildFilteredQuery(filters);
    const results = await this.query<any>(query, params);

    // Fetch images and rooms for each hotel
    const hotelsWithDetails = await Promise.all(results.map(async (row) => {
      // Fetch images
      const imagesQuery = `SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`;
      const images = await this.query<any>(imagesQuery, [row.id]);

      // Fetch rooms
      const roomsQuery = `SELECT id, name, base_price, currency, capacity FROM room_types WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT 5`;
      const rooms = await this.query<any>(roomsQuery, [row.id]);

      // Fetch filter details
      const facilities = await this.filterService.getHotelFacilities(row.id);
      const roomFacilities = await this.filterService.getHotelRoomFacilities(row.id);
      const landmarks = await this.filterService.getHotelLandmarks(row.id);
      const surroundings = await this.filterService.getHotelSurroundings(row.id);

      return {
        id: row.id,
        companyId: row.company_id,
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        status: row.status,
        address: row.address,
        city: row.city,
        state: row.state,
        country: row.country,
        zipCode: row.zip_code,
        latitude: row.latitude,
        longitude: row.longitude,
        starRating: row.star_rating,
        totalRooms: row.total_rooms,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        cancellationPolicy: row.cancellation_policy,
        averageRating: parseFloat(row.average_rating || 0),
        totalReviews: row.total_reviews,
        minPrice: row.min_price ? parseFloat(row.min_price) : null,
        images: images.map((img: any) => ({ id: img.id, url: img.url, displayOrder: img.display_order })),
        rooms: rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          basePrice: parseFloat(room.base_price),
          currency: room.currency,
          capacity: room.capacity,
        })),
        facilities,
        roomFacilities,
        landmarks,
        surroundings,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }));

    return hotelsWithDetails;
  }

  /**
   * Count search results with filters
   */
  async countSearchWithFilters(filters: HotelFilterParams): Promise<number> {
    const { query, params } = await this.filterService.buildCountQuery(filters);
    const results = await this.query<any>(query, params);
    return results[0]?.count || 0;
  }

  /**
   * Search hotels with filters
   */
  async search(filters: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    city?: string;
    country?: string;
    minRating?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const {
      location,
      checkIn,
      checkOut,
      guests = 1,
      city,
      country,
      minRating,
      maxPrice,
      limit = 20,
      offset = 0,
    } = filters;

    let query = `
      SELECT DISTINCT
        h.*,
        (SELECT MIN(rt.base_price) FROM room_types rt WHERE rt.hotel_id = h.id AND rt.status = 'ACTIVE') as min_price
      FROM ${this.tableName} h
      WHERE h.status = 'ACTIVE'
    `;
    const params: any[] = [];

    // Location filter (searches city, country, or address)
    if (location) {
      query += ` AND (h.city LIKE ? OR h.country LIKE ? OR h.address LIKE ?)`;
      const locationPattern = `%${location}%`;
      params.push(locationPattern, locationPattern, locationPattern);
    }

    // City filter
    if (city) {
      query += ` AND h.city = ?`;
      params.push(city);
    }

    // Country filter
    if (country) {
      query += ` AND h.country = ?`;
      params.push(country);
    }

    // Rating filter
    if (minRating) {
      query += ` AND h.star_rating >= ?`;
      params.push(minRating);
    }

    // Guest capacity filter (check if hotel has rooms that can accommodate guests)
    if (guests) {
      query += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND rt.capacity >= ?
        )
      `;
      params.push(guests);
    }

    // Price filter
    if (maxPrice) {
      query += ` AND EXISTS (
        SELECT 1 FROM room_types rt
        WHERE rt.hotel_id = h.id
          AND rt.status = 'ACTIVE'
          AND rt.base_price <= ?
      )`;
      params.push(maxPrice);
    }

    query += ` ORDER BY h.average_rating DESC, h.name ASC LIMIT ? OFFSET ?`;
    params.push(limit.toString(), offset.toString());

    const results = await this.query<any>(query, params);

    // Fetch images and rooms for each hotel
    const hotelsWithDetails = await Promise.all(results.map(async (row) => {
      // Fetch images
      const imagesQuery = `SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`;
      const images = await this.query<any>(imagesQuery, [row.id]);

      // Fetch rooms
      const roomsQuery = `SELECT id, name, base_price, currency, capacity FROM room_types WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT 5`;
      const rooms = await this.query<any>(roomsQuery, [row.id]);

      return {
        id: row.id,
        companyId: row.company_id,
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        status: row.status,
        address: row.address,
        city: row.city,
        state: row.state,
        country: row.country,
        zipCode: row.zip_code,
        latitude: row.latitude,
        longitude: row.longitude,
        starRating: row.star_rating,
        totalRooms: row.total_rooms,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        cancellationPolicy: row.cancellation_policy,
        averageRating: parseFloat(row.average_rating || 0),
        totalReviews: row.total_reviews,
        minPrice: row.min_price ? parseFloat(row.min_price) : null,
        images: images.map((img: any) => ({ id: img.id, url: img.url, displayOrder: img.display_order })),
        rooms: rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          basePrice: parseFloat(room.base_price),
          currency: room.currency,
          capacity: room.capacity,
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }));

    return hotelsWithDetails;
  }

  /**
   * Count search results
   */
  async countSearch(filters: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    city?: string;
    country?: string;
    minRating?: number;
    maxPrice?: number;
  }): Promise<number> {
    const {
      location,
      checkIn,
      checkOut,
      guests = 1,
      city,
      country,
      minRating,
      maxPrice,
    } = filters;

    let query = `
      SELECT COUNT(DISTINCT h.id) as count
      FROM ${this.tableName} h
      WHERE h.status = 'ACTIVE'
    `;
    const params: any[] = [];

    if (location) {
      query += ` AND (h.city LIKE ? OR h.country LIKE ? OR h.address LIKE ?)`;
      const locationPattern = `%${location}%`;
      params.push(locationPattern, locationPattern, locationPattern);
    }

    if (city) {
      query += ` AND h.city = ?`;
      params.push(city);
    }

    if (country) {
      query += ` AND h.country = ?`;
      params.push(country);
    }

    if (minRating) {
      query += ` AND h.star_rating >= ?`;
      params.push(minRating);
    }

    if (guests) {
      query += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND rt.capacity >= ?
        )
      `;
      params.push(guests);
    }

    if (maxPrice) {
      query += ` AND EXISTS (
        SELECT 1 FROM room_types rt
        WHERE rt.hotel_id = h.id
          AND rt.status = 'ACTIVE'
          AND rt.base_price <= ?
      )`;
      params.push(maxPrice);
    }

    const results = await this.query<any>(query, params);
    return results[0]?.count || 0;
  }

  /**
   * Map database row to Hotel model
   */
  private mapRowToHotel(row: HotelRow): Hotel {
    const hotel = Hotel.create({
      id: row.id,
      companyId: row.company_id,
      agentId: row.agent_id,
      name: row.name,
      description: row.description,
      location: {
        address: row.address,
        city: row.city,
        state: row.state,
        country: row.country,
        zipCode: row.zip_code,
        latitude: row.latitude,
        longitude: row.longitude,
      },
    });

    // Add additional fields
    hotel.starRating = row.star_rating;
    hotel.totalRooms = row.total_rooms;
    hotel.checkInTime = row.check_in_time;
    hotel.checkOutTime = row.check_out_time;
    hotel.cancellationPolicy = row.cancellation_policy;
    // Handle both string and object types for custom_policies (MySQL JSON column returns object)
    hotel.customPolicies = typeof row.custom_policies === 'string' 
      ? JSON.parse(row.custom_policies) 
      : (row.custom_policies || []);
    hotel.averageRating = row.average_rating;
    hotel.totalReviews = row.total_reviews;
    hotel.createdAt = row.created_at;
    hotel.updatedAt = row.updated_at;

    return hotel;
  }

  /**
   * Create a new hotel (raw SQL)
   */
  async createHotel(data: any): Promise<boolean> {
    const query = `
      INSERT INTO ${this.tableName} (
        id, company_id, agent_id, name, description, status,
        address, city, state, country, zip_code, latitude, longitude,
        star_rating, total_rooms, check_in_time, check_out_time,
        cancellation_policy, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.id,
      data.company_id,
      data.agent_id,
      data.name,
      data.description,
      data.status,
      data.address,
      data.city,
      data.state,
      data.country,
      data.zip_code,
      data.latitude,
      data.longitude,
      data.star_rating,
      data.total_rooms,
      data.check_in_time,
      data.check_out_time,
      data.cancellation_policy,
      data.created_at,
      data.updated_at,
    ];

    const [result] = await this.pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  /**
   * Update hotel (raw SQL)
   */
  async updateHotel(id: string, data: any): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    params.push(id);
    const query = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await this.pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }
}
