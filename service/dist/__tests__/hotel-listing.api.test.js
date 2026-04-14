"use strict";
/**
 * Hotel Listing API Tests
 * Tests for fetching and creating hotel listings
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const connection_1 = require("../database/connection");
const auth_service_1 = require("../services/auth.service");
const user_repository_1 = require("../database/repositories/user.repository");
const hotel_repository_1 = require("../features/hotel/repositories/hotel.repository");
const user_1 = require("../models/user");
const uuid_1 = require("uuid");
const authService = new auth_service_1.AuthService();
describe('Hotel Listing API', () => {
    let testUser;
    let authToken;
    let testHotelId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, connection_1.initializeDatabase)();
        // Create test user
        const userRepository = new user_repository_1.UserRepository();
        const userId = (0, uuid_1.v4)();
        testUser = new user_1.User(userId);
        testUser.email = `test-${Date.now()}@example.com`;
        testUser.first_name = 'Test';
        testUser.last_name = 'User';
        testUser.password_hash = yield authService.hashPassword('password123');
        testUser.role = 'CUSTOMER';
        testUser.is_active = true;
        testUser.created_at = new Date();
        testUser.updated_at = new Date();
        yield userRepository.create(testUser);
        // Generate auth token
        const tokens = authService.generateTokens(testUser);
        authToken = tokens.accessToken;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: delete test hotel if created
        if (testHotelId) {
            const hotelRepository = new hotel_repository_1.HotelRepository();
            yield hotelRepository.delete(testHotelId);
        }
        // Cleanup: delete test user
        if (testUser) {
            const userRepository = new user_repository_1.UserRepository();
            yield userRepository.delete(testUser.id);
        }
        yield (0, connection_1.closeDatabase)();
        server_1.server.close();
    }));
    describe('GET /api/hotels/listings', () => {
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
        it('should return empty array for user with no hotels', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('hotels');
            expect(Array.isArray(response.body.hotels)).toBe(true);
            expect(response.body).toHaveProperty('pagination');
        }));
        it('should support pagination parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings?page=1&limit=10')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.pagination).toMatchObject({
                page: 1,
                limit: 10,
            });
        }));
        it('should support includeRooms parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings?includeRooms=true')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('hotels');
        }));
    });
    describe('POST /api/hotels', () => {
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .send({
                name: 'Test Hotel',
                address: '123 Test St',
                city: 'Test City',
                country: 'Test Country',
            })
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Test Hotel',
                // Missing address, city, country
            })
                .expect(400);
            expect(response.body.error).toContain('required fields');
        }));
        it('should create a hotel with minimum required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const hotelData = {
                name: 'Test Hotel',
                address: '123 Test Street',
                city: 'Test City',
                country: 'Test Country',
            };
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send(hotelData)
                .expect(201);
            expect(response.body).toHaveProperty('message', 'Hotel created successfully');
            expect(response.body).toHaveProperty('hotel');
            expect(response.body.hotel).toMatchObject({
                name: hotelData.name,
                address: hotelData.address,
                city: hotelData.city,
                country: hotelData.country,
            });
            expect(response.body.hotel).toHaveProperty('id');
            // Save hotel ID for cleanup
            testHotelId = response.body.hotel.id;
        }));
        it('should create a hotel with all fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const hotelData = {
                name: 'Complete Test Hotel',
                description: 'A fully featured test hotel',
                address: '456 Complete Ave',
                city: 'Complete City',
                state: 'Complete State',
                country: 'Complete Country',
                zipCode: '12345',
                starRating: 4,
                totalRooms: 50,
                checkInTime: '15:00',
                checkOutTime: '12:00',
                cancellationPolicy: 'Free cancellation up to 48 hours',
            };
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send(hotelData)
                .expect(201);
            expect(response.body.hotel).toMatchObject({
                name: hotelData.name,
                description: hotelData.description,
                address: hotelData.address,
                city: hotelData.city,
                state: hotelData.state,
                country: hotelData.country,
                zipCode: hotelData.zipCode,
                starRating: hotelData.starRating,
                totalRooms: hotelData.totalRooms,
            });
            // Cleanup this hotel
            const hotelRepository = new hotel_repository_1.HotelRepository();
            yield hotelRepository.delete(response.body.hotel.id);
        }));
        it('should set default values for optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const hotelData = {
                name: 'Default Values Hotel',
                address: '789 Default Rd',
                city: 'Default City',
                country: 'Default Country',
            };
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send(hotelData)
                .expect(201);
            expect(response.body.hotel).toMatchObject({
                starRating: 3, // Default
                totalRooms: 0, // Default
                status: 'ACTIVE', // Default
            });
            expect(response.body.hotel.checkInTime).toBeTruthy();
            expect(response.body.hotel.checkOutTime).toBeTruthy();
            // Cleanup
            const hotelRepository = new hotel_repository_1.HotelRepository();
            yield hotelRepository.delete(response.body.hotel.id);
        }));
        it('should assign hotel to the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            const hotelData = {
                name: 'User Assignment Test Hotel',
                address: '321 Assignment St',
                city: 'Assignment City',
                country: 'Assignment Country',
            };
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send(hotelData)
                .expect(201);
            expect(response.body.hotel.agentId).toBe(testUser.id);
            // Cleanup
            const hotelRepository = new hotel_repository_1.HotelRepository();
            yield hotelRepository.delete(response.body.hotel.id);
        }));
    });
    describe('GET /api/hotels/listings - After Creation', () => {
        let createdHotelId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a hotel for this test suite
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Listing Test Hotel',
                address: '999 Listing Ave',
                city: 'Listing City',
                country: 'Listing Country',
            });
            createdHotelId = response.body.hotel.id;
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Cleanup
            if (createdHotelId) {
                const hotelRepository = new hotel_repository_1.HotelRepository();
                yield hotelRepository.delete(createdHotelId);
            }
        }));
        it('should return the created hotel in listings', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.hotels.length).toBeGreaterThan(0);
            const createdHotel = response.body.hotels.find((h) => h.id === createdHotelId);
            expect(createdHotel).toBeDefined();
            expect(createdHotel.name).toBe('Listing Test Hotel');
        }));
        it('should return correct pagination total', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.pagination.total).toBeGreaterThan(0);
            expect(response.body.pagination.totalPages).toBeGreaterThan(0);
        }));
    });
    describe('Integration: Create and Fetch Flow', () => {
        it('should create hotel and immediately fetch it in listings', () => __awaiter(void 0, void 0, void 0, function* () {
            // Step 1: Create hotel
            const createResponse = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Integration Test Hotel',
                address: '111 Integration Blvd',
                city: 'Integration City',
                country: 'Integration Country',
                starRating: 5,
            })
                .expect(201);
            const hotelId = createResponse.body.hotel.id;
            // Step 2: Fetch listings
            const listResponse = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            // Step 3: Verify hotel is in listings
            const foundHotel = listResponse.body.hotels.find((h) => h.id === hotelId);
            expect(foundHotel).toBeDefined();
            expect(foundHotel.name).toBe('Integration Test Hotel');
            expect(foundHotel.starRating).toBe(5);
            // Cleanup
            const hotelRepository = new hotel_repository_1.HotelRepository();
            yield hotelRepository.delete(hotelId);
        }));
    });
    describe('Error Handling', () => {
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Try to create hotel with invalid data that might cause DB error
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .post('/api/hotels')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'A'.repeat(300), // Potentially too long
                address: '123 Test St',
                city: 'Test City',
                country: 'Test Country',
            });
            // Should either succeed or return 500, but not crash
            expect([201, 500]).toContain(response.status);
        }));
        it('should handle missing authorization header', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
        it('should handle invalid authorization token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.app.callback())
                .get('/api/hotels/listings')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
});
