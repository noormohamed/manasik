/**
 * Broker Booking Service
 * 
 * Handles bookings made by brokers on behalf of customers.
 * Includes payment link generation, hold management, and email notifications.
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/connection';
import { StripeCheckoutService } from './payments/stripe-checkout.service';
import { emailService } from './email/email.service';

export interface BrokerBookingParams {
  brokerId: string;
  brokerAgentId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  basePrice: number;
  currency: string;
  brokerNotes?: string;
}

export interface PaymentLinkResult {
  bookingId: string;
  paymentLinkUrl: string;
  paymentLinkId: string;
  expiresAt: Date;
  qrCodeData: string;
}

const HOLD_DURATION_HOURS = 1;

export class BrokerBookingService {
  private stripeService: StripeCheckoutService;

  constructor() {
    this.stripeService = new StripeCheckoutService();
  }

  /**
   * Create a broker booking with payment hold
   */
  async createBrokerBooking(params: BrokerBookingParams): Promise<PaymentLinkResult> {
    const pool = getPool();
    const bookingId = uuidv4();
    
    // Calculate pricing
    const subtotal = params.basePrice * params.nights;
    const taxRate = 0.10;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Calculate hold expiry (1 hour from now)
    const holdExpiresAt = new Date();
    holdExpiresAt.setHours(holdExpiresAt.getHours() + HOLD_DURATION_HOURS);

    // Create the booking with PENDING status
    const metadata = {
      hotelId: params.hotelId,
      hotelName: params.hotelName,
      roomTypeId: params.roomTypeId,
      roomType: params.roomName,
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      nights: params.nights,
      guests: params.guests,
      guestName: params.customerName,
      guestEmail: params.customerEmail,
      guestPhone: params.customerPhone || '',
      brokerBooking: true,
    };

    await pool.query(
      `INSERT INTO bookings (
        id, company_id, customer_id, service_type, booking_source, agent_id,
        status, currency, subtotal, tax, total, metadata, payment_status,
        hold_expires_at, broker_notes, created_at, updated_at
      ) VALUES (?, ?, ?, 'HOTEL', 'AGENT', ?, 'PENDING', ?, ?, ?, ?, ?, 'PENDING', ?, ?, NOW(), NOW())`,
      [
        bookingId,
        'default-company',
        params.brokerId, // The broker's user ID as customer for tracking
        params.brokerAgentId,
        params.currency,
        subtotal,
        tax,
        total,
        JSON.stringify(metadata),
        holdExpiresAt,
        params.brokerNotes || null,
      ]
    );

    // Generate payment link
    const paymentLink = await this.generatePaymentLink(bookingId, {
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      hotelName: params.hotelName,
      roomName: params.roomName,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights: params.nights,
      total,
      currency: params.currency,
    });

    // Update booking with payment link info
    await pool.query(
      `UPDATE bookings SET 
        payment_link_id = ?,
        payment_link_url = ?,
        payment_link_expires_at = ?
      WHERE id = ?`,
      [paymentLink.sessionId, paymentLink.url, paymentLink.expiresAt, bookingId]
    );

    // Send payment request email to customer
    await this.sendPaymentRequestEmail(params.customerEmail, {
      customerName: params.customerName,
      hotelName: params.hotelName,
      roomName: params.roomName,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights: params.nights,
      total,
      currency: params.currency,
      paymentUrl: paymentLink.url,
      expiresAt: holdExpiresAt,
      bookingId,
    });

    return {
      bookingId,
      paymentLinkUrl: paymentLink.url,
      paymentLinkId: paymentLink.sessionId,
      expiresAt: holdExpiresAt,
      qrCodeData: paymentLink.url, // Frontend will generate QR from this URL
    };
  }

  /**
   * Generate a Stripe payment link for a booking
   */
  private async generatePaymentLink(bookingId: string, details: {
    customerEmail: string;
    customerName: string;
    hotelName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    currency: string;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await this.stripeService.createCheckoutSession({
      customerEmail: details.customerEmail,
      items: [{
        name: `${details.hotelName} - ${details.roomName}`,
        description: `${details.nights} night(s): ${details.checkIn} to ${details.checkOut}`,
        amount: Math.round(details.total * 100), // Convert to pence/cents
        quantity: 1,
        currency: details.currency,
      }],
      successUrl: `${frontendUrl}/payment/success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/payment/cancelled?booking_id=${bookingId}`,
      metadata: {
        bookingId,
        brokerBooking: 'true',
        customerName: details.customerName,
      },
    });

    return session;
  }

  /**
   * Resend payment link for an existing booking
   */
  async resendPaymentLink(bookingId: string): Promise<PaymentLinkResult> {
    const pool = getPool();

    // Get booking details
    const [bookings] = await pool.query<any>(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (!bookings || bookings.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookings[0];
    
    if (booking.status !== 'PENDING' || booking.payment_status === 'PAID') {
      throw new Error('Cannot resend payment link for this booking');
    }

    const metadata = typeof booking.metadata === 'string' 
      ? JSON.parse(booking.metadata) 
      : booking.metadata;

    // Generate new payment link
    const paymentLink = await this.generatePaymentLink(bookingId, {
      customerEmail: metadata.guestEmail,
      customerName: metadata.guestName,
      hotelName: metadata.hotelName,
      roomName: metadata.roomType,
      checkIn: metadata.checkInDate,
      checkOut: metadata.checkOutDate,
      nights: metadata.nights,
      total: parseFloat(booking.total),
      currency: booking.currency,
    });

    // Extend hold time
    const newHoldExpiry = new Date();
    newHoldExpiry.setHours(newHoldExpiry.getHours() + HOLD_DURATION_HOURS);

    // Update booking with new payment link
    await pool.query(
      `UPDATE bookings SET 
        payment_link_id = ?,
        payment_link_url = ?,
        payment_link_expires_at = ?,
        hold_expires_at = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [paymentLink.sessionId, paymentLink.url, paymentLink.expiresAt, newHoldExpiry, bookingId]
    );

    // Resend email
    await this.sendPaymentRequestEmail(metadata.guestEmail, {
      customerName: metadata.guestName,
      hotelName: metadata.hotelName,
      roomName: metadata.roomType,
      checkIn: metadata.checkInDate,
      checkOut: metadata.checkOutDate,
      nights: metadata.nights,
      total: parseFloat(booking.total),
      currency: booking.currency,
      paymentUrl: paymentLink.url,
      expiresAt: newHoldExpiry,
      bookingId,
    });

    return {
      bookingId,
      paymentLinkUrl: paymentLink.url,
      paymentLinkId: paymentLink.sessionId,
      expiresAt: newHoldExpiry,
      qrCodeData: paymentLink.url,
    };
  }

  /**
   * Get payment confirmation details for QR code printout
   */
  async getPaymentConfirmation(bookingId: string): Promise<{
    booking: any;
    paymentUrl: string;
    qrCodeData: string;
    expiresAt: Date;
    isExpired: boolean;
  }> {
    const pool = getPool();

    const [bookings] = await pool.query<any>(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (!bookings || bookings.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookings[0];
    const metadata = typeof booking.metadata === 'string' 
      ? JSON.parse(booking.metadata) 
      : booking.metadata;

    const holdExpiresAt = new Date(booking.hold_expires_at);
    const isExpired = holdExpiresAt < new Date();

    return {
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.payment_status,
        total: parseFloat(booking.total),
        currency: booking.currency,
        hotelName: metadata.hotelName,
        roomType: metadata.roomType,
        checkIn: metadata.checkInDate,
        checkOut: metadata.checkOutDate,
        nights: metadata.nights,
        guestName: metadata.guestName,
        guestEmail: metadata.guestEmail,
      },
      paymentUrl: booking.payment_link_url,
      qrCodeData: booking.payment_link_url,
      expiresAt: holdExpiresAt,
      isExpired,
    };
  }

  /**
   * Release expired booking holds
   */
  async releaseExpiredHolds(): Promise<number> {
    const pool = getPool();

    const [result] = await pool.query<any>(
      `UPDATE bookings 
       SET status = 'CANCELLED', 
           updated_at = NOW()
       WHERE status = 'PENDING' 
         AND payment_status = 'PENDING'
         AND hold_expires_at IS NOT NULL 
         AND hold_expires_at < NOW()`
    );

    return result.affectedRows || 0;
  }

  /**
   * Send payment request email to customer
   */
  private async sendPaymentRequestEmail(email: string, details: {
    customerName: string;
    hotelName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    currency: string;
    paymentUrl: string;
    expiresAt: Date;
    bookingId: string;
  }): Promise<boolean> {
    const expiryTime = details.expiresAt.toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f4f4}
      .container{max-width:600px;margin:0 auto;background:#fff;padding:40px}
      .header{text-align:center;padding-bottom:20px;border-bottom:2px solid #2563eb}
      .logo{font-size:28px;font-weight:bold;color:#2563eb}
      .content{padding:30px 0}
      h1{color:#1f2937;font-size:24px}
      .btn{display:inline-block;padding:16px 40px;background:#2563eb;color:#fff!important;text-decoration:none;border-radius:6px;font-weight:600;margin:20px 0;font-size:18px}
      .box{background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0}
      .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}
      .row:last-child{border-bottom:none}
      .warning{background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0}
      .footer{padding-top:20px;border-top:2px solid #f0f0f0;text-align:center;color:#6b7280;font-size:14px}
      .total{font-size:24px;color:#2563eb;font-weight:bold}
    </style></head><body><div class="container">
      <div class="header"><div class="logo">Manasik</div></div>
      <div class="content">
        <h1>Complete Your Booking Payment</h1>
        <p>Hi ${details.customerName},</p>
        <p>A booking has been made on your behalf. Please complete the payment to confirm your reservation:</p>
        
        <div class="box">
          <div class="row"><span>Booking Reference</span><span><b>${details.bookingId.slice(0, 8).toUpperCase()}</b></span></div>
          <div class="row"><span>Hotel</span><span><b>${details.hotelName}</b></span></div>
          <div class="row"><span>Room Type</span><span>${details.roomName}</span></div>
          <div class="row"><span>Check-in</span><span>${details.checkIn}</span></div>
          <div class="row"><span>Check-out</span><span>${details.checkOut}</span></div>
          <div class="row"><span>Duration</span><span>${details.nights} night(s)</span></div>
          <div class="row"><span>Total Amount</span><span class="total">${details.currency} ${details.total.toFixed(2)}</span></div>
        </div>

        <div style="text-align:center">
          <a href="${details.paymentUrl}" class="btn">Pay Now</a>
        </div>

        <div class="warning">
          <p style="margin:0;color:#92400e">
            <b>⏰ Important:</b> This booking is being held for you until <b>${expiryTime}</b>. 
            Please complete payment before this time to secure your reservation.
          </p>
        </div>

        <p style="font-size:12px;color:#6b7280">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${details.paymentUrl}
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Manasik - Your Travel Partner</p>
        <p style="font-size:12px">If you didn't request this booking, please ignore this email.</p>
      </div>
    </div></body></html>`;

    return emailService.sendEmail({
      to: email,
      subject: `Complete Your Payment - ${details.hotelName} Booking`,
      html,
    });
  }
}

export const brokerBookingService = new BrokerBookingService();
