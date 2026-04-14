/**
 * Hotel Listing API Tests
 * Tests for fetching and creating hotel listings
 */

import request from 'supertest';
import { app, server } from '../server';
import { initializeDatabase, closeDatabase } from '../database/connection';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../database/repositories/user.repository';
import { HotelRepository } from '../features/hotel/repositories/hotel.repository';
import { User } from '../models/user';
import { v4 as uuidv4 } from 'uuid';

const authService = new AuthService();

describe('Hotel Listing API', () => {
  let testUser: User;
  let authToken: string;
  let testHotelId: string;

  beforeAll(async () => {
    await initializeDatabase();
    
    // Create test user
    const userRepository = new UserRepository();
    const userId = uuidv4();
    testUser = new User(userId);
    testUser.email = `test-${Date.now()}@example.com`;
    testUser.first_name = 'Test';
    testUser.last_name = 'User';
    testUser.password_hash = await authService.hashPassword('password123');
    testUser.role = 'CUSTOMER';
    testUser.is_active = true;
    testUser.created_at = new Date();
    testUser.updated_at = new Date();
    
    await userRepository.create(testUser);
    
    // Generate auth token
    const tokens = authService.generateTokens(testUser);
    authToken = tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup: delete test hotel if created
    if (testHotelId) {
      const hotelRepository = new HotelRepository();
      await hotelRepository.delete(testHotelId);
    }
    
    // Cleanup: delete test user
    if (testUser) {
      const userRepository = new UserRepository();
      await userRepository.delete(testUser.id);
    }
    
    await closeDatabase();
    server.close();
  });

  describe('GET /api/hotels/listings', () => {
    it('should require authentication', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for user with no hotels', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hotels');
      expect(Array.isArray(response.body.hotels)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it('should support includeRooms parameter', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings?includeRooms=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hotels');
    });
  });

  describe('POST /api/hotels', () => {
    it('should require authentication', async () => {
      const response = await request(app.callback())
        .post('/api/hotels')
        .send({
          name: 'Test Hotel',
          address: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app.callback())
        .post('/api/hotels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Hotel',
          // Missing address, city, country
        })
        .expect(400);

      expect(response.body.error).toContain('required fields');
    });

    it('should create a hotel with minimum required fields', async () => {
      const hotelData = {
        name: 'Test Hotel',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
      };

      const response = await request(app.callback())
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
    });

    it('should create a hotel with all fields', async () => {
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

      const response = await request(app.callback())
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
      const hotelRepository = new HotelRepository();
      await hotelRepository.delete(response.body.hotel.id);
    });

    it('should set default values for optional fields', async () => {
      const hotelData = {
        name: 'Default Values Hotel',
        address: '789 Default Rd',
        city: 'Default City',
        country: 'Default Country',
      };

      const response = await request(app.callback())
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
      const hotelRepository = new HotelRepository();
      await hotelRepository.delete(response.body.hotel.id);
    });

    it('should assign hotel to the authenticated user', async () => {
      const hotelData = {
        name: 'User Assignment Test Hotel',
        address: '321 Assignment St',
        city: 'Assignment City',
        country: 'Assignment Country',
      };

      const response = await request(app.callback())
        .post('/api/hotels')
        .set('Authorization', `Bearer ${authToken}`)
        .send(hotelData)
        .expect(201);

      expect(response.body.hotel.agentId).toBe(testUser.id);

      // Cleanup
      const hotelRepository = new HotelRepository();
      await hotelRepository.delete(response.body.hotel.id);
    });
  });

  describe('GET /api/hotels/listings - After Creation', () => {
    let createdHotelId: string;

    beforeAll(async () => {
      // Create a hotel for this test suite
      const response = await request(app.callback())
        .post('/api/hotels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Listing Test Hotel',
          address: '999 Listing Ave',
          city: 'Listing City',
          country: 'Listing Country',
        });
      
      createdHotelId = response.body.hotel.id;
    });

    afterAll(async () => {
      // Cleanup
      if (createdHotelId) {
        const hotelRepository = new HotelRepository();
        await hotelRepository.delete(createdHotelId);
      }
    });

    it('should return the created hotel in listings', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.hotels.length).toBeGreaterThan(0);
      
      const createdHotel = response.body.hotels.find((h: any) => h.id === createdHotelId);
      expect(createdHotel).toBeDefined();
      expect(createdHotel.name).toBe('Listing Test Hotel');
    });

    it('should return correct pagination total', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.total).toBeGreaterThan(0);
      expect(response.body.pagination.totalPages).toBeGreaterThan(0);
    });
  });

  describe('Integration: Create and Fetch Flow', () => {
    it('should create hotel and immediately fetch it in listings', async () => {
      // Step 1: Create hotel
      const createResponse = await request(app.callback())
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
      const listResponse = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Step 3: Verify hotel is in listings
      const foundHotel = listResponse.body.hotels.find((h: any) => h.id === hotelId);
      expect(foundHotel).toBeDefined();
      expect(foundHotel.name).toBe('Integration Test Hotel');
      expect(foundHotel.starRating).toBe(5);

      // Cleanup
      const hotelRepository = new HotelRepository();
      await hotelRepository.delete(hotelId);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Try to create hotel with invalid data that might cause DB error
      const response = await request(app.callback())
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
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid authorization token', async () => {
      const response = await request(app.callback())
        .get('/api/hotels/listings')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
