/**
 * Stripe Checkout Service
 * 
 * Handles Stripe Checkout Session creation and payment verification.
 * Uses Stripe's hosted checkout page for secure payment processing.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../../database/connection';

export interface CheckoutItem {
  name: string;
  description?: string;
  amount: number; // in smallest currency unit (pence/cents)
  quantity: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionParams {
  customerId?: string;
  customerEmail?: string;
  items: CheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
  expiresAt: Date;
}

export interface PaymentStatus {
  sessionId: string;
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
  paymentIntentId?: string;
  amountTotal: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export class StripeCheckoutService {
  private baseURL: string;
  private secretKey: string;
  private headers: Record<string, string>;

  constructor(private database?: Database) {
    this.baseURL = process.env.STRIPE_BASE_URL || 'https://api.stripe.com/v1';
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${this.secretKey}`,
    };
  }

  /**
   * Create a Stripe Checkout Session
   * Returns a URL to redirect the user to Stripe's hosted checkout page
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    const { customerId, customerEmail, items, successUrl, cancelUrl, metadata } = params;

    // Build line items for Stripe
    const lineItems: Record<string, string> = {};
    items.forEach((item, index) => {
      lineItems[`line_items[${index}][price_data][currency]`] = item.currency.toLowerCase();
      lineItems[`line_items[${index}][price_data][product_data][name]`] = item.name;
      if (item.description) {
        lineItems[`line_items[${index}][price_data][product_data][description]`] = item.description;
      }
      lineItems[`line_items[${index}][price_data][unit_amount]`] = String(item.amount);
      lineItems[`line_items[${index}][quantity]`] = String(item.quantity);
    });

    // Build request body
    const requestBody: Record<string, string> = {
      ...lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // Add customer info
    if (customerId) {
      requestBody.customer = customerId;
    } else if (customerEmail) {
      requestBody.customer_email = customerEmail;
    }

    // Add metadata
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        requestBody[`metadata[${key}]`] = value;
      });
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/checkout/sessions`,
        new URLSearchParams(requestBody),
        { headers: this.headers }
      );

      const session = response.data;

      return {
        sessionId: session.id,
        url: session.url,
        expiresAt: new Date(session.expires_at * 1000),
      };
    } catch (error: any) {
      console.error('Stripe Checkout Session creation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to create checkout session');
    }
  }

  /**
   * Retrieve a Checkout Session to verify payment status
   */
  async getCheckoutSession(sessionId: string): Promise<PaymentStatus> {
    try {
      const response = await axios.get(
        `${this.baseURL}/checkout/sessions/${sessionId}`,
        { headers: this.headers }
      );

      const session = response.data;

      return {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        paymentIntentId: session.payment_intent,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
        metadata: session.metadata,
      };
    } catch (error: any) {
      console.error('Failed to retrieve checkout session:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to retrieve checkout session');
    }
  }

  /**
   * Store payment record in database
   */
  async storePaymentRecord(params: {
    sessionId: string;
    bookingId: string;
    customerId: string;
    amount: number;
    currency: string;
    status: string;
    paymentIntentId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const paymentId = uuidv4();

    await this.database.query(
      `INSERT INTO payments (id, session_id, booking_id, customer_id, amount, currency, status, payment_intent_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        paymentId,
        params.sessionId,
        params.bookingId,
        params.customerId,
        params.amount,
        params.currency,
        params.status,
        params.paymentIntentId || null,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );

    return paymentId;
  }

  /**
   * Update payment status in database
   */
  async updatePaymentStatus(sessionId: string, status: string, paymentIntentId?: string): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    await this.database.query(
      `UPDATE payments SET status = ?, payment_intent_id = ?, updated_at = NOW() WHERE session_id = ?`,
      [status, paymentIntentId || null, sessionId]
    );
  }

  /**
   * Get payment by session ID
   */
  async getPaymentBySessionId(sessionId: string): Promise<any> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const results = await this.database.query(
      `SELECT * FROM payments WHERE session_id = ?`,
      [sessionId]
    );

    return results.length > 0 ? results[0] : null;
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
