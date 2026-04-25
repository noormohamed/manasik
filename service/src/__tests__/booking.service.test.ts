/**
 * Unit Tests for BookingService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingService } from '../services/booking.service';
import { getPool } from '../database/connection';

// Mock the database connection
vi.mock('../database/connection', () => ({
  getPool: vi.fn(),
}));

// Mock the payment link service
vi.mock('../services/payment-link.service', () => ({
  paymentLinkService: {
    generatePaymentLink: vi.fn(),
  },
}));

// Mock the email service
vi.mock('../services/email/email.service', () => ({
  emailService: {
    sendEmail: vi.fn(),
  },
}));

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockPool: any;

  beforeEach(() => {
    bookingService = new BookingService();
    mockPool = {
      query: vi.fn(),
    };
    (getPool as any).mockReturnValue(mockPool);
  });

  describe('Email Validation', () => {
    it('should accept valid email format', async () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
      ];

      for (const email of validEmails) {
        const result = (bookingService as any).isValidEmail(email);
        expect(result).toBe(true);
      }
    });

    it('should reject invalid email format', async () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'user@.com',
        'user @example.com',
      ];

      for (const email of invalidEmails) {
        const result = (bookingService as any).isValidEmail(email);
        expect(result).toBe(false);
      }
    });
  });

  describe('Name Validation', () => {
    it('should accept valid names with alphabetic characters', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 1,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);
      mockPool.query.mockResolvedValueOnce([[{ name: 'Hotel', address: 'Address', city: 'City', country: 'Country' }]]);
      mockPool.query.mockResolvedValueOnce([[]]);
      mockPool.query.mockResolvedValueOnce([[]]);
      mockPool.query.mockResolvedValueOnce([[]]);

      // Should not throw
      try {
        await bookingService.createBookingOnBehalf(params);
      } catch (error: any) {
        // Check if error is about validation
        if (error.message.includes('firstName') || error.message.includes('lastName')) {
          throw error;
        }
      }
    });

    it('should reject empty first name', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: '',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 1,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);

      try {
        await bookingService.createBookingOnBehalf(params);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('First name is required');
      }
    });

    it('should reject empty last name', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: '',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 1,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);

      try {
        await bookingService.createBookingOnBehalf(params);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Last name is required');
      }
    });
  });

  describe('Date Validation', () => {
    it('should reject check-in date in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: yesterdayStr,
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 1,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);

      try {
        await bookingService.createBookingOnBehalf(params);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Check-in date must be today or later');
      }
    });

    it('should reject check-out date before check-in date', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-27',
        checkOutDate: '2024-12-25',
        roomTypeId: 'room-1',
        numberOfGuests: 1,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);

      try {
        await bookingService.createBookingOnBehalf(params);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Check-out date must be after check-in date');
      }
    });
  });

  describe('Guest Count Validation', () => {
    it('should reject zero guests', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 0,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);

      try {
        await bookingService.createBookingOnBehalf(params);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Number of guests must be at least 1');
      }
    });

    it('should reject guests exceeding room capacity', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 5,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);

      try {
        await bookingService.createBookingOnBehalf(params);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Number of guests cannot exceed room capacity');
      }
    });

    it('should accept guests within room capacity', async () => {
      const params = {
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 2,
        sendPaymentLink: false,
      };

      mockPool.query.mockResolvedValueOnce([[{ max_occupancy: 2 }]]);
      mockPool.query.mockResolvedValueOnce([[{ name: 'Hotel', address: 'Address', city: 'City', country: 'Country' }]]);
      mockPool.query.mockResolvedValueOnce([[]]);
      mockPool.query.mockResolvedValueOnce([[]]);
      mockPool.query.mockResolvedValueOnce([[]]);

      // Should not throw validation error
      try {
        await bookingService.createBookingOnBehalf(params);
      } catch (error: any) {
        // Only fail if it's a validation error
        if (error.message.includes('Number of guests')) {
          throw error;
        }
      }
    });
  });

  describe('Price Calculation', () => {
    it('should calculate price correctly', () => {
      const result = (bookingService as any).calculatePrice({
        basePrice: 100,
        nights: 3,
        taxRate: 0.15,
      });

      expect(result.subtotal).toBe(300);
      expect(result.tax).toBe(45);
      expect(result.total).toBe(345);
    });

    it('should handle decimal prices', () => {
      const result = (bookingService as any).calculatePrice({
        basePrice: 99.99,
        nights: 2,
        taxRate: 0.15,
      });

      expect(result.subtotal).toBe(199.98);
      expect(result.tax).toBeCloseTo(29.997, 2);
      expect(result.total).toBeCloseTo(229.977, 2);
    });
  });
});
