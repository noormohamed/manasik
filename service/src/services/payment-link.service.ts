/**
 * Payment Link Service
 * Manages generation, validation, and tracking of payment links for staff-created bookings
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/connection';
import crypto from 'crypto';

export interface PaymentLinkParams {
  bookingId: string;
  guestEmail: string;
  amount: number;
  currency: string;
  expiresInDays?: number;
}

export interface PaymentLinkResult {
  paymentLinkId: string;
  token: string;
  url: string;
  expiresAt: Date;
}

export interface PaymentLinkStatus {
  status: 'SENT' | 'CLICKED' | 'EXPIRED' | 'COMPLETED';
  createdAt: Date;
  expiresAt: Date;
  clickedAt?: Date;
  completedAt?: Date;
}

export class PaymentLinkService {
  private readonly PAYMENT_LINK_BASE_URL = process.env.PAYMENT_LINK_BASE_URL || 'http://localhost:3000/payment';
  private readonly DEFAULT_EXPIRY_DAYS = 30;

  /**
   * Generate a new payment link for a booking
   */
  async generatePaymentLink(params: PaymentLinkParams): Promise<PaymentLinkResult> {
    const pool = getPool();
    const paymentLinkId = uuidv4();
    const token = this.generateSecureToken();
    const expiresInDays = params.expiresInDays || this.DEFAULT_EXPIRY_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    try {
      await pool.query(
        `INSERT INTO payment_links 
         (id, booking_id, token, guest_email, amount, currency, status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, 'SENT', ?)`,
        [
          paymentLinkId,
          params.bookingId,
          token,
          params.guestEmail,
          params.amount,
          params.currency,
          expiresAt,
        ]
      );

      const url = `${this.PAYMENT_LINK_BASE_URL}/${token}`;

      return {
        paymentLinkId,
        token,
        url,
        expiresAt,
      };
    } catch (error) {
      console.error('Error generating payment link:', error);
      throw new Error('Failed to generate payment link');
    }
  }

  /**
   * Resend payment link to guest (invalidates previous link)
   */
  async resendPaymentLink(bookingId: string): Promise<PaymentLinkResult> {
    const pool = getPool();

    try {
      // Get existing payment link details
      const [existingLinks] = await pool.query<any>(
        `SELECT id, guest_email, amount, currency FROM payment_links WHERE booking_id = ? AND status != 'COMPLETED'`,
        [bookingId]
      );

      if (!existingLinks || existingLinks.length === 0) {
        throw new Error('No active payment link found for this booking');
      }

      const existingLink = existingLinks[0];

      // Generate new payment link
      const newLink = await this.generatePaymentLink({
        bookingId,
        guestEmail: existingLink.guest_email,
        amount: existingLink.amount,
        currency: existingLink.currency,
      });

      return newLink;
    } catch (error) {
      console.error('Error resending payment link:', error);
      throw error;
    }
  }

  /**
   * Validate payment link token
   */
  async validatePaymentLink(token: string): Promise<{
    isValid: boolean;
    bookingId?: string;
    isExpired?: boolean;
  }> {
    const pool = getPool();

    try {
      const [links] = await pool.query<any>(
        `SELECT id, booking_id, expires_at FROM payment_links WHERE token = ?`,
        [token]
      );

      if (!links || links.length === 0) {
        return { isValid: false };
      }

      const link = links[0];
      const isExpired = new Date() > new Date(link.expires_at);

      if (isExpired) {
        return { isValid: false, bookingId: link.booking_id, isExpired: true };
      }

      return { isValid: true, bookingId: link.booking_id };
    } catch (error) {
      console.error('Error validating payment link:', error);
      return { isValid: false };
    }
  }

  /**
   * Mark payment link as clicked
   */
  async markPaymentLinkClicked(paymentLinkId: string): Promise<void> {
    const pool = getPool();

    try {
      await pool.query(
        `UPDATE payment_links SET status = 'CLICKED', clicked_at = NOW() WHERE id = ?`,
        [paymentLinkId]
      );
    } catch (error) {
      console.error('Error marking payment link as clicked:', error);
      throw error;
    }
  }

  /**
   * Mark payment link as completed
   */
  async markPaymentLinkCompleted(paymentLinkId: string): Promise<void> {
    const pool = getPool();

    try {
      await pool.query(
        `UPDATE payment_links SET status = 'COMPLETED', completed_at = NOW() WHERE id = ?`,
        [paymentLinkId]
      );
    } catch (error) {
      console.error('Error marking payment link as completed:', error);
      throw error;
    }
  }

  /**
   * Get payment link status
   */
  async getPaymentLinkStatus(paymentLinkId: string): Promise<PaymentLinkStatus> {
    const pool = getPool();

    try {
      const [links] = await pool.query<any>(
        `SELECT status, created_at, expires_at, clicked_at, completed_at FROM payment_links WHERE id = ?`,
        [paymentLinkId]
      );

      if (!links || links.length === 0) {
        throw new Error('Payment link not found');
      }

      const link = links[0];

      return {
        status: link.status,
        createdAt: new Date(link.created_at),
        expiresAt: new Date(link.expires_at),
        clickedAt: link.clicked_at ? new Date(link.clicked_at) : undefined,
        completedAt: link.completed_at ? new Date(link.completed_at) : undefined,
      };
    } catch (error) {
      console.error('Error getting payment link status:', error);
      throw error;
    }
  }

  /**
   * Get payment link by token
   */
  async getPaymentLinkByToken(token: string): Promise<any> {
    const pool = getPool();

    try {
      const [links] = await pool.query<any>(
        `SELECT * FROM payment_links WHERE token = ?`,
        [token]
      );

      if (!links || links.length === 0) {
        return null;
      }

      return links[0];
    } catch (error) {
      console.error('Error getting payment link by token:', error);
      throw error;
    }
  }

  /**
   * Update payment link with Stripe session ID
   */
  async updatePaymentLinkWithStripeSession(paymentLinkId: string, stripeSessionId: string): Promise<void> {
    const pool = getPool();

    try {
      await pool.query(
        `UPDATE payment_links SET stripe_session_id = ? WHERE id = ?`,
        [stripeSessionId, paymentLinkId]
      );
    } catch (error) {
      console.error('Error updating payment link with Stripe session:', error);
      throw error;
    }
  }

  /**
   * Generate a secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export const paymentLinkService = new PaymentLinkService();
