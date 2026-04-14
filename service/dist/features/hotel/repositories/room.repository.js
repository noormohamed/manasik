"use strict";
/**
 * Room Type Repository
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepository = void 0;
const repository_1 = require("../../../database/repository");
class RoomRepository extends repository_1.BaseRepository {
    constructor() {
        super('room_types');
    }
    /**
     * Find room type by ID with images
     */
    findById(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const results = yield this.query(query, [roomId]);
            if (results.length === 0) {
                return null;
            }
            const row = results[0];
            // Fetch images
            const imagesQuery = `SELECT image_url FROM room_images WHERE room_type_id = ? ORDER BY display_order`;
            const images = yield this.query(imagesQuery, [row.id]);
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
        });
    }
    /**
     * Find room types by hotel ID
     */
    findByHotelId(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE' ORDER BY base_price ASC`;
            const results = yield this.query(query, [hotelId]);
            // Fetch images for each room type
            const roomsWithImages = yield Promise.all(results.map((row) => __awaiter(this, void 0, void 0, function* () {
                const imagesQuery = `SELECT image_url FROM room_images WHERE room_type_id = ? ORDER BY display_order`;
                const images = yield this.query(imagesQuery, [row.id]);
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
            })));
            return roomsWithImages;
        });
    }
    /**
     * Find available room types by hotel ID
     */
    findAvailableByHotelId(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM ${this.tableName} 
      WHERE hotel_id = ? 
        AND status = 'ACTIVE' 
        AND available_rooms > 0 
      ORDER BY base_price ASC
    `;
            const results = yield this.query(query, [hotelId]);
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
        });
    }
    /**
     * Count room types by hotel ID
     */
    countByHotelId(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('hotel_id = ? AND status = "ACTIVE"', [hotelId]);
        });
    }
    /**
     * Get facilities for a room type
     */
    getRoomFacilities(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT DISTINCT facility_name FROM room_facilities WHERE room_type_id = ? ORDER BY facility_name`;
            const results = yield this.query(query, [roomTypeId]);
            return results.map(r => r.facility_name);
        });
    }
}
exports.RoomRepository = RoomRepository;
