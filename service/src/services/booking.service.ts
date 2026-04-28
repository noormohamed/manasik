/**
 * Booking Service
 * Handles booking creation, validation, and management
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/connection';
import { paymentLinkService } from './payment-link.service';
import { emailService } from './email/email.service';

export interface RoomAllocation {
  roomTypeId: string;
  quantity: number;
}

export interface CreateBookingOnBehalfParams {
  hotelId: string;
  staffUserId: string;
  guestEmail: string;
  firstName: string;
  lastName: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: RoomAllocation[];
  numberOfGuests: number;
  sendPaymentLink: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface BookingCreationResult {
  bookingId: string;
  numberOfRooms: number;
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

    // Check for duplicate bookings (best-effort, uses first room type)
    const isDuplicate = await this.checkDuplicateBooking({
      guestEmail: params.guestEmail,
      roomTypeId: params.rooms[0]?.roomTypeId || '',
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
    });

    const bookingId = uuidv4();
    const guestId = uuidv4();

    try {
      // Fetch details for every requested room type in one pass
      const roomDetails: Array<{
        roomTypeId: string;
        name: string;
        base_price: number;
        capacity: number;
        available_rooms: number;
        quantity: number;
      }> = [];

      for (const allocation of params.rooms) {
        const [rows] = await pool.query<any>(
          `SELECT id, name, base_price, capacity, available_rooms
           FROM room_types WHERE id = ? AND hotel_id = ?`,
          [allocation.roomTypeId, params.hotelId]
        );
        if (!rows || rows.length === 0) {
          throw new Error(`Room type '${allocation.roomTypeId}' not found for this hotel`);
        }
        const rt = rows[0];
        if (rt.available_rooms < allocation.quantity) {
          throw new Error(
            `Not enough '${rt.name}' rooms available. ` +
            `Requested ${allocation.quantity}, only ${rt.available_rooms} available.`
          );
        }
        roomDetails.push({ ...rt, roomTypeId: allocation.roomTypeId, quantity: allocation.quantity });
      }

      // Calculate nights
      const checkInDate = new Date(params.checkInDate);
      const checkOutDate = new Date(params.checkOutDate);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      // Price = sum of (pricePerRoom × quantity × nights) across all room types
      const subtotal = Math.round(
        roomDetails.reduce((sum, rd) => sum + rd.base_price * rd.quantity * nights, 0) * 100
      ) / 100;
      const tax = Math.round(subtotal * 0.15 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;
      const totalRooms = roomDetails.reduce((sum, rd) => sum + rd.quantity, 0);

      // Get hotel details
      const [hotels] = await pool.query<any>(
        `SELECT name, address, city, country, company_id FROM hotels WHERE id = ?`,
        [params.hotelId]
      );
      if (!hotels || hotels.length === 0) throw new Error('Hotel not found');
      const hotel = hotels[0];

      // Build metadata — store full room breakdown for display/reporting
      const metadata = {
        hotelId: params.hotelId,
        hotelName: hotel.name,
        hotelAddress: hotel.address,
        hotelCity: hotel.city,
        hotelCountry: hotel.country,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        nights,
        guests: params.numberOfGuests,
        rooms: roomDetails.map(rd => ({
          roomTypeId: rd.roomTypeId,
          roomName: rd.name,
          quantity: rd.quantity,
          capacityPerRoom: rd.capacity,
          pricePerNight: rd.base_price,
          subtotal: Math.round(rd.base_price * rd.quantity * nights * 100) / 100,
        })),
        totalRooms,
        isDuplicate,
        guestName: `${params.firstName} ${params.lastName}`,
        guestEmail: params.guestEmail,
        guestPhone: params.guestPhone,
      };

      // Insert booking
      await pool.query(
        `INSERT INTO bookings
         (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          bookingId,
          hotel.company_id,
          params.staffUserId,
          'HOTEL',
          'PENDING',
          'USD',
          subtotal,
          tax,
          total,
          JSON.stringify(metadata),
        ]
      );

      // Decrement available_rooms for each room type
      for (const rd of roomDetails) {
        await pool.query(
          `UPDATE room_types SET available_rooms = available_rooms - ? WHERE id = ?`,
          [rd.quantity, rd.roomTypeId]
        );
      }

      // Insert lead guest record
      await pool.query(
        `INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, is_lead_passenger)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [guestId, bookingId, params.firstName, params.lastName, params.guestEmail, params.guestPhone || null]
      );

      let paymentLinkId: string | undefined;
      let paymentLinkUrl: string | undefined;

      if (params.sendPaymentLink) {
        const paymentLink = await paymentLinkService.generatePaymentLink({
          bookingId,
          guestEmail: params.guestEmail,
          amount: total,
          currency: 'USD',
        });
        paymentLinkId = paymentLink.paymentLinkId;
        paymentLinkUrl = paymentLink.url;
        await pool.query(
          `UPDATE bookings SET payment_link_id = ? WHERE id = ?`,
          [paymentLinkId, bookingId]
        );
      }

      // Send confirmation email (best-effort)
      await this.sendBookingConfirmationEmail({
        guestEmail: params.guestEmail,
        guestName: `${params.firstName} ${params.lastName}`,
        bookingId,
        hotelName: hotel.name,
        hotelAddress: `${hotel.address}, ${hotel.city}, ${hotel.country}`,
        roomSummary: roomDetails.map(rd => `${rd.name} × ${rd.quantity}`).join(', '),
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        nights,
        total,
        currency: 'USD',
        paymentLinkUrl,
      });

      return {
        bookingId,
        numberOfRooms: totalRooms,
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

    // Validate each room allocation and accumulate total capacity
    if (!params.rooms || params.rooms.length === 0) {
      errors.push({ field: 'rooms', message: 'At least one room must be selected' });
    } else {
      const pool = getPool();
      let totalCapacity = 0;

      for (const allocation of params.rooms) {
        if (!allocation.roomTypeId || allocation.quantity < 1) {
          errors.push({ field: 'rooms', message: 'Each room allocation must have a valid roomTypeId and quantity ≥ 1' });
          continue;
        }

        const [rows] = await pool.query<any>(
          `SELECT capacity, available_rooms, name FROM room_types WHERE id = ?`,
          [allocation.roomTypeId]
        );

        if (!rows || rows.length === 0) {
          errors.push({ field: 'rooms', message: `Room type '${allocation.roomTypeId}' not found` });
          continue;
        }

        const rt = rows[0];

        if (rt.available_rooms < allocation.quantity) {
          errors.push({
            field: 'rooms',
            message: `Not enough '${rt.name}' rooms available. ` +
              `Requested ${allocation.quantity}, only ${rt.available_rooms} available.`,
          });
        }

        totalCapacity += rt.capacity * allocation.quantity;
      }

      if (errors.length === 0 && totalCapacity < params.numberOfGuests) {
        errors.push({
          field: 'rooms',
          message: `Selected rooms accommodate ${totalCapacity} guest(s) but ${params.numberOfGuests} are needed. Please add more rooms.`,
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
    roomSummary: string;
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
    roomSummary: string;
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
        <div class="row"><span>Rooms</span><span>${params.roomSummary}</span></div>
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
