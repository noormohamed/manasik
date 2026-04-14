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
exports.RoomTypeRepository = void 0;
const repository_1 = require("../../../database/repository");
const room_type_1 = require("../models/room-type");
class RoomTypeRepository extends repository_1.BaseRepository {
    constructor() {
        super('room_types');
    }
    /**
     * Find room types by hotel
     */
    findByHotel(hotelId_1) {
        return __awaiter(this, arguments, void 0, function* (hotelId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [hotelId, limit, offset]);
            return results.map(row => this.mapRowToRoomType(row));
        });
    }
    /**
     * Find active room types by hotel
     */
    findActiveByHotel(hotelId_1) {
        return __awaiter(this, arguments, void 0, function* (hotelId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [hotelId, limit, offset]);
            return results.map(row => this.mapRowToRoomType(row));
        });
    }
    /**
     * Find available room types by hotel
     */
    findAvailableByHotel(hotelId_1) {
        return __awaiter(this, arguments, void 0, function* (hotelId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE' AND available_rooms > 0 LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [hotelId, limit, offset]);
            return results.map(row => this.mapRowToRoomType(row));
        });
    }
    /**
     * Find room types by capacity
     */
    findByCapacity(hotelId_1, capacity_1) {
        return __awaiter(this, arguments, void 0, function* (hotelId, capacity, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND capacity >= ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [hotelId, capacity, limit, offset]);
            return results.map(row => this.mapRowToRoomType(row));
        });
    }
    /**
     * Find room types by price range
     */
    findByPriceRange(hotelId_1, minPrice_1, maxPrice_1) {
        return __awaiter(this, arguments, void 0, function* (hotelId, minPrice, maxPrice, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE hotel_id = ? AND base_price BETWEEN ? AND ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [hotelId, minPrice, maxPrice, limit, offset]);
            return results.map(row => this.mapRowToRoomType(row));
        });
    }
    /**
     * Count room types by hotel
     */
    countByHotel(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('hotel_id = ?', [hotelId]);
        });
    }
    /**
     * Count available rooms by hotel
     */
    countAvailableByHotel(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT SUM(available_rooms) as total FROM ${this.tableName} WHERE hotel_id = ? AND status = 'ACTIVE'`;
            const result = yield this.queryOne(query, [hotelId]);
            return (result === null || result === void 0 ? void 0 : result.total) || 0;
        });
    }
    /**
     * Get room type with amenities
     */
    getWithAmenities(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomType = yield this.findById(roomTypeId);
            if (!roomType)
                return null;
            const amenitiesQuery = `SELECT amenity_name, is_available FROM room_amenities WHERE room_type_id = ?`;
            const amenities = yield this.query(amenitiesQuery, [roomTypeId]);
            const imagesQuery = `SELECT image_url FROM room_images WHERE room_type_id = ? ORDER BY display_order`;
            const images = yield this.query(imagesQuery, [roomTypeId]);
            return Object.assign(Object.assign({}, roomType), { amenities: amenities.reduce((acc, a) => (Object.assign(Object.assign({}, acc), { [a.amenity_name]: a.is_available })), {}), images: images.map(i => i.image_url) });
        });
    }
    /**
     * Update available rooms
     */
    updateAvailableRooms(roomTypeId, available) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE ${this.tableName} SET available_rooms = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            const [result] = yield this.pool.execute(query, [available, roomTypeId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Decrease available rooms
     */
    decreaseAvailableRooms(roomTypeId, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE ${this.tableName} SET available_rooms = available_rooms - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND available_rooms >= ?`;
            const [result] = yield this.pool.execute(query, [count, roomTypeId, count]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Increase available rooms
     */
    increaseAvailableRooms(roomTypeId, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE ${this.tableName} SET available_rooms = LEAST(available_rooms + ?, total_rooms), updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            const [result] = yield this.pool.execute(query, [count, roomTypeId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Map database row to RoomType model
     */
    mapRowToRoomType(row) {
        return room_type_1.RoomType.create({
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
exports.RoomTypeRepository = RoomTypeRepository;
