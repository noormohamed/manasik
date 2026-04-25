/**
 * Booking Service
 * Handles booking creation, validation, and management
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/connection';
import { paymentLinkService } from './payment-link.service';
import { emailService } from './email/email.service';

export interface CreateBookingOnBehalfParams {
  hotelId: string;
  staffUserId: string;
  guestEmail: string;
  firstName: string;
  lastName: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  roomTypeId: string;
  numberOfGuests: number;
  sendPaymentLink: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface BookingCreationResult {
  bookingId: string;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
}

export class BookingService {
  /**
   * Create a booking on behalf of a guest (staff-created)
   */
  async createBookingOnBehalf(params: CreateBookingOnBehalfParams): Promise<BookingCreationResult> {
    const pool = getPool();

    // Validate all booking details
    const validation = await this.validateBookingDetails(params);
    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    // Check for duplicate bookings
    const isDuplicate = await this.checkDuplicateBooking({
      guestEmail: params.guestEmail,
      roomTypeId: params.roomTypeId,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
    });

    const bookingId = uuidv4();
    const guestId = uuidv4();

    try {
      // Get room type details for pricing
      const [roomTypes] = await pool.query<any>(
        `SELECT base_price, capacity FROM room_types WHERE id = ? AND hotel_id = ?`,
        [params.roomTypeId, params.hotelId]
      );

      if (!roomTypes || roomTypes.length === 0) {
        throw new Error('Room type not found');
      }

      const roomType = roomTypes[0];

      // Calculate nights and price
      const checkInDate = new Date(params.checkInDate);
      const checkOutDate = new Date(params.checkOutDate);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const priceCalc = this.calculatePrice({
        basePrice: roomType.base_price,
        nights,
        taxRate: 0.15, // 15% tax
      });

      // Get hotel details
      const [hotels] = await pool.query<any>(
        `SELECT name, address, city, country FROM hotels WHERE id = ?`,
        [params.hotelId]
      );

      if (!hotels || hotels.length === 0) {
        throw new Error('Hotel not found');
      }

      const hotel = hotels[0];

      // Create booking record FIRST (before guest, due to FK constraint)
      const metadata = {
        roomType: params.roomTypeId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        nights,
        guests: params.numberOfGuests,
        hotelName: hotel.name,
        hotelAddress: hotel.address,
        hotelCity: hotel.city,
        hotelCountry: hotel.country,
        isDuplicate,
        guestName: `${params.firstName} ${params.lastName}`,
        guestEmail: params.guestEmail,
        guestPhone: params.guestPhone,
        roomName: params.roomTypeId,
      };

      await pool.query(
        `INSERT INTO bookings 
         (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          bookingId,
          'comp-001', // Default company ID
          params.staffUserId, // Use staff user ID as customer for now
          'HOTEL',
          'PENDING',
          'USD',
          priceCalc.subtotal,
          priceCalc.tax,
          priceCalc.total,
          JSON.stringify(metadata),
        ]
      );

      // Create guest record AFTER booking (due to FK constraint)
      await pool.query(
        `INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, is_lead_passenger)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [guestId, bookingId, params.firstName, params.lastName, params.guestEmail, params.guestPhone || null]
      );

      let paymentLinkId: string | undefined;
      let paymentLinkUrl: string | undefined;

      // Generate payment link if requested
      if (params.sendPaymentLink) {
        const paymentLink = await paymentLinkService.generatePaymentLink({
          bookingId,
          guestEmail: params.guestEmail,
          amount: priceCalc.total,
          currency: 'USD',
        });

        paymentLinkId = paymentLink.paymentLinkId;
        paymentLinkUrl = paymentLink.url;

        // Update booking with payment link ID
        await pool.query(
          `UPDATE bookings SET payment_link_id = ? WHERE id = ?`,
          [paymentLinkId, bookingId]
        );
      }

      // Send confirmation email
      await this.sendBookingConfirmationEmail({
        guestEmail: params.guestEmail,
        guestName: `${params.firstName} ${params.lastName}`,
        bookingId,
        hotelName: hotel.name,
        hotelAddress: `${hotel.address}, ${hotel.city}, ${hotel.country}`,
        roomType: params.roomTypeId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        nights,
        total: priceCalc.total,
        currency: 'USD',
        paymentLinkUrl,
      });

      return {
        bookingId,
        paymentLinkId,
        paymentLinkUrl,
      };
    } catch (error) {
      console.error('Error creating booking on behalf:', error);
      throw error;
    }
  }

  /**
   * Validate booking details
   */
  private async validateBookingDetails(params: CreateBookingOnBehalfParams): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string }> = [];

    // Email validation
    if (!this.isValidEmail(params.guestEmail)) {
      errors.push({ field: 'guestEmail', message: 'Invalid email format' });
    }

    // Name validation
    if (!params.firstName || params.firstName.trim().length === 0) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!params.lastName || params.lastName.trim().length === 0) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    // Date validation
    const checkInDate = new Date(params.checkInDate);
    const checkOutDate = new Date(params.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      errors.push({ field: 'checkInDate', message: 'Check-in date must be today or later' });
    }

    if (checkOutDate <= checkInDate) {
      errors.push({ field: 'checkOutDate', message: 'Check-out date must be after check-in date' });
    }

    // Guest count validation
    if (params.numberOfGuests < 1) {
      errors.push({ field: 'numberOfGuests', message: 'Number of guests must be at least 1' });
    }

    // Check room capacity
    const pool = getPool();
    const [roomTypes] = await pool.query<any>(
      `SELECT capacity FROM room_types WHERE id = ?`,
      [params.roomTypeId]
    );

    if (roomTypes && roomTypes.length > 0) {
      const maxOccupancy = roomTypes[0].capacity;
      if (params.numberOfGuests > maxOccupancy) {
        errors.push({
          field: 'numberOfGuests',
          message: `Number of guests cannot exceed room capacity of ${maxOccupancy}`,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for duplicate bookings
   */
  private async checkDuplicateBooking(params: {
    guestEmail: string;
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
  }): Promise<boolean> {
    const pool = getPool();

    try {
      const [bookings] = await pool.query<any>(
        `SELECT id FROM bookings 
         WHERE guest_email = ? AND room_type_id = ? 
         AND check_in < ? AND check_out > ?`,
        [params.guestEmail, params.roomTypeId, params.checkOutDate, params.checkInDate]
      );

      return bookings && bookings.length > 0;
    } catch (error) {
      console.error('Error checking duplicate booking:', error);
      return false;
    }
  }

  /**
   * Calculate booking price
   */
  private calculatePrice(params: {
    basePrice: number;
    nights: number;
    taxRate: number;
  }): { subtotal: number; tax: number; total: number } {
    const subtotal = params.basePrice * params.nights;
    const tax = subtotal * params.taxRate;
    const total = subtotal + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Send booking confirmation email
   */
  private async sendBookingConfirmationEmail(params: {
    guestEmail: string;
    guestName: string;
    bookingId: string;
    hotelName: string;
    hotelAddress: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    total: number;
    currency: string;
    paymentLinkUrl?: string;
  }): Promise<void> {
    try {
      const emailHtml = this.buildBookingConfirmationEmail(params);

      await emailService.sendEmail({
        to: params.guestEmail,
        subject: `Booking Confirmation - ${params.hotelName}`,
        html: emailHtml,
      });

      // Log to email audit
      const pool = getPool();
      await pool.query(
        `INSERT INTO email_audit_log (id, booking_id, recipient_email, email_type, subject, status)
         VALUES (?, ?, ?, 'BOOKING_CONFIRMATION', ?, 'SENT')`,
        [uuidv4(), params.bookingId, params.guestEmail, `Booking Confirmation - ${params.hotelName}`]
      );
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      // Don't throw - email failure should not block booking creation
    }
  }

  /**
   * Build booking confirmation email HTML
   */
  private buildBookingConfirmationEmail(params: {
    guestEmail: string;
    guestName: string;
    bookingId: string;
    hotelName: string;
    hotelAddress: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    total: number;
    currency: string;
    paymentLinkUrl?: string;
  }): string {
    const paymentLinkHtml = params.paymentLinkUrl
      ? `<div style="text-align:center;margin:30px 0">
           <a href="${params.paymentLinkUrl}" style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
             Pay Now
           </a>
         </div>`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
    .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
    .content { padding: 30px 0; }
    h1 { color: #1f2937; font-size: 24px; }
    .box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .row:last-child { border-bottom: none; }
    .footer { padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Manasik</div>
    </div>
    <div class="content">
      <div style="text-align:center"><span style="background:#10b981;color:#fff;padding:8px 16px;border-radius:20px">✓ Booking Confirmed</span></div>
      <h1>Thank you for your booking!</h1>
      <p>Hi ${params.guestName},</p>
      <p>Your booking has been confirmed:</p>
      <div class="box">
        <div class="row"><span>Booking ID</span><span><b>${params.bookingId}</b></span></div>
        <div class="row"><span>Hotel</span><span><b>${params.hotelName}</b></span></div>
        <div class="row"><span>Address</span><span>${params.hotelAddress}</span></div>
        <div class="row"><span>Room Type</span><span>${params.roomType}</span></div>
        <div class="row"><span>Check-in</span><span>${params.checkInDate}</span></div>
        <div class="row"><span>Check-out</span><span>${params.checkOutDate}</span></div>
        <div class="row"><span>Duration</span><span>${params.nights} night(s)</span></div>
        <div class="row"><span>Total</span><span style="color:#2563eb;font-size:18px"><b>${params.currency} ${params.total.toFixed(2)}</b></span></div>
      </div>
      ${paymentLinkHtml}
      <p>We look forward to welcoming you!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Manasik</p>
    </div>
  </div>
</body>
</html>`;
  }
}

export const bookingService = new BookingService();
