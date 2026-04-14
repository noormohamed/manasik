"use strict";
/**
 * Hotel Repository
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
exports.HotelRepository = void 0;
const repository_1 = require("../../../database/repository");
const hotel_1 = require("../models/hotel");
const hotel_filter_service_1 = require("../services/hotel-filter.service");
class HotelRepository extends repository_1.BaseRepository {
    constructor() {
        super('hotels');
        this.filterService = new hotel_filter_service_1.HotelFilterService();
    }
    /**
     * Find hotels by company
     */
    findByCompany(companyId_1) {
        return __awaiter(this, arguments, void 0, function* (companyId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [companyId, limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Find hotels by agent
     */
    findByAgent(agentId_1) {
        return __awaiter(this, arguments, void 0, function* (agentId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE agent_id = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [agentId, limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Find hotels by city
     */
    findByCity(city_1) {
        return __awaiter(this, arguments, void 0, function* (city, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE city = ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [city, limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Find hotels by country
     */
    findByCountry(country_1) {
        return __awaiter(this, arguments, void 0, function* (country, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE country = ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [country, limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Find active hotels
     */
    findActive() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Search hotels by name
     */
    searchByName(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE name LIKE ? AND status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [`%${name}%`, limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Find hotels by rating
     */
    findByMinRating(minRating_1) {
        return __awaiter(this, arguments, void 0, function* (minRating, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE average_rating >= ? AND status = 'ACTIVE' ORDER BY average_rating DESC LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [minRating, limit, offset]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Find top rated hotels
     */
    findTopRated() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY average_rating DESC LIMIT ?`;
            const results = yield this.query(query, [limit]);
            return results.map(row => this.mapRowToHotel(row));
        });
    }
    /**
     * Count hotels by company
     */
    countByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('company_id = ?', [companyId]);
        });
    }
    /**
     * Count hotels by city
     */
    countByCity(city) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('city = ? AND status = "ACTIVE"', [city]);
        });
    }
    /**
     * Get hotel with amenities
     */
    getWithAmenities(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel = yield this.findById(hotelId);
            if (!hotel)
                return null;
            const amenitiesQuery = `SELECT amenity_name, is_available FROM hotel_amenities WHERE hotel_id = ?`;
            const amenities = yield this.query(amenitiesQuery, [hotelId]);
            const imagesQuery = `SELECT image_url FROM hotel_images WHERE hotel_id = ? ORDER BY display_order`;
            const images = yield this.query(imagesQuery, [hotelId]);
            return Object.assign(Object.assign({}, hotel), { amenities: amenities.reduce((acc, a) => (Object.assign(Object.assign({}, acc), { [a.amenity_name]: a.is_available })), {}), images: images.map(i => i.image_url) });
        });
    }
    /**
     * Find hotels managed by a user (via company_admins OR as agent)
     */
    findByUserManaged(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 100, offset = 0) {
            const query = `
      SELECT 
        h.*,
        COALESCE(c.name, 'Personal') as company_name,
        COALESCE(ca.admin_role, 'OWNER') as admin_role
      FROM ${this.tableName} h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
      WHERE ca.user_id = ? OR h.agent_id = ?
      ORDER BY h.created_at DESC
      LIMIT ? OFFSET ?
    `;
            const results = yield this.query(query, [userId, userId, userId, limit.toString(), offset.toString()]);
            // Fetch images for each hotel
            const hotelsWithImages = yield Promise.all(results.map((row) => __awaiter(this, void 0, void 0, function* () {
                const imagesQuery = `SELECT image_url FROM hotel_images WHERE hotel_id = ? ORDER BY display_order`;
                const images = yield this.query(imagesQuery, [row.id]);
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
                    averageRating: row.average_rating,
                    totalReviews: row.total_reviews,
                    images: images.map(img => img.image_url),
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                };
            })));
            return hotelsWithImages;
        });
    }
    /**
     * Count hotels managed by a user
     */
    countByUserManaged(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = `
      SELECT COUNT(DISTINCT h.id) as count
      FROM ${this.tableName} h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
      WHERE ca.user_id = ? OR h.agent_id = ?
    `;
            const results = yield this.query(query, [userId, userId, userId]);
            return ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        });
    }
    /**
     * Check if a user manages a specific hotel
     */
    isUserManagingHotel(userId, hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = `
      SELECT COUNT(*) as count
      FROM ${this.tableName} h
      LEFT JOIN companies c ON h.company_id = c.id
      LEFT JOIN company_admins ca ON c.id = ca.company_id AND ca.user_id = ?
      WHERE (ca.user_id = ? OR h.agent_id = ?) AND h.id = ?
    `;
            const results = yield this.query(query, [userId, userId, userId, hotelId]);
            return (((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) || 0) > 0;
        });
    }
    /**
     * Search hotels with advanced filters
     */
    searchWithFilters(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, params } = yield this.filterService.buildFilteredQuery(filters);
            const results = yield this.query(query, params);
            // Fetch images and rooms for each hotel
            const hotelsWithDetails = yield Promise.all(results.map((row) => __awaiter(this, void 0, void 0, function* () {
                // Fetch images
                const imagesQuery = `SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`;
                const images = yield this.query(imagesQuery, [row.id]);
                // Fetch rooms
                const roomsQuery = `SELECT id, name, base_price, currency, capacity FROM room_types WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT 5`;
                const rooms = yield this.query(roomsQuery, [row.id]);
                // Fetch filter details
                const facilities = yield this.filterService.getHotelFacilities(row.id);
                const roomFacilities = yield this.filterService.getHotelRoomFacilities(row.id);
                const landmarks = yield this.filterService.getHotelLandmarks(row.id);
                const surroundings = yield this.filterService.getHotelSurroundings(row.id);
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
                    images: images.map((img) => ({ id: img.id, url: img.url, displayOrder: img.display_order })),
                    rooms: rooms.map((room) => ({
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
            })));
            return hotelsWithDetails;
        });
    }
    /**
     * Count search results with filters
     */
    countSearchWithFilters(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { query, params } = yield this.filterService.buildCountQuery(filters);
            const results = yield this.query(query, params);
            return ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        });
    }
    /**
     * Search hotels with filters
     */
    search(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { location, checkIn, checkOut, guests = 1, city, country, minRating, maxPrice, limit = 20, offset = 0, } = filters;
            let query = `
      SELECT DISTINCT
        h.*,
        (SELECT MIN(rt.base_price) FROM room_types rt WHERE rt.hotel_id = h.id AND rt.status = 'ACTIVE') as min_price
      FROM ${this.tableName} h
      WHERE h.status = 'ACTIVE'
    `;
            const params = [];
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
            const results = yield this.query(query, params);
            // Fetch images and rooms for each hotel
            const hotelsWithDetails = yield Promise.all(results.map((row) => __awaiter(this, void 0, void 0, function* () {
                // Fetch images
                const imagesQuery = `SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`;
                const images = yield this.query(imagesQuery, [row.id]);
                // Fetch rooms
                const roomsQuery = `SELECT id, name, base_price, currency, capacity FROM room_types WHERE hotel_id = ? AND status = 'ACTIVE' LIMIT 5`;
                const rooms = yield this.query(roomsQuery, [row.id]);
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
                    images: images.map((img) => ({ id: img.id, url: img.url, displayOrder: img.display_order })),
                    rooms: rooms.map((room) => ({
                        id: room.id,
                        name: room.name,
                        basePrice: parseFloat(room.base_price),
                        currency: room.currency,
                        capacity: room.capacity,
                    })),
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                };
            })));
            return hotelsWithDetails;
        });
    }
    /**
     * Count search results
     */
    countSearch(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { location, checkIn, checkOut, guests = 1, city, country, minRating, maxPrice, } = filters;
            let query = `
      SELECT COUNT(DISTINCT h.id) as count
      FROM ${this.tableName} h
      WHERE h.status = 'ACTIVE'
    `;
            const params = [];
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
            const results = yield this.query(query, params);
            return ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        });
    }
    /**
     * Map database row to Hotel model
     */
    mapRowToHotel(row) {
        return hotel_1.Hotel.create({
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
    }
    /**
     * Create a new hotel (raw SQL)
     */
    createHotel(data) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const [result] = yield this.pool.execute(query, params);
            return result.affectedRows > 0;
        });
    }
    /**
     * Update hotel (raw SQL)
     */
    updateHotel(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const params = [];
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
            const [result] = yield this.pool.execute(query, params);
            return result.affectedRows > 0;
        });
    }
}
exports.HotelRepository = HotelRepository;
