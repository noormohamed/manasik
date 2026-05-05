/**
 * Broker Booking Routes
 *
 * Endpoints for broker-specific booking operations,
 * including fetching active hotels for broker mode.
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware';
import { getPool } from '../database/connection';
import { AnalyticsEventEmitter } from '../websocket/analytics-events';

export const brokerBookingRoutes = new Router({ prefix: '/broker-bookings' });

/**
 * GET /api/broker-bookings/active-hotels
 * Returns all active hotels for broker hotel selection.
 * Requires authentication but no ownership check.
 */
brokerBookingRoutes.get('/active-hotels', authMiddleware, async (ctx: Context) => {
  try {
    const pool = getPool();

    const [hotels] = await pool.query<any>(
      `SELECT id, name FROM hotels WHERE status = 'ACTIVE' ORDER BY name`
    );

    ctx.body = {
      hotels: (hotels || []).map((h: any) => ({
        id: h.id,
        name: h.name,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching active hotels:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch active hotels' };
  }
});

/**
 * POST /api/broker-bookings/create
 * Create a booking on behalf of a customer as a broker.
 *
 * Authentication: Required (user must have an agent record)
 *
 * Request body:
 * {
 *   hotelId: string;
 *   checkInDate: string;       // YYYY-MM-DD
 *   checkOutDate: string;      // YYYY-MM-DD
 *   rooms: Array<{ roomTypeId: string; quantity: number }>;
 *   guests: Array<{
 *     firstName: string;
 *     lastName: string;
 *     email: string;
 *     phone?: string;
 *     nationality?: string;
 *     passportNumber?: string;
 *     dateOfBirth?: string;
 *     isLead: boolean;
 *   }>;
 *   brokerNotes?: string;
 *   currency?: string;         // defaults to 'USD'
 * }
 */
brokerBookingRoutes.post('/create', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const pool = getPool();

    // 1. Look up the broker's agent record
    const [agents] = await pool.query<any>(
      `SELECT id, name, email FROM agents WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: 'No agent record found. You must be a registered broker to create broker bookings.',
      };
      return;
    }

    const agent = agents[0];

    // 2. Extract and validate request body
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      rooms,
      guests,
      brokerNotes,
      brokerFee,
      currency,
    } = (ctx.request as any).body as any;

    const bookingCurrency = currency || 'USD';
    const parsedBrokerFee = Math.round((parseFloat(brokerFee) || 0) * 100) / 100;

    // Validate required fields
    const missingRooms = !rooms || !Array.isArray(rooms) || rooms.length === 0;
    const missingGuests = !guests || !Array.isArray(guests) || guests.length === 0;

    // Find the lead guest
    const leadGuest = !missingGuests ? guests.find((g: any) => g.isLead) || guests[0] : null;

    const validationErrors: Array<{ field: string; message: string }> = [];

    if (!hotelId) validationErrors.push({ field: 'hotelId', message: 'Hotel ID is required' });
    if (!checkInDate) validationErrors.push({ field: 'checkInDate', message: 'Check-in date is required' });
    if (!checkOutDate) validationErrors.push({ field: 'checkOutDate', message: 'Check-out date is required' });
    if (missingRooms) validationErrors.push({ field: 'rooms', message: 'At least one room must be selected' });
    if (missingGuests) validationErrors.push({ field: 'guests', message: 'At least one guest is required' });

    if (leadGuest) {
      if (!leadGuest.firstName) validationErrors.push({ field: 'guests.firstName', message: 'Lead guest first name is required' });
      if (!leadGuest.lastName) validationErrors.push({ field: 'guests.lastName', message: 'Lead guest last name is required' });
      if (!leadGuest.email) validationErrors.push({ field: 'guests.email', message: 'Lead guest email is required' });
      if (!leadGuest.phone) validationErrors.push({ field: 'guests.phone', message: 'Lead guest phone is required' });
    }

    if (validationErrors.length > 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Missing required fields',
        details: validationErrors,
      };
      return;
    }

    // 3. Verify the hotel exists and is active
    const [hotelRows] = await pool.query<any>(
      `SELECT id, name, company_id, status FROM hotels WHERE id = ?`,
      [hotelId]
    );

    if (!hotelRows || hotelRows.length === 0) {
      ctx.status = 404;
      ctx.body = { success: false, error: 'Hotel not found' };
      return;
    }

    const hotel = hotelRows[0];

    if (hotel.status !== 'ACTIVE') {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Hotel is not currently active' };
      return;
    }

    // 4. Fetch room type details and calculate pricing
    const roomDetails: Array<{
      roomTypeId: string;
      name: string;
      base_price: number;
      capacity: number;
      available_rooms: number;
      quantity: number;
    }> = [];

    for (const allocation of rooms) {
      const [rtRows] = await pool.query<any>(
        `SELECT id, name, base_price, capacity, available_rooms
         FROM room_types WHERE id = ? AND hotel_id = ?`,
        [allocation.roomTypeId, hotelId]
      );

      if (!rtRows || rtRows.length === 0) {
        ctx.status = 400;
        ctx.body = { success: false, error: `Room type '${allocation.roomTypeId}' not found for this hotel` };
        return;
      }

      const rt = rtRows[0];
      if (rt.available_rooms < allocation.quantity) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Not enough '${rt.name}' rooms available. Requested ${allocation.quantity}, only ${rt.available_rooms} available.`,
        };
        return;
      }

      roomDetails.push({ ...rt, roomTypeId: allocation.roomTypeId, quantity: allocation.quantity });
    }

    // Calculate nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Check-out date must be after check-in date' };
      return;
    }

    // Calculate pricing: subtotal, tax (10%), broker fee, total
    const subtotal = Math.round(
      roomDetails.reduce((sum, rd) => sum + rd.base_price * rd.quantity * nights, 0) * 100
    ) / 100;
    const tax = Math.round(subtotal * 0.10 * 100) / 100;
    const total = Math.round((subtotal + tax + parsedBrokerFee) * 100) / 100;
    const totalRooms = roomDetails.reduce((sum, rd) => sum + rd.quantity, 0);
    const numberOfGuests = guests.length;

    const guestName = `${leadGuest.firstName} ${leadGuest.lastName}`;
    const guestEmail = leadGuest.email;
    const guestPhone = leadGuest.phone || '';

    // Build metadata
    const metadata = {
      hotelId,
      hotelName: hotel.name,
      roomType: roomDetails.map((rd: any) => rd.name).join(', '),
      rooms: roomDetails.map((rd: any) => ({
        roomTypeId: rd.roomTypeId,
        roomName: rd.name,
        quantity: rd.quantity,
        pricePerNight: rd.base_price,
        subtotal: Math.round(rd.base_price * rd.quantity * nights * 100) / 100,
      })),
      totalRooms,
      checkInDate,
      checkOutDate,
      nights,
      guests: numberOfGuests,
      guestName,
      guestEmail,
      guestPhone,
      brokerFee: parsedBrokerFee,
    };

    const bookingId = uuidv4();

    // 5. Insert the booking record
    await pool.query(
      `INSERT INTO bookings
       (id, company_id, customer_id, service_type, booking_source, agent_id,
        status, payment_status, currency, subtotal, tax, total, metadata,
        broker_notes, broker_fee, created_at, updated_at)
       VALUES (?, ?, ?, 'HOTEL', 'BROKER', ?, 'PENDING', 'PENDING', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        bookingId,
        hotel.company_id,
        userId,           // customer_id = broker's own user ID
        agent.id,         // agent_id = broker's agent record
        bookingCurrency,
        subtotal,
        tax,
        total,
        JSON.stringify(metadata),
        brokerNotes || null,
        parsedBrokerFee,
      ]
    );

    // 6. Insert all guests into the guests table
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      const isLead = guest.isLead || i === 0;
      const guestId = uuidv4();

      await pool.query(
        `INSERT INTO guests
         (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          guestId,
          bookingId,
          guest.firstName,
          guest.lastName,
          guest.email,
          guest.phone || null,
          guest.nationality || null,
          guest.passportNumber || null,
          guest.dateOfBirth || null,
          isLead ? 1 : 0,
        ]
      );
    }

    // Decrement available rooms
    for (const rd of roomDetails) {
      await pool.query(
        `UPDATE room_types SET available_rooms = available_rooms - ? WHERE id = ?`,
        [rd.quantity, rd.roomTypeId]
      );
    }

    // 7. Return success response
    ctx.status = 201;
    ctx.body = {
      success: true,
      booking: {
        id: bookingId,
        status: 'PENDING',
        guestName,
        guestEmail,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        createdAt: new Date().toISOString(),
      },
      message: 'Broker booking created successfully',
    };

    // Emit analytics event for broker booking creation
    try {
      AnalyticsEventEmitter.getInstance().emitBookingCreated({
        bookingId: bookingId as any,
        source: 'BROKER',
        amount: total,
        status: 'PENDING',
      });
    } catch (e) {
      console.error('Failed to emit booking:created analytics event for broker booking:', e);
    }
  } catch (error: any) {
    console.error('Error creating broker booking:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message || 'Failed to create broker booking',
    };
  }
});

/**
 * PATCH /api/broker-bookings/:id
 * Update a broker booking (dates, guests, broker fee, broker notes).
 * Only the broker who created the booking can edit it.
 * Only PENDING or CONFIRMED bookings can be edited.
 */
brokerBookingRoutes.patch('/:id', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { id: bookingId } = ctx.params;
    const pool = getPool();

    // 1. Look up the broker's agent record
    const [agents] = await pool.query<any>(
      `SELECT id FROM agents WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      ctx.status = 403;
      ctx.body = { success: false, error: 'No agent record found.' };
      return;
    }

    const agentId = agents[0].id;

    // 2. Fetch the booking and verify ownership
    const [bookings] = await pool.query<any>(
      `SELECT id, status, booking_source, agent_id, metadata, subtotal, tax, total, broker_fee, currency
       FROM bookings WHERE id = ? LIMIT 1`,
      [bookingId]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = { success: false, error: 'Booking not found' };
      return;
    }

    const booking = bookings[0];

    if (booking.booking_source !== 'BROKER' || booking.agent_id !== agentId) {
      ctx.status = 403;
      ctx.body = { success: false, error: 'You can only edit bookings you created as a broker' };
      return;
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      ctx.status = 400;
      ctx.body = { success: false, error: `Cannot edit a booking with status '${booking.status}'` };
      return;
    }

    // 3. Extract updatable fields
    const body = (ctx.request as any).body as any;
    const {
      checkInDate,
      checkOutDate,
      brokerNotes,
      brokerFee,
      guests: updatedGuests,
    } = body;

    const updates: string[] = [];
    const updateParams: any[] = [];
    let metadata = typeof booking.metadata === 'string' ? JSON.parse(booking.metadata) : (booking.metadata || {});
    let needsRecalc = false;

    // Update dates
    if (checkInDate !== undefined && checkOutDate !== undefined) {
      metadata.checkInDate = checkInDate;
      metadata.checkOutDate = checkOutDate;
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (nights <= 0) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'Check-out date must be after check-in date' };
        return;
      }
      metadata.nights = nights;
      needsRecalc = true;
    }

    // Update broker notes
    if (brokerNotes !== undefined) {
      updates.push('broker_notes = ?');
      updateParams.push(brokerNotes || null);
    }

    // Update broker fee
    const parsedBrokerFee = brokerFee !== undefined ? Math.round((parseFloat(brokerFee) || 0) * 100) / 100 : parseFloat(booking.broker_fee) || 0;
    if (brokerFee !== undefined) {
      updates.push('broker_fee = ?');
      updateParams.push(parsedBrokerFee);
      metadata.brokerFee = parsedBrokerFee;
      needsRecalc = true;
    }

    // Recalculate totals if needed
    if (needsRecalc) {
      const nights = metadata.nights || 1;
      const rooms = metadata.rooms || [];
      const subtotal = Math.round(
        rooms.reduce((sum: number, r: any) => sum + (r.pricePerNight || 0) * (r.quantity || 1) * nights, 0) * 100
      ) / 100;
      const tax = Math.round(subtotal * 0.10 * 100) / 100;
      const total = Math.round((subtotal + tax + parsedBrokerFee) * 100) / 100;

      updates.push('subtotal = ?', 'tax = ?', 'total = ?');
      updateParams.push(subtotal, tax, total);
    }

    // Always update metadata
    updates.push('metadata = ?');
    updateParams.push(JSON.stringify(metadata));

    updates.push('updated_at = NOW()');

    // 4. Update guests if provided
    if (updatedGuests && Array.isArray(updatedGuests) && updatedGuests.length > 0) {
      // Delete existing guests and re-insert
      await pool.query('DELETE FROM guests WHERE booking_id = ?', [bookingId]);

      for (let i = 0; i < updatedGuests.length; i++) {
        const guest = updatedGuests[i];
        const isLead = guest.isLead || i === 0;
        const guestId = uuidv4();

        await pool.query(
          `INSERT INTO guests
           (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            guestId,
            bookingId,
            guest.firstName,
            guest.lastName,
            guest.email,
            guest.phone || null,
            guest.nationality || null,
            guest.passportNumber || null,
            guest.dateOfBirth || null,
            isLead ? 1 : 0,
          ]
        );
      }

      // Update metadata guest info
      const leadGuest = updatedGuests.find((g: any) => g.isLead) || updatedGuests[0];
      metadata.guestName = `${leadGuest.firstName} ${leadGuest.lastName}`;
      metadata.guestEmail = leadGuest.email;
      metadata.guestPhone = leadGuest.phone || '';
      metadata.guests = updatedGuests.length;
    }

    // 5. Execute the update
    updateParams.push(bookingId);
    await pool.query(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    );

    ctx.body = {
      success: true,
      message: 'Booking updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating broker booking:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message || 'Failed to update broker booking',
    };
  }
});
