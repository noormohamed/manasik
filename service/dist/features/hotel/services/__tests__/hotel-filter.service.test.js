"use strict";
/**
 * Unit tests for HotelFilterService
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
const hotel_filter_service_1 = require("../hotel-filter.service");
const connection_1 = require("../../../../database/connection");
// Mock the database connection
jest.mock('../../../../database/connection');
describe('HotelFilterService', () => {
    let filterService;
    let mockPool;
    beforeEach(() => {
        // Create mock pool with query and execute methods
        mockPool = {
            query: jest.fn(),
            execute: jest.fn(),
        };
        connection_1.getPool.mockReturnValue(mockPool);
        filterService = new hotel_filter_service_1.HotelFilterService();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('buildFilteredQuery', () => {
        it('should build basic query without filters', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {};
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(query).toContain('SELECT DISTINCT h.*');
            expect(query).toContain('FROM hotels h');
            expect(query).toContain("WHERE h.status = 'ACTIVE'");
            expect(params).toEqual([20, 0]); // Default limit and offset
        }));
        it('should add facility filter to query', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                facilities: ['WiFi', 'Parking'],
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(query).toContain('hotel_facilities hf');
            expect(query).toContain('COUNT(DISTINCT hf.facility_name)');
            expect(params).toContain(2); // Number of facilities
            expect(params).toContain('WiFi');
            expect(params).toContain('Parking');
        }));
        it('should add room facility filter to query', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                roomFacilities: ['Air Conditioning', 'TV'],
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(query).toContain('room_types rt');
            expect(query).toContain('room_facilities rf');
            expect(params).toContain(2); // Number of room facilities
            expect(params).toContain('Air Conditioning');
            expect(params).toContain('TV');
        }));
        it('should add proximity filter to query', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                proximityLandmark: 'Airport',
                proximityDistance: 10,
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(query).toContain('hotel_landmarks hl');
            expect(query).toContain('hl.landmark_name = ?');
            expect(query).toContain('hl.distance_km <= ?');
            expect(params).toContain('Airport');
            expect(params).toContain(10);
        }));
        it('should add surroundings filter to query', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                surroundings: ['restaurants', 'transport'],
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(query).toContain('hotel_surroundings hs');
            expect(query).toContain('hs.restaurants_nearby = TRUE');
            expect(query).toContain('hs.public_transport = TRUE');
        }));
        it('should add airport distance filter to query', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                airportMaxDistance: 20,
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(query).toContain('hotel_surroundings hs');
            expect(query).toContain('hs.closest_airport_km <= ?');
            expect(params).toContain(20);
        }));
        it('should combine multiple filters with AND logic', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                facilities: ['WiFi'],
                roomFacilities: ['TV'],
                proximityLandmark: 'Airport',
                proximityDistance: 15,
                surroundings: ['restaurants'],
                airportMaxDistance: 25,
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            // Check all filter types are present
            expect(query).toContain('hotel_facilities hf');
            expect(query).toContain('room_facilities rf');
            expect(query).toContain('hotel_landmarks hl');
            expect(query).toContain('hotel_surroundings hs');
            // Verify parameters include all filter values
            expect(params).toContain('WiFi');
            expect(params).toContain('TV');
            expect(params).toContain('Airport');
            expect(params).toContain(15);
            expect(params).toContain(25);
        }));
        it('should respect limit and offset parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                limit: 10,
                offset: 20,
            };
            const { query, params } = yield filterService.buildFilteredQuery(filters);
            expect(params[params.length - 2]).toBe(10); // limit
            expect(params[params.length - 1]).toBe(20); // offset
        }));
    });
    describe('buildCountQuery', () => {
        it('should build count query without filters', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {};
            const { query, params } = yield filterService.buildCountQuery(filters);
            expect(query).toContain('SELECT COUNT(DISTINCT h.id) as count');
            expect(query).toContain('FROM hotels h');
            expect(query).toContain("WHERE h.status = 'ACTIVE'");
            expect(params).toEqual([]);
        }));
        it('should add filters to count query', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                facilities: ['WiFi', 'Gym'],
            };
            const { query, params } = yield filterService.buildCountQuery(filters);
            expect(query).toContain('hotel_facilities hf');
            expect(params).toContain(2);
            expect(params).toContain('WiFi');
            expect(params).toContain('Gym');
        }));
    });
    describe('getHotelFacilities', () => {
        it('should return list of facilities for a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFacilities = [
                { facility_name: 'WiFi' },
                { facility_name: 'Parking' },
                { facility_name: 'Gym' },
            ];
            mockPool.query.mockResolvedValue([mockFacilities]);
            const result = yield filterService.getHotelFacilities('hotel-123');
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT facility_name FROM hotel_facilities'), ['hotel-123']);
            expect(result).toEqual(['WiFi', 'Parking', 'Gym']);
        }));
        it('should return empty array if hotel has no facilities', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([[]]);
            const result = yield filterService.getHotelFacilities('hotel-456');
            expect(result).toEqual([]);
        }));
    });
    describe('getHotelRoomFacilities', () => {
        it('should return list of room facilities for a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFacilities = [
                { facility_name: 'Air Conditioning' },
                { facility_name: 'TV' },
            ];
            mockPool.query.mockResolvedValue([mockFacilities]);
            const result = yield filterService.getHotelRoomFacilities('hotel-123');
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('FROM room_facilities rf'), ['hotel-123']);
            expect(result).toEqual(['Air Conditioning', 'TV']);
        }));
    });
    describe('getHotelLandmarks', () => {
        it('should return list of landmarks for a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockLandmarks = [
                { landmark_name: 'Airport', distance_km: 15.5, landmark_type: 'transportation' },
                { landmark_name: 'Beach', distance_km: 2.0, landmark_type: 'attraction' },
            ];
            mockPool.query.mockResolvedValue([mockLandmarks]);
            const result = yield filterService.getHotelLandmarks('hotel-123');
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('FROM hotel_landmarks'), ['hotel-123']);
            expect(result).toEqual(mockLandmarks);
        }));
    });
    describe('getHotelSurroundings', () => {
        it('should return surroundings data for a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSurroundings = {
                restaurants_nearby: true,
                cafes_nearby: true,
                top_attractions: false,
                natural_beauty: true,
                public_transport: true,
                closest_airport_km: 12.5,
            };
            mockPool.query.mockResolvedValue([[mockSurroundings]]);
            const result = yield filterService.getHotelSurroundings('hotel-123');
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('FROM hotel_surroundings'), ['hotel-123']);
            expect(result).toEqual(mockSurroundings);
        }));
        it('should return null if hotel has no surroundings data', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([[]]);
            const result = yield filterService.getHotelSurroundings('hotel-456');
            expect(result).toBeNull();
        }));
    });
    describe('addHotelFacility', () => {
        it('should add a facility to a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = yield filterService.addHotelFacility('hotel-123', 'WiFi');
            expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO hotel_facilities'), ['hotel-123', 'WiFi']);
            expect(result).toBe(true);
        }));
        it('should return false if facility was not added', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 0 }]);
            const result = yield filterService.addHotelFacility('hotel-123', 'WiFi');
            expect(result).toBe(false);
        }));
    });
    describe('addRoomFacility', () => {
        it('should add a facility to a room', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = yield filterService.addRoomFacility('room-123', 'TV');
            expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO room_facilities'), ['room-123', 'TV']);
            expect(result).toBe(true);
        }));
    });
    describe('addHotelLandmark', () => {
        it('should add a landmark to a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = yield filterService.addHotelLandmark('hotel-123', 'Airport', 15.5, 'transportation');
            expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO hotel_landmarks'), ['hotel-123', 'Airport', 15.5, 'transportation']);
            expect(result).toBe(true);
        }));
        it('should add landmark without type', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = yield filterService.addHotelLandmark('hotel-123', 'Beach', 5.0);
            expect(mockPool.execute).toHaveBeenCalledWith(expect.any(String), ['hotel-123', 'Beach', 5.0, null]);
            expect(result).toBe(true);
        }));
    });
    describe('updateHotelSurroundings', () => {
        it('should update surroundings data for a hotel', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const surroundings = {
                restaurantsNearby: true,
                cafesNearby: false,
                topAttractions: true,
                naturalBeauty: false,
                publicTransport: true,
                closestAirportKm: 20.5,
            };
            const result = yield filterService.updateHotelSurroundings('hotel-123', surroundings);
            expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO hotel_surroundings'), ['hotel-123', true, false, true, false, true, 20.5]);
            expect(result).toBe(true);
        }));
        it('should handle missing surroundings fields with defaults', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const surroundings = {
                restaurantsNearby: true,
            };
            const result = yield filterService.updateHotelSurroundings('hotel-123', surroundings);
            expect(mockPool.execute).toHaveBeenCalledWith(expect.any(String), ['hotel-123', true, false, false, false, false, null]);
            expect(result).toBe(true);
        }));
    });
});
