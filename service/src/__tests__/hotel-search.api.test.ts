/**
 * Hotel Search and Listings API Tests
 * 
 * This test suite covers:
 * - Hotel search with various filters
 * - User hotel listings (managed hotels)
 * - Hotel rooms endpoint
 * 
 * Use these tests as a reference for API request/response formats
 */

import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { createApiRouter } from '../routes/api.routes';
import { errorHandler } from '../middleware/error';
import { responseWrapper } from '../middleware/response';

// Mock the database connection
jest.mock('../database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getPool: jest.fn(),
}));

// Mock the HotelRepository
jest.mock('../features/hotel/repositories/hotel.repository', () => ({
  HotelRepository: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue([]),
    countSearch: jest.fn().mockResolvedValue(0),
    findById: jest.fn().mockImplementation((id: string) => {
      if (id === 'non-existent-id') return Promise.resolve(null);
      return Promise.resolve({ id, name: 'Test Hotel' });
    }),
    findByUserManaged: jest.fn().mockResolvedValue([]),
    countByUserManaged: jest.fn().mockResolvedValue(0),
    isUserManagingHotel: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock the RoomRepository
jest.mock('../features/hotel/repositories/room.repository', () => ({
  RoomRepository: jest.fn().mockImplementation(() => ({
    findByHotelId: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 'room-123', name: 'Test Room', hotelId: 'hotel-123' }),
    create: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock the auth service
jest.mock('../services/auth.service', () => {
  const mockAuthService = {
    extractToken: jest.fn((authHeader: string) => {
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
      return null;
    }),
    verifyAccessToken: jest.fn((token: string) => {
      if (token === 'valid-token' || token === 'mock-jwt-token') {
        return {
          userId: 'user-123',
          email: 'james.anderson@email.com',
          role: 'CUSTOMER',
        };
      }
      return null;
    }),
  };
  
  return {
    AuthService: jest.fn().mockImplementation(() => mockAuthService),
    authService: mockAuthService,
  };
});

describe('Hotel Search API', () => {
  let app: Koa;

  beforeAll(() => {
    app = new Koa();
    app.use(errorHandler);
    app.use(cors());
    app.use(bodyParser());
    app.use(responseWrapper);
    
    const apiRouter = createApiRouter();
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());
  });

  describe('GET /api/hotels - Search Hotels', () => {
    /**
     * Basic search - returns all active hotels
     * 
     * Request: GET /api/hotels
     * Response: {
     *   hotels: Hotel[],
     *   pagination: { page, limit, total, totalPages },
     *   filters: { ... }
     * }
     */
    it('should return all hotels without filters', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .expect(200);

      expect(response.body.data).toHaveProperty('hotels');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data).toHaveProperty('filters');
      expect(Array.isArray(response.body.data.hotels)).toBe(true);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    /**
     * Search by location (fuzzy search across city, country, address)
     * 
     * Request: GET /api/hotels?location=Makkah
     * Matches: city, country, or address containing "Makkah"
     */
    it('should search hotels by location', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ location: 'Makkah' })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters.location).toBe('Makkah');
    });

    /**
     * Filter by specific city
     * 
     * Request: GET /api/hotels?city=Dubai
     * Returns: Only hotels in Dubai
     */
    it('should filter hotels by city', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ city: 'Dubai' })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters.city).toBe('Dubai');
    });

    /**
     * Filter by country
     * 
     * Request: GET /api/hotels?country=Saudi Arabia
     * Returns: Only hotels in Saudi Arabia
     */
    it('should filter hotels by country', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ country: 'Saudi Arabia' })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters.country).toBe('Saudi Arabia');
    });

    /**
     * Filter by number of guests
     * 
     * Request: GET /api/hotels?guests=4&checkIn=2026-03-01&checkOut=2026-03-05
     * Returns: Hotels with rooms that can accommodate 4+ guests
     * Note: checkIn and checkOut are required when using guests filter
     */
    it('should filter hotels by guest capacity', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({
          guests: 4,
          checkIn: '2026-03-01',
          checkOut: '2026-03-05',
        })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters.guests).toBe(4);
    });

    /**
     * Filter by minimum rating
     * 
     * Request: GET /api/hotels?minRating=4
     * Returns: Hotels with average rating >= 4.0
     */
    it('should filter hotels by minimum rating', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ minRating: 4 })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters.minRating).toBe(4);
    });

    /**
     * Filter by maximum price
     * 
     * Request: GET /api/hotels?maxPrice=300
     * Returns: Hotels with rooms priced <= $300/night
     */
    it('should filter hotels by maximum price', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ maxPrice: 300 })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters.maxPrice).toBe(300);
    });

    /**
     * Combined filters - realistic search scenario
     * 
     * Request: GET /api/hotels?city=Makkah&guests=2&checkIn=2026-03-01&checkOut=2026-03-05&maxPrice=250&minRating=4
     * Returns: Hotels in Makkah with:
     *   - Rooms for 2+ guests
     *   - Price <= $250/night
     *   - Rating >= 4.0
     *   - Available for specified dates
     */
    it('should handle multiple filters combined', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({
          city: 'Makkah',
          guests: 2,
          checkIn: '2026-03-01',
          checkOut: '2026-03-05',
          maxPrice: 250,
          minRating: 4,
        })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      expect(response.body.data.filters).toMatchObject({
        city: 'Makkah',
        guests: 2,
        checkIn: '2026-03-01',
        checkOut: '2026-03-05',
        maxPrice: 250,
        minRating: 4,
      });
    });

    /**
     * Pagination
     * 
     * Request: GET /api/hotels?page=2&limit=10
     * Returns: Page 2 with 10 results per page
     */
    it('should handle pagination', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(response.body.data.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    /**
     * Hotel response format
     * Each hotel should include:
     * - Basic info: id, name, description, address, city, country
     * - Ratings: starRating, averageRating, totalReviews
     * - Pricing: minPrice (cheapest room available)
     * - Status: status, totalRooms
     * - Times: checkInTime, checkOutTime
     */
    it('should return hotels with correct format', async () => {
      const response = await request(app.callback())
        .get('/api/hotels')
        .query({ limit: 1 })
        .expect(200);

      if (response.body.data.hotels.length > 0) {
        const hotel = response.body.data.hotels[0];
        expect(hotel).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          city: expect.any(String),
          country: expect.any(String),
          status: expect.any(String),
          starRating: expect.any(Number),
          totalRooms: expect.any(Number),
          checkInTime: expect.any(String),
          checkOutTime: expect.any(String),
        });
      }
    });
  });

  describe('GET /api/hotels/listings - User Managed Hotels', () => {
    const authToken = 'valid-token';

    /**
     * Get user's managed hotels (requires authentication)
     * 
     * Request: GET /api/hotels/listings
     * Headers: Authorization: Bearer <token>
     * Response: {
     *   hotels: Hotel[] (with companyName, adminRole),
     *   pagination: { ... }
     * }
     */
    it('should return hotels managed by the authenticated user', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('hotels');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.hotels)).toBe(true);
    });

    /**
     * Include rooms in listings
     * 
     * Request: GET /api/hotels/listings?includeRooms=true
     * Response: Hotels with nested rooms array
     */
    it('should include rooms when requested', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ includeRooms: 'true' })
        .expect(200);

      expect(response.body.data.hotels).toBeDefined();
      // If user has hotels, they should have rooms property
      if (response.body.data.hotels.length > 0) {
        expect(response.body.data.hotels[0]).toHaveProperty('rooms');
      }
    });

    /**
     * Require authentication
     * 
     * Request: GET /api/hotels/listings (no auth header)
     * Response: 401 Unauthorized
     */
    it('should require authentication', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    /**
     * Managed hotel response format
     * Each hotel includes additional management info:
     * - companyName: Name of the company
     * - adminRole: User's role (OWNER, MANAGER, SUPPORT)
     */
    it('should return hotels with management info', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.hotels.length > 0) {
        const hotel = response.body.data.hotels[0];
        expect(hotel).toMatchObject({
          id: expect.any(String),
          companyId: expect.any(String),
          companyName: expect.any(String),
          adminRole: expect.stringMatching(/OWNER|MANAGER|SUPPORT/),
          name: expect.any(String),
        });
      }
    });
  });

  describe('GET /api/hotels/:id/rooms - Hotel Rooms', () => {
    const testHotelId = '023154fa-79c2-43e8-98f5-d64e76f84ce2'; // Coastal Hotel Makkah
    const authToken = 'valid-token';

    /**
     * Get rooms for a hotel (public endpoint)
     * 
     * Request: GET /api/hotels/:id/rooms
     * Response: {
     *   hotelId: string,
     *   hotelName: string,
     *   isManager: boolean,
     *   rooms: RoomType[],
     *   total: number
     * }
     */
    it('should return rooms for a hotel (public access)', async () => {
      const response = await request(app.callback())
        .get(`/api/hotels/${testHotelId}/rooms`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        hotelId: testHotelId,
        hotelName: expect.any(String),
        isManager: false, // No auth = not a manager
        rooms: expect.any(Array),
        total: expect.any(Number),
      });
    });

    /**
     * Manager flag for authenticated users
     * 
     * Request: GET /api/hotels/:id/rooms
     * Headers: Authorization: Bearer <token>
     * Response: isManager: true (if user manages this hotel)
     */
    it('should indicate if user manages the hotel', async () => {
      const response = await request(app.callback())
        .get(`/api/hotels/${testHotelId}/rooms`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('isManager');
      expect(typeof response.body.data.isManager).toBe('boolean');
    });

    /**
     * Room response format
     * Each room should include:
     * - id, hotelId, name, description
     * - capacity: Number of guests
     * - totalRooms, availableRooms
     * - basePrice, currency
     * - status: ACTIVE/INACTIVE
     */
    it('should return rooms with correct format', async () => {
      const response = await request(app.callback())
        .get(`/api/hotels/${testHotelId}/rooms`)
        .expect(200);

      if (response.body.data.rooms.length > 0) {
        const room = response.body.data.rooms[0];
        expect(room).toMatchObject({
          id: expect.any(String),
          hotelId: testHotelId,
          name: expect.any(String),
          capacity: expect.any(Number),
          totalRooms: expect.any(Number),
          availableRooms: expect.any(Number),
          basePrice: expect.any(Number),
          currency: expect.any(String),
          status: expect.any(String),
        });
      }
    });

    /**
     * Handle non-existent hotel
     * 
     * Request: GET /api/hotels/invalid-id/rooms
     * Response: 404 Hotel not found
     */
    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/non-existent-id/rooms')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Hotel not found');
    });
  });
});

/**
 * API SPECIFICATION SUMMARY
 * 
 * 1. SEARCH HOTELS
 *    GET /api/hotels
 *    Query Parameters:
 *      - location: string (fuzzy search)
 *      - city: string (exact match)
 *      - country: string (exact match)
 *      - checkIn: string (YYYY-MM-DD)
 *      - checkOut: string (YYYY-MM-DD)
 *      - guests: number
 *      - minRating: number (0-5)
 *      - maxPrice: number
 *      - page: number (default: 1)
 *      - limit: number (default: 20)
 *    Response: { hotels, pagination, filters }
 * 
 * 2. USER LISTINGS
 *    GET /api/hotels/listings
 *    Headers: Authorization: Bearer <token>
 *    Query Parameters:
 *      - includeRooms: 'true' | 'false'
 *      - page: number
 *      - limit: number
 *    Response: { hotels (with companyName, adminRole), pagination }
 * 
 * 3. HOTEL ROOMS
 *    GET /api/hotels/:id/rooms
 *    Headers: Authorization: Bearer <token> (optional)
 *    Response: { hotelId, hotelName, isManager, rooms, total }
 * 
 * EXAMPLE REQUESTS:
 * 
 * // Search Makkah hotels for 2 guests
 * GET /api/hotels?location=Makkah&guests=2&checkIn=2026-03-01&checkOut=2026-03-05
 * 
 * // Get user's managed hotels with rooms
 * GET /api/hotels/listings?includeRooms=true
 * Headers: Authorization: Bearer eyJhbGc...
 * 
 * // Get rooms for a specific hotel
 * GET /api/hotels/023154fa-79c2-43e8-98f5-d64e76f84ce2/rooms
 */
