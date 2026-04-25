/**
 * Unit Tests for EmailService Enhancements
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from '../services/email/email.service';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    // Mock the transporter
    (emailService as any).transporter = {
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    };
    (emailService as any).isConfigured = true;
  });

  describe('Staff Booking Confirmation Email', () => {
    it('should send staff booking confirmation email', async () => {
      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        hotelAddress: '123 Main St, City, Country',
        roomType: 'Deluxe Room',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        nights: 2,
        total: 200,
        currency: 'USD',
      };

      const result = await emailService.sendStaffBookingConfirmation(params);

      expect(result).toBe(true);
      expect((emailService as any).transporter.sendMail).toHaveBeenCalled();
    });

    it('should include payment link in email when provided', async () => {
      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        hotelAddress: '123 Main St, City, Country',
        roomType: 'Deluxe Room',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        nights: 2,
        total: 200,
        currency: 'USD',
        paymentLinkUrl: 'https://example.com/payment/token',
      };

      const result = await emailService.sendStaffBookingConfirmation(params);

      expect(result).toBe(true);
      const callArgs = (emailService as any).transporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Pay Now');
      expect(callArgs.html).toContain('https://example.com/payment/token');
    });
  });

  describe('Payment Link Email', () => {
    it('should send payment link email', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        paymentLinkUrl: 'https://example.com/payment/token',
        amount: 200,
        currency: 'USD',
        expiresAt,
      };

      const result = await emailService.sendPaymentLinkEmail(params);

      expect(result).toBe(true);
      expect((emailService as any).transporter.sendMail).toHaveBeenCalled();
    });

    it('should include expiration date in payment link email', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        paymentLinkUrl: 'https://example.com/payment/token',
        amount: 200,
        currency: 'USD',
        expiresAt,
      };

      const result = await emailService.sendPaymentLinkEmail(params);

      expect(result).toBe(true);
      const callArgs = (emailService as any).transporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('expires');
    });
  });

  describe('Payment Confirmation Email', () => {
    it('should send payment confirmation email', async () => {
      const paymentDate = new Date();

      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        hotelAddress: '123 Main St, City, Country',
        paymentAmount: 200,
        currency: 'USD',
        paymentDate,
        paymentMethod: 'Credit Card',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomType: 'Deluxe Room',
      };

      const result = await emailService.sendPaymentConfirmation(params);

      expect(result).toBe(true);
      expect((emailService as any).transporter.sendMail).toHaveBeenCalled();
    });

    it('should include payment details in confirmation email', async () => {
      const paymentDate = new Date();

      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        hotelAddress: '123 Main St, City, Country',
        paymentAmount: 200,
        currency: 'USD',
        paymentDate,
        paymentMethod: 'Credit Card',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomType: 'Deluxe Room',
      };

      const result = await emailService.sendPaymentConfirmation(params);

      expect(result).toBe(true);
      const callArgs = (emailService as any).transporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Payment Confirmed');
      expect(callArgs.html).toContain('booking-1');
      expect(callArgs.html).toContain('200');
    });
  });

  describe('Email Retry Logic', () => {
    it('should retry email sending on failure', async () => {
      const mockSendMail = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ messageId: 'test-id' });

      (emailService as any).transporter.sendMail = mockSendMail;

      const result = await (emailService as any).retryEmailWithBackoff(
        async () => {
          await (emailService as any).transporter.sendMail({});
          return true;
        },
        3
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries', async () => {
      const mockSendMail = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      (emailService as any).transporter.sendMail = mockSendMail;

      const result = await (emailService as any).retryEmailWithBackoff(
        async () => {
          await (emailService as any).transporter.sendMail({});
          return true;
        },
        3
      );

      expect(result).toBe(false);
      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });

    it('should implement exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;

      global.setTimeout = vi.fn((callback, delay) => {
        delays.push(delay);
        callback();
        return 0 as any;
      });

      const mockSendMail = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      (emailService as any).transporter.sendMail = mockSendMail;

      await (emailService as any).retryEmailWithBackoff(
        async () => {
          await (emailService as any).transporter.sendMail({});
          return true;
        },
        3
      );

      // Verify exponential backoff: 1000ms, 2000ms
      expect(delays.length).toBeGreaterThan(0);
      if (delays.length > 1) {
        expect(delays[1]).toBeGreaterThan(delays[0]);
      }

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Email Template Rendering', () => {
    it('should render staff booking confirmation template with all details', () => {
      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        hotelAddress: '123 Main St, City, Country',
        roomType: 'Deluxe Room',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        nights: 2,
        total: 200,
        currency: 'USD',
      };

      const html = (emailService as any).staffBookingConfirmationTemplate(params);

      expect(html).toContain('John Doe');
      expect(html).toContain('booking-1');
      expect(html).toContain('Test Hotel');
      expect(html).toContain('2024-12-25');
      expect(html).toContain('2024-12-27');
      expect(html).toContain('200');
    });

    it('should render payment confirmation template with all details', () => {
      const paymentDate = new Date('2024-12-25T10:00:00Z');

      const params = {
        guestEmail: 'guest@example.com',
        guestName: 'John Doe',
        bookingId: 'booking-1',
        hotelName: 'Test Hotel',
        hotelAddress: '123 Main St, City, Country',
        paymentAmount: 200,
        currency: 'USD',
        paymentDate,
        paymentMethod: 'Credit Card',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        roomType: 'Deluxe Room',
      };

      const html = (emailService as any).paymentConfirmationTemplate(params);

      expect(html).toContain('Payment Confirmed');
      expect(html).toContain('John Doe');
      expect(html).toContain('booking-1');
      expect(html).toContain('200');
      expect(html).toContain('Credit Card');
    });
  });
});
