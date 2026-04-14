/**
 * Room Type Repository
 */

import { BaseRepository } from '../../../database/repository';
import { RoomType } from '../models/room-type';
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

export class RoomTypeRepository extends BaseRepository<RoomType> {
  constructor() {
    super('room_types');
  }

  /**
   * Find room types by hotel
   */
  async findByHotel(hotelId: string, limit: number = 10, offset: number = 0): Promise<RoomType[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? LIMIT ? OFFSET ?`;
    const results = await this.query<RoomTypeRow>(query, [hotelId, limit, offset]);
    
    return results.map(row => this.mapRowToRoomType(row));
  }

  /**
   * Find active room types by hotel
   */
  async findActiveByHotel(hotelId: string, limit: number = 10, offset: number = 0): Promise<RoomType[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<RoomTypeRow>(query, [hotelId, limit, offset]);
    
    return results.map(row => this.mapRowToRoomType(row));
  }

  /**
   * Find available room types by hotel
   */
  async findAvailableByHotel(hotelId: string, limit: number = 10, offset: number = 0): Promise<RoomType[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE' AND available_rooms > 0 LIMIT ? OFFSET ?`;
    const results = await this.query<RoomTypeRow>(query, [hotelId, limit, offset]);
    
    return results.map(row => this.mapRowToRoomType(row));
  }

  /**
   * Find room types by capacity
   */
  async findByCapacity(hotelId: string, capacity: number, limit: number = 10, offset: number = 0): Promise<RoomType[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND capacity >= ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<RoomTypeRow>(query, [hotelId, capacity, limit, offset]);
    
    return results.map(row => this.mapRowToRoomType(row));
  }

  /**
   * Find room types by price range
   */
  async findByPriceRange(hotelId: string, minPrice: number, maxPrice: number, limit: number = 10, offset: number = 0): Promise<RoomType[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND base_price BETWEEN ? AND ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<RoomTypeRow>(query, [hotelId, minPrice, maxPrice, limit, offset]);
    
    return results.map(row => this.mapRowToRoomType(row));
  }

  /**
   * Count room types by hotel
   */
  async countByHotel(hotelId: string): Promise<number> {
    return this.count('hotel_id = ?', [hotelId]);
  }

  /**
   * Count available rooms by hotel
   */
  async countAvailableByHotel(hotelId: string): Promise<number> {
    const query = `SELECT SUM(available_rooms) as total FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE'`;
    const result = await this.queryOne<{ total: number }>(query, [hotelId]);
    
    return result?.total || 0;
  }

  /**
   * Get room type with amenities
   */
  async getWithAmenities(roomTypeId: string): Promise<any> {
    const roomType = await this.findById(roomTypeId);
    if (!roomType) return null;

    const amenitiesQuery = `SELECT amenity_name, is_available FROM room_amenities WHERE room_type_id = ?`;
    const amenities = await this.query<any>(amenitiesQuery, [roomTypeId]);

    const imagesQuery = `SELECT image_url FROM room_images WHERE room_type_id = ? ORDER BY display_order`;
    const images = await this.query<any>(imagesQuery, [roomTypeId]);

    return {
      ...roomType,
      amenities: amenities.reduce((acc, a) => ({ ...acc, [a.amenity_name]: a.is_available }), {}),
      images: images.map(i => i.image_url),
    };
  }

  /**
   * Update available rooms
   */
  async updateAvailableRooms(roomTypeId: string, available: number): Promise<boolean> {
    const query = `UPDATE ${this.tableName} SET available_rooms = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await this.pool.execute(query, [available, roomTypeId]);
    
    return (result as any).affectedRows > 0;
  }

  /**
   * Decrease available rooms
   */
  async decreaseAvailableRooms(roomTypeId: string, count: number): Promise<boolean> {
    const query = `UPDATE ${this.tableName} SET available_rooms = available_rooms - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND available_rooms >= ?`;
    const [result] = await this.pool.execute(query, [count, roomTypeId, count]);
    
    return (result as any).affectedRows > 0;
  }

  /**
   * Increase available rooms
   */
  async increaseAvailableRooms(roomTypeId: string, count: number): Promise<boolean> {
    const query = `UPDATE ${this.tableName} SET available_rooms = LEAST(available_rooms + ?, total_rooms), updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await this.pool.execute(query, [count, roomTypeId]);
    
    return (result as any).affectedRows > 0;
  }

  /**
   * Map database row to RoomType model
   */
  private mapRowToRoomType(row: RoomTypeRow): RoomType {
    return RoomType.create({
      id: row.id,
      hotelId: row.hotel_id,
      name: row.name,
      description: row.description,
      capacity: row.capacity,
      totalRooms: row.total_rooms,
      basePrice: row.base_price,
      currency: row.currency,
    });
  }
}
