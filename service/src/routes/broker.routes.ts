/**
 * Broker Routes
 * 
 * API endpoints for broker booking operations
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import { brokerBookingService } from '../services/broker-booking.service';
import { getPool } from '../database/connection';

export const brokerRoutes = new Router({ prefix: '/broker' });

/**
 * POST /api/broker/bookings
 * Create a new broker booking on behalf of a customer
 */
brokerRoutes.post('/bookings', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const pool = getPool();

    // Get the agent record for this user
    const [agents] = await pool.query<any>(
      `SELECT id, name, email FROM agents WHERE user_id = ?`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      ctx.status = 403;
      ctx.body = { error: 'You must be a registered broker to create bookings' };
      return;
    }

    const agent = agents[0];
    const body = (ctx.request as any).body;

    const {
      customerEmail,
      customerName,
      customerPhone,
      hotelId,
      hotelName,
      roomTypeId,
      roomName,
      checkIn,
      checkOut,
      nights,
      guests,
      basePrice,
      currency,
      brokerNotes,
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !hotelId || !roomTypeId || !checkIn || !checkOut) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields' };
      return;
    }

    const result = await brokerBookingService.createBrokerBooking({
      brokerId: userId,
      brokerAgentId: agent.id,
      customerEmail,
      customerName,
      customerPhone,
      hotelId,
      hotelName,
      roomTypeId,
      roomName,
      checkIn,
      checkOut,
      nights: nights || 1,
      guests: guests || 1,
      basePrice: basePrice || 100,
      currency: currency || 'GBP',
      brokerNotes,
    });

    ctx.status = 201;
    ctx.body = {
      message: 'Booking created successfully. Payment link sent to customer.',
      booking: result,
    };
  } catch (error: any) {
    console.error('Error creating broker booking:', error);
    ctx.status = 500;
    ctx.body = { error: error.message || 'Failed to create booking' };
  }
});

/**
 * POST /api/broker/bookings/:id/resend-payment
 * Resend payment link for a pending booking
 */
brokerRoutes.post('/bookings/:id/resend-payment', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { id: bookingId } = ctx.params;
    const pool = getPool();

    // Verify the broker owns this booking
    const [agents] = await pool.query<any>(
      `SELECT id FROM agents WHERE user_id = ?`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      ctx.status = 403;
      ctx.body = { error: 'You must be a registered broker' };
      return;
    }

    const [bookings] = await pool.query<any>(
      `SELECT * FROM bookings WHERE id = ? AND agent_id = ?`,
      [bookingId, agents[0].id]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Booking not found or you do not have permission' };
      return;
    }

    const result = await brokerBookingService.resendPaymentLink(bookingId);

    ctx.body = {
      message: 'Payment link resent successfully',
      booking: result,
    };
  } catch (error: any) {
    console.error('Error resending payment link:', error);
    ctx.status = 500;
    ctx.body = { error: error.message || 'Failed to resend payment link' };
  }
});

/**
 * GET /api/broker/bookings/:id/payment-confirmation
 * Get payment confirmation details for QR code printout
 */
brokerRoutes.get('/bookings/:id/payment-confirmation', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { id: bookingId } = ctx.params;
    const pool = getPool();

    // Verify the broker owns this booking
    const [agents] = await pool.query<any>(
      `SELECT id FROM agents WHERE user_id = ?`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      ctx.status = 403;
      ctx.body = { error: 'You must be a registered broker' };
      return;
    }

    const [bookings] = await pool.query<any>(
      `SELECT * FROM bookings WHERE id = ? AND agent_id = ?`,
      [bookingId, agents[0].id]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Booking not found or you do not have permission' };
      return;
    }

    const result = await brokerBookingService.getPaymentConfirmation(bookingId);

    ctx.body = result;
  } catch (error: any) {
    console.error('Error getting payment confirmation:', error);
    ctx.status = 500;
    ctx.body = { error: error.message || 'Failed to get payment confirmation' };
  }
});

/**
 * GET /api/broker/hotels
 * Get available hotels for broker booking
 */
brokerRoutes.get('/hotels', authMiddleware, async (ctx: Context) => {
  try {
    const pool = getPool();
    const { search, city, limit = 20, offset = 0 } = ctx.query;

    let query = `
      SELECT 
        h.id,
        h.name,
        h.description,
        h.address,
        h.city,
        h.country,
        h.star_rating,
        (SELECT image_url FROM hotel_images WHERE hotel_id = h.id ORDER BY display_order LIMIT 1) as image
      FROM hotels h
      WHERE h.status = 'ACTIVE'
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (h.name LIKE ? OR h.city LIKE ? OR h.country LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (city) {
      query += ` AND h.city = ?`;
      params.push(city);
    }

    query += ` ORDER BY h.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [hotels] = await pool.query<any>(query, params);

    ctx.body = {
      hotels: hotels.map((h: any) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        address: h.address,
        city: h.city,
        country: h.country,
        starRating: h.star_rating,
        image: h.image,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch hotels' };
  }
});

/**
 * GET /api/broker/hotels/:id/rooms
 * Get available rooms for a hotel
 */
brokerRoutes.get('/hotels/:id/rooms', authMiddleware, async (ctx: Context) => {
  try {
    const { id: hotelId } = ctx.params;
    const { checkIn, checkOut } = ctx.query;
    const pool = getPool();

    // Get hotel info
    const [hotels] = await pool.query<any>(
      `SELECT id, name, city, country FROM hotels WHERE id = ?`,
      [hotelId]
    );

    if (!hotels || hotels.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
      return;
    }

    // Get room types
    const [rooms] = await pool.query<any>(
      `SELECT 
        rt.id,
        rt.name,
        rt.description,
        rt.capacity,
        rt.base_price,
        rt.currency,
        rt.available_rooms,
        (SELECT image_url FROM room_images WHERE room_type_id = rt.id ORDER BY display_order LIMIT 1) as image
      FROM room_types rt
      WHERE rt.hotel_id = ? AND rt.status = 'ACTIVE' AND rt.available_rooms > 0
      ORDER BY rt.base_price`,
      [hotelId]
    );

    ctx.body = {
      hotel: {
        id: hotels[0].id,
        name: hotels[0].name,
        city: hotels[0].city,
        country: hotels[0].country,
      },
      rooms: rooms.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        capacity: r.capacity,
        basePrice: parseFloat(r.base_price),
        currency: r.currency || 'GBP',
        availableRooms: r.available_rooms,
        image: r.image,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch rooms' };
  }
});

/**
 * POST /api/broker/release-expired
 * Release expired booking holds (can be called by cron job)
 */
brokerRoutes.post('/release-expired', async (ctx: Context) => {
  try {
    const released = await brokerBookingService.releaseExpiredHolds();
    ctx.body = {
      message: `Released ${released} expired booking holds`,
      count: released,
    };
  } catch (error: any) {
    console.error('Error releasing expired holds:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to release expired holds' };
  }
});
