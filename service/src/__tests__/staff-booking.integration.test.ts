/**
 * Integration Tests for Staff Booking Feature
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPool } from '../database/connection';
import { bookingService } from '../services/booking.service';
import { paymentLinkService } from '../services/payment-link.service';
import { emailService } from '../services/email/email.service';

// Mock the database connection
vi.mock('../database/connection', () => ({
  getPool: vi.fn(),
}));

// Mock the email service
vi.mock('../services/email/email.service', () => ({
  emailService: {
    sendEmail: vi.fn().mockResolvedValue(true),
  },
}));

describe('Staff Booking Integration Tests', () => {
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
    };
    (getPool as any).mockReturnValue(mockPool);
  });

  describe('Complete Booking Creation Workflow', () => {
    it('should create booking with all required information', async () => {
      // Mock room type query
      mockPool.query.mockResolvedValueOnce([[{
        base_price: 100,
        max_occupancy: 2,
      }]]);

      // Mock hotel query
      mockPool.query.mockResolvedValueOnce([[{
        name: 'Test Hotel',
        address: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
      }]]);

      // Mock duplicate check
      mockPool.query.mockResolvedValueOnce([[]]);

      // Mock guest insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock booking insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock email audit log insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await bookingService.createBookingOnBehalf({
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
      });

      expect(result.bookingId).toBeDefined();
      expect(result.paymentLinkId).toBeUndefined();
      expect(result.paymentLinkUrl).toBeUndefined();
    });

    it('should create booking with payment link when requested', async () => {
      // Mock room type query
      mockPool.query.mockResolvedValueOnce([[{
        base_price: 100,
        max_occupancy: 2,
      }]]);

      // Mock hotel query
      mockPool.query.mockResolvedValueOnce([[{
        name: 'Test Hotel',
        address: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
      }]]);

      // Mock duplicate check
      mockPool.query.mockResolvedValueOnce([[]]);

      // Mock guest insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock booking insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock payment link insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock booking update with payment link
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock email audit log insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await bookingService.createBookingOnBehalf({
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomTypeId: 'room-1',
        numberOfGuests: 2,
        sendPaymentLink: true,
      });

      expect(result.bookingId).toBeDefined();
      expect(result.paymentLinkId).toBeDefined();
      expect(result.paymentLinkUrl).toBeDefined();
      expect(result.paymentLinkUrl).toContain('payment');
    });

    it('should send confirmation email after booking creation', async () => {
      // Mock room type query
      mockPool.query.mockResolvedValueOnce([[{
        base_price: 100,
        max_occupancy: 2,
      }]]);

      // Mock hotel query
      mockPool.query.mockResolvedValueOnce([[{
        name: 'Test Hotel',
        address: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
      }]]);

      // Mock duplicate check
      mockPool.query.mockResolvedValueOnce([[]]);

      // Mock guest insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock booking insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock email audit log insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await bookingService.createBookingOnBehalf({
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
      });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('Payment Link Workflow', () => {
    it('should generate payment link with correct expiration', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await paymentLinkService.generatePaymentLink({
        bookingId: 'booking-1',
        guestEmail: 'guest@example.com',
        amount: 230,
        currency: 'USD',
      });

      expect(result.paymentLinkId).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.url).toContain('payment');
      expect(result.expiresAt).toBeInstanceOf(Date);

      // Verify expiration is approximately 30 days from now
      const now = new Date();
      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 30);

      const diff = Math.abs(result.expiresAt.getTime() - expectedExpiry.getTime());
      expect(diff).toBeLessThan(60000); // Within 1 minute
    });

    it('should validate payment link token', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      mockPool.query.mockResolvedValueOnce([[{
        id: 'link-1',
        booking_id: 'booking-1',
        expires_at: futureDate,
      }]]);

      const result = await paymentLinkService.validatePaymentLink('valid-token');

      expect(result.isValid).toBe(true);
      expect(result.bookingId).toBe('booking-1');
    });

    it('should mark payment link as completed', async () => {
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await paymentLinkService.markPaymentLinkCompleted('link-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE payment_links SET status = \'COMPLETED\''),
        ['link-1']
      );
    });
  });

  describe('Duplicate Booking Detection', () => {
    it('should detect duplicate bookings', async () => {
      // Mock room type query
      mockPool.query.mockResolvedValueOnce([[{
        base_price: 100,
        max_occupancy: 2,
      }]]);

      // Mock hotel query
      mockPool.query.mockResolvedValueOnce([[{
        name: 'Test Hotel',
        address: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
      }]]);

      // Mock duplicate check - return existing booking
      mockPool.query.mockResolvedValueOnce([[{
        id: 'existing-booking-1',
      }]]);

      // Mock guest insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock booking insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock email audit log insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await bookingService.createBookingOnBehalf({
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
      });

      expect(result.bookingId).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      try {
        await bookingService.createBookingOnBehalf({
          hotelId: 'hotel-1',
          staffUserId: 'staff-1',
          guestEmail: 'invalid-email',
          firstName: 'John',
          lastName: 'Doe',
          checkInDate: '2024-12-25',
          checkOutDate: '2024-12-27',
          roomTypeId: 'room-1',
          numberOfGuests: 2,
          sendPaymentLink: false,
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid email format');
      }
    });

    it('should handle room not found error', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      try {
        await bookingService.createBookingOnBehalf({
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
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Room type not found');
      }
    });

    it('should handle hotel not found error', async () => {
      mockPool.query.mockResolvedValueOnce([[{
        base_price: 100,
        max_occupancy: 2,
      }]]);
      mockPool.query.mockResolvedValueOnce([[]]);

      try {
        await bookingService.createBookingOnBehalf({
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
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Hotel not found');
      }
    });
  });

  describe('Price Calculation', () => {
    it('should calculate correct total price with tax', async () => {
      // Mock room type query
      mockPool.query.mockResolvedValueOnce([[{
        base_price: 100,
        max_occupancy: 2,
      }]]);

      // Mock hotel query
      mockPool.query.mockResolvedValueOnce([[{
        name: 'Test Hotel',
        address: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
      }]]);

      // Mock duplicate check
      mockPool.query.mockResolvedValueOnce([[]]);

      // Mock guest insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock booking insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock email audit log insert
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await bookingService.createBookingOnBehalf({
        hotelId: 'hotel-1',
        staffUserId: 'staff-1',
        guestEmail: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27', // 2 nights
        roomTypeId: 'room-1',
        numberOfGuests: 2,
        sendPaymentLink: false,
      });

      // Verify the booking insert was called with correct price
      // Base price: 100, Nights: 2, Subtotal: 200, Tax (15%): 30, Total: 230
      const bookingInsertCall = mockPool.query.mock.calls.find(call =>
        call[0].includes('INSERT INTO bookings')
      );

      expect(bookingInsertCall).toBeDefined();
      const params = bookingInsertCall[1];
      expect(params[9]).toBe(200); // subtotal
      expect(params[10]).toBe(30); // tax
      expect(params[11]).toBe(230); // total
    });
  });
});
