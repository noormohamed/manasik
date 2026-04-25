/**
 * Unit Tests for PaymentLinkService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentLinkService } from '../services/payment-link.service';
import { getPool } from '../database/connection';

// Mock the database connection
vi.mock('../database/connection', () => ({
  getPool: vi.fn(),
}));

describe('PaymentLinkService', () => {
  let paymentLinkService: PaymentLinkService;
  let mockPool: any;

  beforeEach(() => {
    paymentLinkService = new PaymentLinkService();
    mockPool = {
      query: vi.fn(),
    };
    (getPool as any).mockReturnValue(mockPool);
  });

  describe('Payment Link Generation', () => {
    it('should generate a payment link with valid token', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await paymentLinkService.generatePaymentLink({
        bookingId: 'booking-1',
        guestEmail: 'guest@example.com',
        amount: 100,
        currency: 'USD',
      });

      expect(result.paymentLinkId).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.url).toContain('payment');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should set expiration to 30 days by default', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await paymentLinkService.generatePaymentLink({
        bookingId: 'booking-1',
        guestEmail: 'guest@example.com',
        amount: 100,
        currency: 'USD',
      });

      const now = new Date();
      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 30);

      // Allow 1 minute difference for test execution time
      const diff = Math.abs(result.expiresAt.getTime() - expectedExpiry.getTime());
      expect(diff).toBeLessThan(60000);
    });

    it('should allow custom expiration days', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await paymentLinkService.generatePaymentLink({
        bookingId: 'booking-1',
        guestEmail: 'guest@example.com',
        amount: 100,
        currency: 'USD',
        expiresInDays: 7,
      });

      const now = new Date();
      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);

      // Allow 1 minute difference for test execution time
      const diff = Math.abs(result.expiresAt.getTime() - expectedExpiry.getTime());
      expect(diff).toBeLessThan(60000);
    });
  });

  describe('Payment Link Validation', () => {
    it('should validate a valid payment link token', async () => {
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
      expect(result.isExpired).toBeUndefined();
    });

    it('should reject an expired payment link token', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockPool.query.mockResolvedValueOnce([[{
        id: 'link-1',
        booking_id: 'booking-1',
        expires_at: pastDate,
      }]]);

      const result = await paymentLinkService.validatePaymentLink('expired-token');

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.bookingId).toBe('booking-1');
    });

    it('should reject a non-existent payment link token', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await paymentLinkService.validatePaymentLink('invalid-token');

      expect(result.isValid).toBe(false);
      expect(result.bookingId).toBeUndefined();
    });
  });

  describe('Payment Link Status Tracking', () => {
    it('should mark payment link as clicked', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      await paymentLinkService.markPaymentLinkClicked('link-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE payment_links SET status = \'CLICKED\''),
        ['link-1']
      );
    });

    it('should mark payment link as completed', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      await paymentLinkService.markPaymentLinkCompleted('link-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE payment_links SET status = \'COMPLETED\''),
        ['link-1']
      );
    });

    it('should get payment link status', async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      mockPool.query.mockResolvedValueOnce([[{
        status: 'SENT',
        created_at: now,
        expires_at: futureDate,
        clicked_at: null,
        completed_at: null,
      }]]);

      const result = await paymentLinkService.getPaymentLinkStatus('link-1');

      expect(result.status).toBe('SENT');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.clickedAt).toBeUndefined();
      expect(result.completedAt).toBeUndefined();
    });
  });

  describe('Payment Link Resend', () => {
    it('should resend payment link with new token', async () => {
      mockPool.query.mockResolvedValueOnce([[{
        id: 'link-1',
        guest_email: 'guest@example.com',
        amount: 100,
        currency: 'USD',
      }]]);
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await paymentLinkService.resendPaymentLink('booking-1');

      expect(result.paymentLinkId).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.url).toContain('payment');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw error if no active payment link found', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      try {
        await paymentLinkService.resendPaymentLink('booking-1');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('No active payment link found');
      }
    });
  });

  describe('Secure Token Generation', () => {
    it('should generate unique tokens', async () => {
      const token1 = (paymentLinkService as any).generateSecureToken();
      const token2 = (paymentLinkService as any).generateSecureToken();

      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
    });

    it('should generate tokens of consistent length', async () => {
      const tokens = Array.from({ length: 10 }, () =>
        (paymentLinkService as any).generateSecureToken()
      );

      const lengths = tokens.map(t => t.length);
      const uniqueLengths = new Set(lengths);

      expect(uniqueLengths.size).toBe(1);
    });
  });
});
