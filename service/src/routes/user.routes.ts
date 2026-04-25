import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRepository } from '../database/repositories/user.repository';
import { getPool } from '../database/connection';

export const userRoutes = new Router({ prefix: '/users' });

/**
 * GET /api/users/me/bookings/:bookingId
 * Get a single booking by ID for the current user
 */
userRoutes.get('/me/bookings/:bookingId', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { bookingId } = ctx.params;
    const pool = getPool();

    // Fetch the booking with hotel details
    const [bookings] = await pool.query<any>(
      `SELECT 
        b.id,
        b.service_type as serviceType,
        b.status,
        b.currency,
        b.subtotal,
        b.tax,
        b.total,
        b.refund_amount as refundAmount,
        b.refund_reason as refundReason,
        b.refunded_at as refundedAt,
        b.payment_status as paymentStatus,
        b.metadata,
        b.created_at as createdAt,
        b.updated_at as updatedAt,
        b.hotel_id as hotelId,
        h.name as hotelName,
        h.description as hotelDescription,
        h.address as hotelAddress,
        h.city as hotelCity,
        h.state as hotelState,
        h.country as hotelCountry,
        h.zip_code as hotelZipCode,
        h.latitude as hotelLatitude,
        h.longitude as hotelLongitude,
        h.check_in_time as checkInTime,
        h.check_out_time as checkOutTime,
        h.star_rating as starRating,
        h.cancellation_policy as cancellationPolicy,
        h.manasik_score as manasikScore
      FROM bookings b
      LEFT JOIN hotels h ON b.hotel_id = h.id
      WHERE b.id = ? AND b.customer_id = ?`,
      [bookingId, userId]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Booking not found' };
      return;
    }

    const booking = bookings[0];
    const metadata = typeof booking.metadata === 'string' 
      ? JSON.parse(booking.metadata) 
      : booking.metadata || {};

    // Get hotel images
    let hotelImages: any[] = [];
    if (booking.hotelId) {
      const [images] = await pool.query<any>(
        `SELECT image_url as url FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`,
        [booking.hotelId]
      );
      hotelImages = images as any[];
    }

    // Get gate information for this hotel
    let closestGate = null;
    let kaabaGate = null;
    let walkingTimeToHaram = null;
    
    if (booking.hotelId) {
      // Get closest gate (smallest distance)
      const [closestGates] = await pool.query<any>(
        `SELECT hg.name_english, hg.name_arabic, hg.gate_number, hgd.distance_meters, hgd.walking_time_minutes
         FROM hotel_gate_distances hgd
         JOIN haram_gates hg ON hgd.gate_id = hg.id
         WHERE hgd.hotel_id = ?
         ORDER BY hgd.distance_meters ASC
         LIMIT 1`,
        [booking.hotelId]
      );
      
      if (closestGates && closestGates.length > 0) {
        closestGate = {
          nameEnglish: closestGates[0].name_english,
          nameArabic: closestGates[0].name_arabic,
          gateNumber: closestGates[0].gate_number,
          distanceMeters: closestGates[0].distance_meters,
          walkingTimeMinutes: closestGates[0].walking_time_minutes,
        };
        walkingTimeToHaram = closestGates[0].walking_time_minutes;
      }
      
      // Get Kaaba-facing gate (Gate 1 - King Abdul Aziz Gate)
      const [kaabaGates] = await pool.query<any>(
        `SELECT hg.name_english, hg.name_arabic, hg.gate_number, hgd.distance_meters, hgd.walking_time_minutes
         FROM hotel_gate_distances hgd
         JOIN haram_gates hg ON hgd.gate_id = hg.id
         WHERE hgd.hotel_id = ? AND hg.has_direct_kaaba_access = TRUE
         ORDER BY hgd.distance_meters ASC
         LIMIT 1`,
        [booking.hotelId]
      );
      
      if (kaabaGates && kaabaGates.length > 0) {
        kaabaGate = {
          nameEnglish: kaabaGates[0].name_english,
          nameArabic: kaabaGates[0].name_arabic,
          gateNumber: kaabaGates[0].gate_number,
          distanceMeters: kaabaGates[0].distance_meters,
          walkingTimeMinutes: kaabaGates[0].walking_time_minutes,
        };
      }
    }

    // Build full address
    const hotelFullAddress = [
      booking.hotelAddress,
      booking.hotelCity,
      booking.hotelState,
      booking.hotelCountry,
      booking.hotelZipCode
    ].filter(Boolean).join(', ');

    // Determine cancellation info
    const checkInDate = metadata.checkInDate ? new Date(metadata.checkInDate) : null;
    const now = new Date();
    let cancellationDeadline = null;
    let canCancel = false;
    let cancellationFee = null;
    let isRefundable = true;

    if (checkInDate) {
      // Default: Free cancellation up to 24 hours before check-in
      const deadline = new Date(checkInDate);
      deadline.setHours(deadline.getHours() - 24);
      cancellationDeadline = deadline.toISOString();
      canCancel = now < deadline && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
      
      // If within 24 hours, apply cancellation fee (50% of total)
      if (now >= deadline && now < checkInDate) {
        cancellationFee = parseFloat(booking.total) * 0.5;
        canCancel = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
      }
      
      // Non-refundable if already checked in or completed
      if (now >= checkInDate) {
        isRefundable = false;
        canCancel = false;
      }
    }

    // Parse cancellation policy
    const cancellationPolicyText = booking.cancellationPolicy || 'Free cancellation up to 24 hours before check-in';

    ctx.body = {
      booking: {
        id: booking.id,
        referenceNumber: booking.id.substring(0, 8).toUpperCase(),
        serviceType: booking.serviceType,
        status: booking.status,
        currency: booking.currency,
        subtotal: parseFloat(booking.subtotal),
        tax: parseFloat(booking.tax),
        total: parseFloat(booking.total),
        refundAmount: booking.refundAmount ? parseFloat(booking.refundAmount) : null,
        refundReason: booking.refundReason,
        refundedAt: booking.refundedAt,
        paymentStatus: booking.paymentStatus,
        // Hotel info
        hotel: {
          id: booking.hotelId || metadata.hotelId,
          name: booking.hotelName || metadata.hotelName,
          description: booking.hotelDescription,
          address: booking.hotelAddress || metadata.hotelAddress,
          city: booking.hotelCity || metadata.hotelCity,
          state: booking.hotelState,
          country: booking.hotelCountry || metadata.hotelCountry,
          zipCode: booking.hotelZipCode,
          fullAddress: hotelFullAddress || metadata.hotelFullAddress,
          latitude: booking.hotelLatitude ? parseFloat(booking.hotelLatitude) : null,
          longitude: booking.hotelLongitude ? parseFloat(booking.hotelLongitude) : null,
          checkInTime: booking.checkInTime || '14:00',
          checkOutTime: booking.checkOutTime || '11:00',
          starRating: booking.starRating,
          manasikScore: booking.manasikScore ? parseFloat(booking.manasikScore) : null,
          images: hotelImages.map((img: any) => img.url),
        },
        // Proximity info
        proximity: {
          walkingTimeToHaram,
          closestGate,
          kaabaGate,
        },
        // Booking details
        roomType: metadata.roomType,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights: metadata.nights,
        guests: metadata.guests,
        guestName: metadata.guestName,
        guestEmail: metadata.guestEmail,
        guestPhone: metadata.guestPhone,
        specialRequests: metadata.specialRequests,
        // Cancellation info
        cancellation: {
          isRefundable,
          canCancel,
          cancellationDeadline,
          cancellationFee,
          cancellationPolicy: cancellationPolicyText,
        },
        // Timestamps
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch booking' };
  }
});

/**
 * POST /api/users/me/bookings/:bookingId/cancel
 * Request cancellation for a booking
 */
userRoutes.post('/me/bookings/:bookingId/cancel', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { bookingId } = ctx.params;
    // @ts-ignore
    const { reason } = ctx.request.body as any;
    const pool = getPool();

    // Fetch the booking
    const [bookings] = await pool.query<any>(
      `SELECT b.*, h.cancellation_policy 
       FROM bookings b
       LEFT JOIN hotels h ON b.hotel_id = h.id
       WHERE b.id = ? AND b.customer_id = ?`,
      [bookingId, userId]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Booking not found' };
      return;
    }

    const booking = bookings[0];
    const metadata = typeof booking.metadata === 'string' 
      ? JSON.parse(booking.metadata) 
      : booking.metadata || {};

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      ctx.status = 400;
      ctx.body = { error: 'Booking is already cancelled' };
      return;
    }

    if (booking.status === 'COMPLETED') {
      ctx.status = 400;
      ctx.body = { error: 'Cannot cancel a completed booking' };
      return;
    }

    // Calculate refund amount based on cancellation policy
    const checkInDate = metadata.checkInDate ? new Date(metadata.checkInDate) : null;
    const now = new Date();
    let refundAmount = parseFloat(booking.total);
    let refundPercentage = 100;

    if (checkInDate) {
      const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilCheckIn < 0) {
        // Already past check-in, no refund
        refundAmount = 0;
        refundPercentage = 0;
      } else if (hoursUntilCheckIn < 24) {
        // Within 24 hours, 50% refund
        refundAmount = parseFloat(booking.total) * 0.5;
        refundPercentage = 50;
      }
      // More than 24 hours, full refund
    }

    // Update booking status
    await pool.query(
      `UPDATE bookings 
       SET status = 'CANCELLED', 
           refund_amount = ?,
           refund_reason = ?,
           refunded_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [refundAmount, reason || 'Customer requested cancellation', bookingId]
    );

    ctx.body = {
      success: true,
      message: 'Booking cancelled successfully',
      refund: {
        amount: refundAmount,
        percentage: refundPercentage,
        currency: booking.currency,
      },
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to cancel booking' };
  }
});

/**
 * GET /api/users/me/bookings
 * Get bookings for the current user (as a customer)
 * Query parameters:
 *   - date: Filter by date (YYYY-MM-DD format) - returns bookings that check-in, check-out, or are staying over that date (optional)
 */
userRoutes.get('/me/bookings', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { date } = ctx.query;
    const pool = getPool();

    // Build query with optional date filter
    let query = `SELECT 
      b.id,
      b.service_type as serviceType,
      b.status,
      b.currency,
      b.subtotal,
      b.tax,
      b.total,
      b.refund_amount as refundAmount,
      b.refund_reason as refundReason,
      b.refunded_at as refundedAt,
      b.payment_status as paymentStatus,
      b.metadata,
      b.created_at as createdAt,
      b.updated_at as updatedAt,
      b.hotel_id as hotelId,
      h.name as hotelName,
      h.address as hotelAddress,
      h.city as hotelCity,
      h.country as hotelCountry,
      h.check_in_time as checkInTime,
      h.check_out_time as checkOutTime,
      h.star_rating as starRating
    FROM bookings b
    LEFT JOIN hotels h ON b.hotel_id = h.id
    WHERE b.customer_id = ?`;

    const params: any[] = [userId];

    // Filter by date if provided
    // Returns bookings that:
    // 1. Check-in on that date, OR
    // 2. Check-out on that date, OR
    // 3. Are staying over that date (check-in before, check-out after)
    if (date) {
      query += `
        AND (
          DATE(JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.checkInDate'))) = ? OR
          DATE(JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.checkOutDate'))) = ? OR
          (
            DATE(JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.checkInDate'))) < ? AND
            DATE(JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.checkOutDate'))) > ?
          )
        )
      `;
      params.push(date, date, date, date);
    }

    query += ` ORDER BY b.created_at DESC LIMIT 100`;

    // Fetch bookings where user is the customer (not hotel bookings they manage)
    const [bookings] = await pool.query<any>(query, params);

    // For each booking, get the gate information
    const formattedBookings = await Promise.all((bookings as any[]).map(async (booking: any) => {
      const metadata = typeof booking.metadata === 'string' 
        ? JSON.parse(booking.metadata) 
        : booking.metadata || {};
      
      // Fetch hotel name from hotels table if not in metadata or booking (for old bookings)
      let hotelName = booking.hotelName || metadata.hotelName;
      if (!hotelName && (booking.hotelId || metadata.hotelId)) {
        try {
          const [hotelRows] = await pool.query<any>(
            'SELECT name FROM hotels WHERE id = ? LIMIT 1',
            [booking.hotelId || metadata.hotelId]
          );
          if (hotelRows && hotelRows.length > 0) {
            hotelName = hotelRows[0].name;
          }
        } catch (err) {
          console.error('Error fetching hotel name:', err);
        }
      }
      
      // Build full address from hotel table data
      const hotelFullAddress = [booking.hotelAddress, booking.hotelCity, booking.hotelCountry]
        .filter(Boolean)
        .join(', ') || null;
      
      // Get gate information for this hotel
      let closestGate = null;
      let kaabaGate = null;
      
      if (booking.hotelId) {
        // Get closest gate (smallest distance)
        const [closestGates] = await pool.query<any>(
          `SELECT hg.name_english, hg.gate_number, hgd.distance_meters, hgd.walking_time_minutes
           FROM hotel_gate_distances hgd
           JOIN haram_gates hg ON hgd.gate_id = hg.id
           WHERE hgd.hotel_id = ?
           ORDER BY hgd.distance_meters ASC
           LIMIT 1`,
          [booking.hotelId]
        );
        
        if (closestGates && closestGates.length > 0) {
          closestGate = {
            name: closestGates[0].name_english,
            gateNumber: closestGates[0].gate_number,
            distance: closestGates[0].distance_meters,
            walkingTime: closestGates[0].walking_time_minutes,
          };
        }
        
        // Get Kaaba-facing gate (Gate 1 - King Abdul Aziz Gate is the main Kaaba-facing gate)
        const [kaabaGates] = await pool.query<any>(
          `SELECT hg.name_english, hg.gate_number, hgd.distance_meters, hgd.walking_time_minutes
           FROM hotel_gate_distances hgd
           JOIN haram_gates hg ON hgd.gate_id = hg.id
           WHERE hgd.hotel_id = ? AND hg.gate_number = 1
           LIMIT 1`,
          [booking.hotelId]
        );
        
        if (kaabaGates && kaabaGates.length > 0) {
          kaabaGate = {
            name: kaabaGates[0].name_english,
            gateNumber: kaabaGates[0].gate_number,
            distance: kaabaGates[0].distance_meters,
            walkingTime: kaabaGates[0].walking_time_minutes,
          };
        }
      }
      
      // Fetch guests for this booking from guests table
      let guests: any[] = [];
      try {
        const [guestRows] = await pool.query<any>(
          `SELECT id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger 
           FROM guests WHERE booking_id = ? ORDER BY is_lead_passenger DESC`,
          [booking.id]
        );

        guests = (guestRows as any[]).map((g: any) => ({
          id: g.id,
          firstName: g.first_name,
          lastName: g.last_name,
          email: g.email,
          phone: g.phone,
          nationality: g.nationality,
          passportNumber: g.passport_number,
          dateOfBirth: g.date_of_birth,
          isLeadPassenger: g.is_lead_passenger === 1,
        }));
      } catch (err) {
        // Guests table might not exist yet, that's okay
        console.log('Note: guests table query failed, returning empty guests array');
        guests = [];
      }
      
      return {
        id: booking.id,
        serviceType: booking.serviceType,
        status: booking.status,
        currency: booking.currency,
        subtotal: parseFloat(booking.subtotal),
        tax: parseFloat(booking.tax),
        total: parseFloat(booking.total),
        refundAmount: booking.refundAmount ? parseFloat(booking.refundAmount) : null,
        refundReason: booking.refundReason || null,
        refundedAt: booking.refundedAt || null,
        paymentStatus: booking.paymentStatus,
        hotelId: booking.hotelId || metadata.hotelId,
        hotelName: hotelName || 'Unknown Hotel',
        hotelAddress: booking.hotelAddress || metadata.hotelAddress,
        hotelCity: booking.hotelCity || metadata.hotelCity,
        hotelCountry: booking.hotelCountry || metadata.hotelCountry,
        hotelFullAddress: hotelFullAddress || metadata.hotelFullAddress,
        checkInTime: booking.checkInTime || '14:00',
        checkOutTime: booking.checkOutTime || '11:00',
        starRating: booking.starRating,
        closestGate,
        kaabaGate,
        roomType: metadata.roomType,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights: metadata.nights,
        guests: metadata.guests,
        guestDetails: guests,
        metadata,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    }));

    ctx.body = {
      bookings: formattedBookings,
    };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch bookings' };
  }
});

/**
 * GET /api/users/me/earnings
 * Get earnings from hotels owned by the current user (as a host)
 */
userRoutes.get('/me/earnings', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const pool = getPool();

    // First, find the agent record for this user
    const [agents] = await pool.query<any>(
      `SELECT id FROM agents WHERE user_id = ?`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      // User is not a host, return empty earnings
      ctx.body = {
        earnings: [],
        summary: {
          totalCredits: 0,
          pendingCredits: 0,
          availableCredits: 0,
          pendingBookings: 0,
          completedBookings: 0,
        },
      };
      return;
    }

    const agentId = agents[0].id;

    // Get hotels owned by this agent
    const [hotels] = await pool.query<any>(
      `SELECT id, name FROM hotels WHERE agent_id = ?`,
      [agentId]
    );

    if (!hotels || hotels.length === 0) {
      ctx.body = {
        earnings: [],
        summary: {
          totalCredits: 0,
          pendingCredits: 0,
          availableCredits: 0,
          pendingBookings: 0,
          completedBookings: 0,
        },
      };
      return;
    }

    const hotelIds = hotels.map((h: any) => h.id);
    const hotelNames = hotels.reduce((acc: any, h: any) => {
      acc[h.id] = h.name;
      return acc;
    }, {});

    // Fetch bookings for these hotels
    const [bookings] = await pool.query<any>(
      `SELECT 
        b.id,
        b.status,
        b.currency,
        b.total,
        b.payment_status as paymentStatus,
        b.metadata,
        b.created_at as createdAt
      FROM bookings b
      WHERE b.service_type = 'HOTEL'
        AND JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) IN (${hotelIds.map(() => '?').join(',')})
      ORDER BY b.created_at DESC`,
      hotelIds
    );

    const today = new Date();
    let pendingCredits = 0;
    let availableCredits = 0;
    let pendingBookings = 0;
    let completedBookings = 0;

    // Process bookings and calculate credits
    const earnings = (bookings as any[]).map((booking: any) => {
      const metadata = typeof booking.metadata === 'string' 
        ? JSON.parse(booking.metadata) 
        : booking.metadata || {};
      
      const amount = parseFloat(booking.total) || 0;
      const currency = booking.currency || 'USD';
      
      // Convert to GBP then to credits
      let gbpAmount = amount;
      if (currency === 'USD') {
        gbpAmount = amount * 0.79;
      } else if (currency === 'EUR') {
        gbpAmount = amount * 0.86;
      } else if (currency === 'SAR') {
        gbpAmount = amount * 0.21;
      }
      
      const credits = Math.round(gbpAmount * 100);
      
      // Determine status
      let checkOutDate: Date | null = null;
      if (metadata.checkOutDate) {
        checkOutDate = new Date(metadata.checkOutDate);
      }
      
      const isCheckedOut = checkOutDate && checkOutDate < today;
      const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
      const isCancelled = booking.status === 'CANCELLED' || booking.status === 'REFUNDED';
      
      let status = 'PENDING';
      if (isCancelled) {
        status = 'CANCELLED';
      } else if (isCheckedOut && isConfirmed) {
        status = 'AVAILABLE';
        availableCredits += credits;
        completedBookings++;
      } else {
        pendingCredits += credits;
        pendingBookings++;
      }
      
      return {
        id: booking.id,
        bookingId: booking.id,
        hotelId: metadata.hotelId,
        hotelName: metadata.hotelName || hotelNames[metadata.hotelId] || 'Unknown Hotel',
        roomType: metadata.roomType,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights: metadata.nights,
        guests: metadata.guests,
        originalAmount: amount,
        originalCurrency: currency,
        credits,
        status,
        createdAt: booking.createdAt,
      };
    });

    ctx.body = {
      earnings,
      summary: {
        totalCredits: pendingCredits + availableCredits,
        pendingCredits,
        availableCredits,
        pendingBookings,
        completedBookings,
      },
    };
  } catch (error) {
    console.error('Error fetching user earnings:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch earnings' };
  }
});

/**
 * GET /api/users/me/broker-bookings
 * Get bookings made by the current user as a broker/agent on behalf of customers
 */
userRoutes.get('/me/broker-bookings', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const pool = getPool();

    // First, find the agent record for this user
    const [agents] = await pool.query<any>(
      `SELECT id, name, email FROM agents WHERE user_id = ?`,
      [userId]
    );

    if (!agents || agents.length === 0) {
      // User is not a broker/agent, return empty bookings
      ctx.body = {
        bookings: [],
      };
      return;
    }

    const agentId = agents[0].id;

    // Fetch bookings where this agent made the booking
    const [bookings] = await pool.query<any>(
      `SELECT 
        b.id,
        b.service_type as serviceType,
        b.status,
        b.currency,
        b.subtotal,
        b.tax,
        b.total,
        b.payment_status as paymentStatus,
        b.booking_source as bookingSource,
        b.customer_id as customerId,
        b.hold_expires_at as holdExpiresAt,
        b.metadata,
        b.created_at as createdAt,
        b.updated_at as updatedAt,
        u.first_name as customerFirstName,
        u.last_name as customerLastName,
        u.email as customerEmail
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      WHERE b.agent_id = ?
      ORDER BY b.created_at DESC
      LIMIT 100`,
      [agentId]
    );

    // Parse metadata and format bookings
    const formattedBookings = (bookings as any[]).map((booking: any) => {
      const metadata = typeof booking.metadata === 'string' 
        ? JSON.parse(booking.metadata) 
        : booking.metadata || {};
      
      return {
        id: booking.id,
        serviceType: booking.serviceType,
        status: booking.status,
        currency: booking.currency,
        subtotal: parseFloat(booking.subtotal),
        tax: parseFloat(booking.tax),
        total: parseFloat(booking.total),
        paymentStatus: booking.paymentStatus,
        bookingSource: booking.bookingSource || 'AGENT',
        customerId: booking.customerId,
        customerName: booking.customerFirstName && booking.customerLastName 
          ? `${booking.customerFirstName} ${booking.customerLastName}` 
          : null,
        customerEmail: booking.customerEmail,
        hotelName: metadata.hotelName,
        roomType: metadata.roomType,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights: metadata.nights,
        guests: metadata.guests,
        guestName: metadata.guestName,
        guestEmail: metadata.guestEmail,
        holdExpiresAt: booking.holdExpiresAt,
        metadata,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    ctx.body = {
      bookings: formattedBookings,
    };
  } catch (error) {
    console.error('Error fetching broker bookings:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch broker bookings' };
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
userRoutes.get('/:id', async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    const { id } = ctx.params;
    const user = await userRepository.findById(id);

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }

    ctx.body = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch user' };
  }
});

/**
 * PUT /api/users/:id
 * Update user (authenticated)
 */
userRoutes.put('/:id', authMiddleware, async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    const userId = (ctx.state as any).userId;
    const { id } = ctx.params;

    // Users can only update their own profile
    if (userId !== id) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
      return;
    }

    // @ts-ignore
    const body = ctx.request.body as any;
    const { firstName, lastName } = body;
    const user = await userRepository.findById(id);

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }

    const updated = await userRepository.update(id, {
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      updated_at: new Date(),
    });

    if (!updated) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to update user' };
      return;
    }

    ctx.body = {
      message: 'User updated successfully',
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to update user' };
  }
});


