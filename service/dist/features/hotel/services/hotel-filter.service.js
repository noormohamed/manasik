"use strict";
/**
 * Hotel Filter Service
 * Handles filtering logic for facilities, room facilities, proximity, and surroundings
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
exports.HotelFilterService = void 0;
const connection_1 = require("../../../database/connection");
class HotelFilterService {
    constructor() {
        this.pool = (0, connection_1.getPool)();
    }
    /**
     * Build SQL query with all applied filters
     */
    buildFilteredQuery(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { facilities, roomFacilities, proximityLandmark, proximityDistance, surroundings, airportMaxDistance, limit = 20, offset = 0, } = filters;
            let query = `
      SELECT DISTINCT h.*,
        (SELECT MIN(rt.base_price) FROM room_types rt WHERE rt.hotel_id = h.id AND rt.status = 'ACTIVE') as min_price
      FROM hotels h
      WHERE h.status = 'ACTIVE'
    `;
            const params = [];
            // Facility filter
            if (facilities && facilities.length > 0) {
                query += `
        AND EXISTS (
          SELECT 1 FROM hotel_facilities hf
          WHERE hf.hotel_id = h.id
          GROUP BY hf.hotel_id
          HAVING COUNT(DISTINCT hf.facility_name) = ?
        )
        AND NOT EXISTS (
          SELECT 1 FROM (
            SELECT DISTINCT facility_name FROM hotel_facilities WHERE hotel_id = h.id
          ) AS hf_check
          WHERE hf_check.facility_name NOT IN (${facilities.map(() => '?').join(',')})
        )
      `;
                params.push(facilities.length);
                params.push(...facilities);
            }
            // Room facility filter
            if (roomFacilities && roomFacilities.length > 0) {
                query += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND EXISTS (
              SELECT 1 FROM room_facilities rf
              WHERE rf.room_type_id = rt.id
              GROUP BY rf.room_type_id
              HAVING COUNT(DISTINCT rf.facility_name) = ?
            )
            AND NOT EXISTS (
              SELECT 1 FROM (
                SELECT DISTINCT facility_name FROM room_facilities WHERE room_type_id = rt.id
              ) AS rf_check
              WHERE rf_check.facility_name NOT IN (${roomFacilities.map(() => '?').join(',')})
            )
        )
      `;
                params.push(roomFacilities.length);
                params.push(...roomFacilities);
            }
            // Proximity filter
            if (proximityLandmark && proximityDistance) {
                query += `
        AND EXISTS (
          SELECT 1 FROM hotel_landmarks hl
          WHERE hl.hotel_id = h.id
            AND hl.landmark_name = ?
            AND hl.distance_km <= ?
        )
      `;
                params.push(proximityLandmark, proximityDistance);
            }
            // Surroundings filter
            if (surroundings && surroundings.length > 0) {
                const surroundingConditions = surroundings.map(s => {
                    switch (s) {
                        case 'restaurants':
                            return 'hs.restaurants_nearby = TRUE';
                        case 'cafes':
                            return 'hs.cafes_nearby = TRUE';
                        case 'attractions':
                            return 'hs.top_attractions = TRUE';
                        case 'nature':
                            return 'hs.natural_beauty = TRUE';
                        case 'transport':
                            return 'hs.public_transport = TRUE';
                        default:
                            return '';
                    }
                }).filter(c => c);
                if (surroundingConditions.length > 0) {
                    query += `
          AND EXISTS (
            SELECT 1 FROM hotel_surroundings hs
            WHERE hs.hotel_id = h.id
              AND (${surroundingConditions.join(' AND ')})
          )
        `;
                }
            }
            // Airport distance filter
            if (airportMaxDistance) {
                query += `
        AND EXISTS (
          SELECT 1 FROM hotel_surroundings hs
          WHERE hs.hotel_id = h.id
            AND hs.closest_airport_km IS NOT NULL
            AND hs.closest_airport_km <= ?
        )
      `;
                params.push(airportMaxDistance);
            }
            query += ` ORDER BY h.average_rating DESC, h.name ASC LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            return { query, params };
        });
    }
    /**
     * Build count query for pagination
     */
    buildCountQuery(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { facilities, roomFacilities, proximityLandmark, proximityDistance, surroundings, airportMaxDistance, } = filters;
            let query = `
      SELECT COUNT(DISTINCT h.id) as count
      FROM hotels h
      WHERE h.status = 'ACTIVE'
    `;
            const params = [];
            // Facility filter
            if (facilities && facilities.length > 0) {
                query += `
        AND EXISTS (
          SELECT 1 FROM hotel_facilities hf
          WHERE hf.hotel_id = h.id
          GROUP BY hf.hotel_id
          HAVING COUNT(DISTINCT hf.facility_name) = ?
        )
        AND NOT EXISTS (
          SELECT 1 FROM (
            SELECT DISTINCT facility_name FROM hotel_facilities WHERE hotel_id = h.id
          ) AS hf_check
          WHERE hf_check.facility_name NOT IN (${facilities.map(() => '?').join(',')})
        )
      `;
                params.push(facilities.length);
                params.push(...facilities);
            }
            // Room facility filter
            if (roomFacilities && roomFacilities.length > 0) {
                query += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND EXISTS (
              SELECT 1 FROM room_facilities rf
              WHERE rf.room_type_id = rt.id
              GROUP BY rf.room_type_id
              HAVING COUNT(DISTINCT rf.facility_name) = ?
            )
            AND NOT EXISTS (
              SELECT 1 FROM (
                SELECT DISTINCT facility_name FROM room_facilities WHERE room_type_id = rt.id
              ) AS rf_check
              WHERE rf_check.facility_name NOT IN (${roomFacilities.map(() => '?').join(',')})
            )
        )
      `;
                params.push(roomFacilities.length);
                params.push(...roomFacilities);
            }
            // Proximity filter
            if (proximityLandmark && proximityDistance) {
                query += `
        AND EXISTS (
          SELECT 1 FROM hotel_landmarks hl
          WHERE hl.hotel_id = h.id
            AND hl.landmark_name = ?
            AND hl.distance_km <= ?
        )
      `;
                params.push(proximityLandmark, proximityDistance);
            }
            // Surroundings filter
            if (surroundings && surroundings.length > 0) {
                const surroundingConditions = surroundings.map(s => {
                    switch (s) {
                        case 'restaurants':
                            return 'hs.restaurants_nearby = TRUE';
                        case 'cafes':
                            return 'hs.cafes_nearby = TRUE';
                        case 'attractions':
                            return 'hs.top_attractions = TRUE';
                        case 'nature':
                            return 'hs.natural_beauty = TRUE';
                        case 'transport':
                            return 'hs.public_transport = TRUE';
                        default:
                            return '';
                    }
                }).filter(c => c);
                if (surroundingConditions.length > 0) {
                    query += `
          AND EXISTS (
            SELECT 1 FROM hotel_surroundings hs
            WHERE hs.hotel_id = h.id
              AND (${surroundingConditions.join(' AND ')})
          )
        `;
                }
            }
            // Airport distance filter
            if (airportMaxDistance) {
                query += `
        AND EXISTS (
          SELECT 1 FROM hotel_surroundings hs
          WHERE hs.hotel_id = h.id
            AND hs.closest_airport_km IS NOT NULL
            AND hs.closest_airport_km <= ?
        )
      `;
                params.push(airportMaxDistance);
            }
            return { query, params };
        });
    }
    /**
     * Get available facilities for a hotel
     */
    getHotelFacilities(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT DISTINCT facility_name FROM hotel_facilities WHERE hotel_id = ? ORDER BY facility_name`;
            const [results] = yield this.pool.query(query, [hotelId]);
            return results.map((r) => r.facility_name);
        });
    }
    /**
     * Get available room facilities for a hotel
     */
    getHotelRoomFacilities(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT DISTINCT rf.facility_name
      FROM room_facilities rf
      JOIN room_types rt ON rf.room_type_id = rt.id
      WHERE rt.hotel_id = ?
      ORDER BY rf.facility_name
    `;
            const [results] = yield this.pool.query(query, [hotelId]);
            return results.map((r) => r.facility_name);
        });
    }
    /**
     * Get landmarks for a hotel
     */
    getHotelLandmarks(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT landmark_name, distance_km, landmark_type
      FROM hotel_landmarks
      WHERE hotel_id = ?
      ORDER BY distance_km ASC
    `;
            const [results] = yield this.pool.query(query, [hotelId]);
            return results;
        });
    }
    /**
     * Get surroundings for a hotel
     */
    getHotelSurroundings(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT restaurants_nearby, cafes_nearby, top_attractions, natural_beauty, public_transport, closest_airport_km
      FROM hotel_surroundings
      WHERE hotel_id = ?
    `;
            const [results] = yield this.pool.query(query, [hotelId]);
            return results[0] || null;
        });
    }
    /**
     * Add facility to hotel
     */
    addHotelFacility(hotelId, facilityName) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      INSERT INTO hotel_facilities (hotel_id, facility_name)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE facility_name = facility_name
    `;
            const [result] = yield this.pool.execute(query, [hotelId, facilityName]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Add facility to room
     */
    addRoomFacility(roomTypeId, facilityName) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      INSERT INTO room_facilities (room_type_id, facility_name)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE facility_name = facility_name
    `;
            const [result] = yield this.pool.execute(query, [roomTypeId, facilityName]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Add landmark to hotel
     */
    addHotelLandmark(hotelId, landmarkName, distanceKm, landmarkType) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      INSERT INTO hotel_landmarks (hotel_id, landmark_name, distance_km, landmark_type)
      VALUES (?, ?, ?, ?)
    `;
            const [result] = yield this.pool.execute(query, [hotelId, landmarkName, distanceKm, landmarkType || null]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Update or create hotel surroundings
     */
    updateHotelSurroundings(hotelId, surroundings) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      INSERT INTO hotel_surroundings (
        hotel_id, restaurants_nearby, cafes_nearby, top_attractions, natural_beauty, public_transport, closest_airport_km
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        restaurants_nearby = VALUES(restaurants_nearby),
        cafes_nearby = VALUES(cafes_nearby),
        top_attractions = VALUES(top_attractions),
        natural_beauty = VALUES(natural_beauty),
        public_transport = VALUES(public_transport),
        closest_airport_km = VALUES(closest_airport_km)
    `;
            const [result] = yield this.pool.execute(query, [
                hotelId,
                surroundings.restaurantsNearby || false,
                surroundings.cafesNearby || false,
                surroundings.topAttractions || false,
                surroundings.naturalBeauty || false,
                surroundings.publicTransport || false,
                surroundings.closestAirportKm || null,
            ]);
            return result.affectedRows > 0;
        });
    }
}
exports.HotelFilterService = HotelFilterService;
