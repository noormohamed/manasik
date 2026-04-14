/**
 * Room Type Repository
 */

import { BaseRepository } from '../../../database/repository';
import { RowDataPacket } from 'mysql2/promise';

export interface RoomTypeRow extends RowDataPacket {
  id: string;
  hotel_id: string;
  name: string;
  description: string;
  capacity: number;
  total_rooms: number;
  available_rooms: number;
  base_price: number;
  currency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export class RoomRepository extends BaseRepository<any> {
  constructor() {
    super('room_types');
  }

  /**
   * Find room type by ID with images
   */
  async findById(roomId: string): Promise<any | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await this.query<RoomTypeRow>(query, [roomId]);
    
    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    
    // Fetch images
    const imagesQuery = `SELECT image_url FROM room_images WHERE room_type_id = ? ORDER BY display_order`;
    const images = await this.query<any>(imagesQuery, [row.id]);
    
    return {
      id: row.id,
      hotelId: row.hotel_id,
      name: row.name,
      description: row.description,
      capacity: row.capacity,
      totalRooms: row.total_rooms,
      availableRooms: row.available_rooms,
      basePrice: parseFloat(row.base_price.toString()),
      currency: row.currency,
      status: row.status,
      images: images.map(img => img.image_url),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Find room types by hotel ID
   */
  async findByHotelId(hotelId: string): Promise<any[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE' ORDER BY base_price ASC`;
    const results = await this.query<RoomTypeRow>(query, [hotelId]);
    
    // Fetch images for each room type
    const roomsWithImages = await Promise.all(results.map(async (row) => {
      const imagesQuery = `SELECT image_url FROM room_images WHERE room_type_id = ? ORDER BY display_order`;
      const images = await this.query<any>(imagesQuery, [row.id]);
      
      return {
        id: row.id,
        hotelId: row.hotel_id,
        name: row.name,
        description: row.description,
        capacity: row.capacity,
        totalRooms: row.total_rooms,
        availableRooms: row.available_rooms,
        basePrice: parseFloat(row.base_price.toString()),
        currency: row.currency,
        status: row.status,
        images: images.map(img => img.image_url),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }));
    
    return roomsWithImages;
  }

  /**
   * Find available room types by hotel ID
   */
  async findAvailableByHotelId(hotelId: string): Promise<any[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE hotel_id = ? 
        AND status = 'ACTIVE' 
        AND available_rooms > 0 
      ORDER BY base_price ASC
    `;
    const results = await this.query<RoomTypeRow>(query, [hotelId]);
    
    return results.map(row => ({
      id: row.id,
      hotelId: row.hotel_id,
      name: row.name,
      description: row.description,
      capacity: row.capacity,
      totalRooms: row.total_rooms,
      availableRooms: row.available_rooms,
      basePrice: parseFloat(row.base_price.toString()),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Count room types by hotel ID
   */
  async countByHotelId(hotelId: string): Promise<number> {
    return this.count('hotel_id = ? AND status = "ACTIVE"', [hotelId]);
  }

  /**
   * Get facilities for a room type
   */
  async getRoomFacilities(roomTypeId: string): Promise<string[]> {
    const query = `SELECT DISTINCT facility_name FROM room_facilities WHERE room_type_id = ? ORDER BY facility_name`;
    const results = await this.query<any>(query, [roomTypeId]);
    return results.map(r => r.facility_name);
  }
}
