/**
 * Staff Booking Routes
 * Endpoints for hotel staff to create bookings on behalf of guests
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import { bookingService } from '../services/booking.service';
import { paymentLinkService } from '../services/payment-link.service';
import { getPool } from '../database/connection';

export const staffBookingRoutes = new Router({ prefix: '/staff-bookings' });

/**
 * POST /api/staff-bookings/create-on-behalf
 * Create a booking on behalf of a guest
 * 
 * Authentication: Required (Hotel Manager or Agent role)
 * 
 * Request body:
 * {
 *   hotelId: string;
 *   guestEmail: string;
 *   firstName: string;
 *   lastName: string;
 *   guestPhone?: string;
 *   checkInDate: string;        // YYYY-MM-DD
 *   checkOutDate: string;       // YYYY-MM-DD
 *   roomTypeId: string;
 *   numberOfGuests: number;
 *   sendPaymentLink: boolean;
 * }
 */
staffBookingRoutes.post('/create-on-behalf', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const {
      hotelId,
      guestEmail,
      firstName,
      lastName,
      guestPhone,
      checkInDate,
      checkOutDate,
      rooms,
      numberOfGuests,
      sendPaymentLink,
    } = (ctx.request as any).body as any;

    // Validate required fields
    const missingRooms = !rooms || !Array.isArray(rooms) || rooms.length === 0;
    if (!hotelId || !guestEmail || !firstName || !lastName || !checkInDate || !checkOutDate || missingRooms || numberOfGuests === undefined) {
      ctx.status = 400;
      ctx.body = {
        data: {
          success: false,
          error: 'Missing required fields',
          details: [
            !hotelId && { field: 'hotelId', message: 'Hotel ID is required' },
            !guestEmail && { field: 'guestEmail', message: 'Guest email is required' },
            !firstName && { field: 'firstName', message: 'First name is required' },
            !lastName && { field: 'lastName', message: 'Last name is required' },
            !checkInDate && { field: 'checkInDate', message: 'Check-in date is required' },
            !checkOutDate && { field: 'checkOutDate', message: 'Check-out date is required' },
            missingRooms && { field: 'rooms', message: 'At least one room must be selected' },
            numberOfGuests === undefined && { field: 'numberOfGuests', message: 'Number of guests is required' },
          ].filter(Boolean),
        },
      };
      return;
    }

    // Check authorization - verify staff has access to this hotel
    // User can manage hotel if they are: company admin, hotel agent, or agent user
    const pool = getPool();
    const [hotelAccess] = await pool.query<any>(
      `SELECT h.id FROM hotels h
       LEFT JOIN company_admins ca ON h.company_id = ca.company_id AND ca.user_id = ?
       LEFT JOIN agents a ON h.agent_id = a.id
       WHERE h.id = ? AND (ca.user_id = ? OR h.agent_id = ? OR a.user_id = ?)`,
      [userId, hotelId, userId, userId, userId]
    );

    if (!hotelAccess || hotelAccess.length === 0) {
      ctx.status = 403;
      ctx.body = {
        data: {
          success: false,
          error: 'Not authorized to create bookings for this hotel',
        },
      };
      return;
    }

    // Create booking
    const result = await bookingService.createBookingOnBehalf({
      hotelId,
      staffUserId: userId,
      guestEmail,
      firstName,
      lastName,
      guestPhone,
      checkInDate,
      checkOutDate,
      rooms,
      numberOfGuests,
      sendPaymentLink,
    });

    ctx.status = 201;
    ctx.body = {
      data: {
        success: true,
        booking: {
          id: result.bookingId,
          status: 'PENDING',
          guestName: `${firstName} ${lastName}`,
          guestEmail,
          checkInDate,
          checkOutDate,
          rooms,
          numberOfGuests,
          numberOfRooms: result.numberOfRooms,
          createdAt: new Date().toISOString(),
        },
        paymentLink: result.paymentLinkUrl
          ? {
              id: result.paymentLinkId,
              url: result.paymentLinkUrl,
            }
          : undefined,
        message: 'Booking created successfully',
      },
    };
  } catch (error: any) {
    console.error('Error creating booking on behalf:', error);

    // Check if error is validation errors
    if (error.message && error.message.startsWith('[')) {
      try {
        const errors = JSON.parse(error.message);
        ctx.status = 422;
        ctx.body = {
          data: {
            success: false,
            error: 'Validation failed',
            details: errors,
          },
        };
        return;
      } catch (e) {
        // Not JSON, continue with generic error
      }
    }

    ctx.status = 500;
    ctx.body = {
      data: {
        success: false,
        error: error.message || 'Failed to create booking',
      },
    };
  }
});

/**
 * POST /api/staff-bookings/resend-payment-link
 * Resend payment link to guest
 * 
 * Authentication: Required (Hotel Manager or Agent role)
 * 
 * Request body:
 * {
 *   bookingId: string;
 * }
 */
staffBookingRoutes.post('/resend-payment-link', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { bookingId } = (ctx.request as any).body as any;

    if (!bookingId) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Booking ID is required',
      };
      return;
    }

    // Verify staff has access to this booking's hotel
    const pool = getPool();
    const [bookings] = await pool.query<any>(
      `SELECT b.id, b.hotel_id, h.agent_id FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = {
        data: {
          success: false,
          error: 'Booking not found',
        },
      };
      return;
    }

    const booking = bookings[0];

    if (booking.agent_id !== userId) {
      ctx.status = 403;
      ctx.body = {
        data: {
          success: false,
          error: 'Not authorized to resend payment link for this booking',
        },
      };
      return;
    }

    // Resend payment link
    const result = await paymentLinkService.resendPaymentLink(bookingId);

    ctx.status = 200;
    ctx.body = {
      data: {
        success: true,
        paymentLink: {
          id: result.paymentLinkId,
          url: result.url,
          expiresAt: result.expiresAt.toISOString(),
        },
        message: 'Payment link resent successfully',
      },
    };
  } catch (error: any) {
    console.error('Error resending payment link:', error);

    ctx.status = 500;
    ctx.body = {
      data: {
        success: false,
        error: error.message || 'Failed to resend payment link',
      },
    };
  }
});
