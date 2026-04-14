import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRepository } from '../database/repositories/user.repository';
import { getPool } from '../database/connection';

export const userRoutes = new Router({ prefix: '/users' });

/**
 * GET /api/users/me/bookings
 * Get bookings for the current user (as a customer)
 */
userRoutes.get('/me/bookings', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const pool = getPool();

    // Fetch bookings where user is the customer
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
        b.metadata,
        b.created_at as createdAt,
        b.updated_at as updatedAt
      FROM bookings b
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
      LIMIT 100`,
      [userId]
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
        hotelName: metadata.hotelName,
        roomType: metadata.roomType,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights: metadata.nights,
        guests: metadata.guests,
        metadata,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

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
