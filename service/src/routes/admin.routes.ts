/**
 * Admin Routes - Super Admin Panel API endpoints
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { Database } from '../database/connection';
import { adminAuthService } from '../services/admin-auth.service';
import { createAdminAuditService } from '../services/admin-audit.service';

const router = new Router({ prefix: '/api/admin' });

// Initialize database and services
let db: Database;
let auditService: any;

export const initializeAdminRoutes = (database: Database) => {
  db = database;
  auditService = createAdminAuditService(database);
};

/**
 * GET /api/admin/users/me
 * Get current admin user info
 */
router.get('/users/me', async (ctx: any) => {
  try {
    const authHeader = ctx.get('authorization');
    console.log('Auth header:', authHeader);
    const token = adminAuthService.extractToken(authHeader);
    console.log('Extracted token:', token ? 'present' : 'missing');

    if (!token) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'No token provided',
      };
      return;
    }

    const payload = adminAuthService.verifyAccessToken(token);
    console.log('Token payload:', payload);

    if (!payload) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid or expired token',
      };
      return;
    }

    // Get admin user from database
    const query = 'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = ?';
    const users = await db.query(query, [payload.adminUserId]);
    console.log('Query result:', users);

    if (users.length === 0) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Admin user not found',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: users[0],
    };
  } catch (error) {
    console.error('Get current user error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
      debug: error instanceof Error ? error.message : String(error),
    };
  }
});

/**
 * POST /api/admin/auth/login
 * Admin login endpoint
 */
router.post('/auth/login', async (ctx: any) => {
  try {
    console.log('Login endpoint called, db initialized:', !!db);
    if (!db) {
      console.log('ERROR: db is null!');
      ctx.body = { error: 'Database not initialized' };
      return;
    }
    const { email, password } = ctx.request.body as { email: string; password: string };

    // Validate input
    if (!email || !password) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Email and password are required',
      };
      return;
    }

    // Get admin user from database (use users table, filter by admin roles)
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = ? AND role IN (?, ?)';
    const users = await db.query(query, [email, 1, 'SUPER_ADMIN', 'COMPANY_ADMIN']);

    if (users.length === 0) {
      // Log failed login attempt
      await auditService.logAction({
        admin_user_id: 0,
        action_type: 'LOGIN_FAILED',
        entity_type: 'ADMIN_USER',
        reason: 'Invalid email or password',
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });

      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid email or password',
      };
      return;
    }

    const adminUser = users[0];

    // Verify password
    const passwordValid = await adminAuthService.comparePassword(password, adminUser.password_hash);

    if (!passwordValid) {
      // Log failed login attempt
      await auditService.logAction({
        admin_user_id: adminUser.id,
        action_type: 'LOGIN_FAILED',
        entity_type: 'ADMIN_USER',
        reason: 'Invalid password',
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });

      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid email or password',
      };
      return;
    }

    // Generate tokens (sessionId is 0 since we're not using admin_sessions table)
    const tokens = adminAuthService.generateTokens(adminUser, 0);

    // Log successful login
    await auditService.logAction({
      admin_user_id: adminUser.id,
      action_type: 'LOGIN',
      entity_type: 'ADMIN_USER',
      ip_address: ctx.ip,
      user_agent: ctx.get('user-agent'),
    });

    ctx.body = {
      success: true,
      requiresMFA: false,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 86400, // 24 hours
    };
  } catch (error) {
    console.error('Login error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/auth/verify-mfa
 * Verify MFA code and complete login
 */
router.post('/auth/verify-mfa', async (ctx: any) => {
  try {
    const { mfaCode, tempToken } = ctx.request.body as { mfaCode: string; tempToken: string };

    // Validate input
    if (!mfaCode || !tempToken) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'MFA code and temp token are required',
      };
      return;
    }

    // Verify temp token
    const payload = adminAuthService.verifyAccessToken(tempToken);

    if (!payload) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid or expired temp token',
      };
      return;
    }

    // Get admin user
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = ? AND role IN (?, ?)';
    const users = await db.query(query, [payload.adminUserId, 1, 'SUPER_ADMIN', 'COMPANY_ADMIN']);

    if (users.length === 0) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Admin user not found',
      };
      return;
    }

    const adminUser = users[0];

    // Verify MFA code
    if (!adminUser.mfa_secret) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'MFA is not configured for this user',
      };
      return;
    }

    const mfaValid = adminAuthService.verifyMFACode(adminUser.mfa_secret, mfaCode);

    if (!mfaValid) {
      // Log failed MFA attempt
      await auditService.logAction({
        admin_user_id: adminUser.id,
        action_type: 'MFA_FAILED',
        entity_type: 'ADMIN_USER',
        reason: 'Invalid MFA code',
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });

      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid MFA code',
      };
      return;
    }

    // Create session
    const tokenHash = adminAuthService.generateTokenHash(Math.random().toString());
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const sessionQuery = `
      INSERT INTO admin_sessions (admin_user_id, token_hash, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const sessionResult = await db.query(sessionQuery, [
      adminUser.id,
      tokenHash,
      ctx.ip,
      ctx.get('user-agent'),
      expiresAt,
    ]);

    const sessionId = sessionResult.insertId;

    // Generate tokens
    const tokens = adminAuthService.generateTokens(adminUser, sessionId);

    // Update last login
    const updateQuery = 'UPDATE admin_users SET last_login_at = NOW() WHERE id = ?';
    await db.query(updateQuery, [adminUser.id]);

    // Log successful MFA verification
    await auditService.logAction({
      admin_user_id: adminUser.id,
      action_type: 'MFA_VERIFIED',
      entity_type: 'ADMIN_USER',
      ip_address: ctx.ip,
      user_agent: ctx.get('user-agent'),
    });

    ctx.body = {
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 86400, // 24 hours
    };
  } catch (error) {
    console.error('MFA verification error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/auth/logout
 * Admin logout endpoint
 */
router.post('/auth/logout', async (ctx: any) => {
  try {
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);

    if (token) {
      const payload = adminAuthService.verifyAccessToken(token);

      if (payload) {
        // No session to delete since we're using users table
        // Just log the logout action
        await auditService.logAction({
          admin_user_id: payload.adminUserId,
          action_type: 'LOGOUT',
          entity_type: 'ADMIN_USER',
          ip_address: ctx.ip,
          user_agent: ctx.get('user-agent'),
        });
      }
    }

    ctx.body = {
      success: true,
    };
  } catch (error) {
    console.error('Logout error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/auth/refresh-token
 * Refresh access token
 */
router.post('/auth/refresh-token', async (ctx: any) => {
  try {
    const { refreshToken } = ctx.request.body as { refreshToken: string };

    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Refresh token is required',
      };
      return;
    }

    // Verify refresh token
    const payload = adminAuthService.verifyRefreshToken(refreshToken);

    if (!payload) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid or expired refresh token',
      };
      return;
    }

    // Get admin user
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = ? AND role IN (?, ?)';
    const users = await db.query(query, [payload.adminUserId, 1, 'SUPER_ADMIN', 'COMPANY_ADMIN']);

    if (users.length === 0) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Admin user not found',
      };
      return;
    }

    const adminUser = users[0];

    // Generate new tokens
    const tokens = adminAuthService.generateTokens(adminUser, payload.sessionId);

    ctx.body = {
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 86400, // 24 hours
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/users
 * Get users list with pagination, search, and filtering
 */
router.get('/users', async (ctx: any) => {
  try {
    const { search, role, status, page = 1, limit = 25 } = ctx.query as any;

    const offset = (Number(page) - 1) * Number(limit);

    // Import users service
    const { createAdminUsersService } = await import('../services/admin-users.service');
    const usersService = createAdminUsersService(db);

    const result = await usersService.getUsers({
      search: search as string,
      role: role as string,
      status: status as string,
      limit: Number(limit),
      offset,
    });

    ctx.body = {
      success: true,
      data: result.users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  } catch (error) {
    console.error('Get users error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/users/:id
 * Get user detail with related data
 */
router.get('/users/:id', async (ctx: any) => {
  try {
    const userId = Number(ctx.params.id);

    const { createAdminUsersService } = await import('../services/admin-users.service');
    const usersService = createAdminUsersService(db);

    const user = await usersService.getUserDetail(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'User not found',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Get user detail error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/users/:id/suspend
 * Suspend a user account
 */
router.post('/users/:id/suspend', async (ctx: any) => {
  try {
    const userId = Number(ctx.params.id);
    const { reason } = ctx.request.body as { reason: string };

    if (!reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Reason is required',
      };
      return;
    }

    const { createAdminUsersService } = await import('../services/admin-users.service');
    const usersService = createAdminUsersService(db);

    const success = await usersService.suspendUser(userId, reason);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'User not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'SUSPEND',
        entity_type: 'USER',
        entity_id: userId,
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const user = await usersService.getUserById(userId);

    ctx.body = {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Suspend user error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/users/:id/reactivate
 * Reactivate a suspended user account
 */
router.post('/users/:id/reactivate', async (ctx: any) => {
  try {
    const userId = Number(ctx.params.id);

    const { createAdminUsersService } = await import('../services/admin-users.service');
    const usersService = createAdminUsersService(db);

    const success = await usersService.reactivateUser(userId);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'User not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'REACTIVATE',
        entity_type: 'USER',
        entity_id: userId,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const user = await usersService.getUserById(userId);

    ctx.body = {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Reactivate user error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password
 */
router.post('/users/:id/reset-password', async (ctx: any) => {
  try {
    const userId = Number(ctx.params.id);

    const { createAdminUsersService } = await import('../services/admin-users.service');
    const usersService = createAdminUsersService(db);

    const user = await usersService.getUserById(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'User not found',
      };
      return;
    }

    // In a real implementation, this would send a password reset email
    const success = await usersService.resetPassword(userId);

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'RESET_PASSWORD',
        entity_type: 'USER',
        entity_id: userId,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    ctx.body = {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/bookings
 * Get bookings list with pagination, search, and filtering
 */
router.get('/bookings', async (ctx: any) => {
  try {
    const { search, status, serviceType, bookingSource, dateRangeStart, dateRangeEnd, amountRangeMin, amountRangeMax, page = 1, limit = 25 } = ctx.query as any;

    const offset = (Number(page) - 1) * Number(limit);

    const { createAdminBookingsService } = await import('../services/admin-bookings.service');
    const bookingsService = createAdminBookingsService(db);

    const result = await bookingsService.getBookings({
      search: search as string,
      status: status as string,
      serviceType: serviceType as string,
      bookingSource: bookingSource as string,
      dateRangeStart: dateRangeStart as string,
      dateRangeEnd: dateRangeEnd as string,
      amountRangeMin: amountRangeMin ? Number(amountRangeMin) : undefined,
      amountRangeMax: amountRangeMax ? Number(amountRangeMax) : undefined,
      limit: Number(limit),
      offset,
    });

    ctx.body = {
      success: true,
      data: result.bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  } catch (error) {
    console.error('Get bookings error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/bookings/:id
 * Get booking detail
 */
router.get('/bookings/:id', async (ctx: any) => {
  try {
    const bookingId = ctx.params.id;

    const { createAdminBookingsService } = await import('../services/admin-bookings.service');
    const bookingsService = createAdminBookingsService(db);

    const booking = await bookingsService.getBookingDetail(bookingId);

    if (!booking) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Booking not found',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error('Get booking detail error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/bookings/:id/cancel
 * Cancel a booking
 */
router.post('/bookings/:id/cancel', async (ctx: any) => {
  try {
    const bookingId = ctx.params.id;
    const { reason } = ctx.request.body as { reason: string };

    if (!reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Reason is required',
      };
      return;
    }

    const { createAdminBookingsService } = await import('../services/admin-bookings.service');
    const bookingsService = createAdminBookingsService(db);

    const success = await bookingsService.cancelBooking(bookingId, reason);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Booking not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'CANCEL',
        entity_type: 'BOOKING',
        entity_id: parseInt(bookingId),
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const booking = await bookingsService.getBookingDetail(bookingId);

    ctx.body = {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error('Cancel booking error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/bookings/:id/refund
 * Issue a refund for a booking
 */
router.post('/bookings/:id/refund', async (ctx: any) => {
  try {
    const bookingId = ctx.params.id;
    const { amount, reason } = ctx.request.body as { amount: number; reason: string };

    if (!amount || !reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Amount and reason are required',
      };
      return;
    }

    const { createAdminBookingsService } = await import('../services/admin-bookings.service');
    const bookingsService = createAdminBookingsService(db);

    const success = await bookingsService.refundBooking(bookingId, amount, reason);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Booking not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'REFUND',
        entity_type: 'BOOKING',
        entity_id: parseInt(bookingId),
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const booking = await bookingsService.getBookingDetail(bookingId);

    ctx.body = {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error('Refund booking error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/reviews
 * Get reviews list with pagination, search, and filtering
 */
router.get('/reviews', async (ctx: any) => {
  try {
    const { search, status, rating, dateRangeStart, dateRangeEnd, serviceType, page = 1, limit = 25 } = ctx.query as any;

    const offset = (Number(page) - 1) * Number(limit);

    console.log('Reviews endpoint called with params:', { search, status, rating, dateRangeStart, dateRangeEnd, serviceType, page, limit, offset });

    const { createAdminReviewsService } = await import('../services/admin-reviews.service');
    const reviewsService = createAdminReviewsService(db);

    const result = await reviewsService.getReviews({
      search: search as string,
      status: status as string,
      rating: rating ? Number(rating) : undefined,
      dateRangeStart: dateRangeStart as string,
      dateRangeEnd: dateRangeEnd as string,
      serviceType: serviceType as string,
      limit: Number(limit),
      offset,
    });

    console.log('Reviews result:', { reviewsCount: result.reviews?.length, total: result.total });

    ctx.body = {
      success: true,
      data: result.reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  } catch (error) {
    console.error('Get reviews error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/reviews/:id
 * Get review detail
 */
router.get('/reviews/:id', async (ctx: any) => {
  try {
    const reviewId = ctx.params.id;

    const { createAdminReviewsService } = await import('../services/admin-reviews.service');
    const reviewsService = createAdminReviewsService(db);

    const review = await reviewsService.getReviewDetail(reviewId);

    if (!review) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Review not found',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Get review detail error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/reviews/:id/approve
 * Approve a review
 */
router.post('/reviews/:id/approve', async (ctx: any) => {
  try {
    const reviewId = ctx.params.id;

    const { createAdminReviewsService } = await import('../services/admin-reviews.service');
    const reviewsService = createAdminReviewsService(db);

    const success = await reviewsService.approveReview(reviewId);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Review not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'APPROVE',
        entity_type: 'REVIEW',
        entity_id: parseInt(reviewId),
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const review = await reviewsService.getReviewDetail(reviewId);

    ctx.body = {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Approve review error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/reviews/:id/reject
 * Reject a review
 */
router.post('/reviews/:id/reject', async (ctx: any) => {
  try {
    const reviewId = ctx.params.id;
    const { reason } = ctx.request.body as { reason: string };

    if (!reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Reason is required',
      };
      return;
    }

    const { createAdminReviewsService } = await import('../services/admin-reviews.service');
    const reviewsService = createAdminReviewsService(db);

    const success = await reviewsService.rejectReview(reviewId, reason);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Review not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'REJECT',
        entity_type: 'REVIEW',
        entity_id: parseInt(reviewId),
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const review = await reviewsService.getReviewDetail(reviewId);

    ctx.body = {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Reject review error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/reviews/:id/flag
 * Flag a review as inappropriate
 */
router.post('/reviews/:id/flag', async (ctx: any) => {
  try {
    const reviewId = ctx.params.id;
    const { reason } = ctx.request.body as { reason: string };

    if (!reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Reason is required',
      };
      return;
    }

    const { createAdminReviewsService } = await import('../services/admin-reviews.service');
    const reviewsService = createAdminReviewsService(db);

    const success = await reviewsService.flagReview(reviewId, reason);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Review not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'FLAG',
        entity_type: 'REVIEW',
        entity_id: parseInt(reviewId),
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const review = await reviewsService.getReviewDetail(reviewId);

    ctx.body = {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Flag review error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/reviews/:id/delete
 * Delete a review
 */
router.post('/reviews/:id/delete', async (ctx: any) => {
  try {
    const reviewId = ctx.params.id;
    const { reason } = ctx.request.body as { reason: string };

    if (!reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Reason is required',
      };
      return;
    }

    const { createAdminReviewsService } = await import('../services/admin-reviews.service');
    const reviewsService = createAdminReviewsService(db);

    const success = await reviewsService.deleteReview(reviewId);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Review not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'DELETE',
        entity_type: 'REVIEW',
        entity_id: parseInt(reviewId),
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    ctx.body = {
      success: true,
      message: 'Review deleted',
    };
  } catch (error) {
    console.error('Delete review error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/transactions
 * Get transactions list with pagination, search, and filtering
 */
router.get('/transactions', async (ctx: any) => {
  try {
    const { search, type, status, dateRangeStart, dateRangeEnd, amountRangeMin, amountRangeMax, currency, page = 1, limit = 25 } = ctx.query as any;

    const offset = (Number(page) - 1) * Number(limit);

    const { createAdminTransactionsService } = await import('../services/admin-transactions.service');
    const transactionsService = createAdminTransactionsService(db);

    const result = await transactionsService.getTransactions({
      search: search as string,
      type: type as string,
      status: status as string,
      dateRangeStart: dateRangeStart as string,
      dateRangeEnd: dateRangeEnd as string,
      amountRangeMin: amountRangeMin ? Number(amountRangeMin) : undefined,
      amountRangeMax: amountRangeMax ? Number(amountRangeMax) : undefined,
      currency: currency as string,
      limit: Number(limit),
      offset,
    });

    ctx.body = {
      success: true,
      data: result.transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  } catch (error) {
    console.error('Get transactions error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/transactions/:id
 * Get transaction detail
 */
router.get('/transactions/:id', async (ctx: any) => {
  try {
    const transactionId = ctx.params.id;

    const { createAdminTransactionsService } = await import('../services/admin-transactions.service');
    const transactionsService = createAdminTransactionsService(db);

    const transaction = await transactionsService.getTransactionDetail(transactionId);

    if (!transaction) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Transaction not found',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: transaction,
    };
  } catch (error) {
    console.error('Get transaction detail error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/transactions/:id/dispute
 * Mark a transaction as disputed
 */
router.post('/transactions/:id/dispute', async (ctx: any) => {
  try {
    const transactionId = ctx.params.id;
    const { reason, amount } = ctx.request.body as { reason: string; amount: number };

    if (!reason || !amount) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Reason and amount are required',
      };
      return;
    }

    const { createAdminTransactionsService } = await import('../services/admin-transactions.service');
    const transactionsService = createAdminTransactionsService(db);

    const success = await transactionsService.disputeTransaction(transactionId, reason, amount);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Transaction not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'DISPUTE',
        entity_type: 'TRANSACTION',
        entity_id: parseInt(transactionId),
        reason,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const transaction = await transactionsService.getTransactionDetail(transactionId);

    ctx.body = {
      success: true,
      data: transaction,
    };
  } catch (error) {
    console.error('Dispute transaction error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels
 * Get hotels list with pagination, search, and filtering
 */
router.get('/hotels', async (ctx: any) => {
  try {
    const { search, status, city, country, page = 1, limit = 25 } = ctx.query as any;

    const { adminHotelsService } = await import('../services/admin-hotels.service');

    const result = await adminHotelsService.getHotels({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      status: status as string,
      city: city as string,
      country: country as string,
    });

    ctx.body = {
      success: true,
      data: result.hotels,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  } catch (error) {
    console.error('Get hotels error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels/stats/transactions
 * Get hotel transaction statistics for charts
 */
router.get('/hotels/stats/transactions', async (ctx: any) => {
  try {
    const { period = 'daily', days = 30 } = ctx.query as any;

    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const stats = await adminHotelsService.getTransactionStats({
      period: period as 'daily' | 'weekly' | 'monthly',
      days: Number(days),
    });

    ctx.body = {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Get hotel transaction stats error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels/cities
 * Get unique cities for filter dropdown
 */
router.get('/hotels/cities', async (ctx: any) => {
  try {
    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const cities = await adminHotelsService.getCities();

    ctx.body = {
      success: true,
      data: cities,
    };
  } catch (error) {
    console.error('Get cities error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels/countries
 * Get unique countries for filter dropdown
 */
router.get('/hotels/countries', async (ctx: any) => {
  try {
    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const countries = await adminHotelsService.getCountries();

    ctx.body = {
      success: true,
      data: countries,
    };
  } catch (error) {
    console.error('Get countries error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels/:id
 * Get hotel detail with all information
 */
router.get('/hotels/:id', async (ctx: any) => {
  try {
    const hotelId = ctx.params.id;

    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const hotel = await adminHotelsService.getHotelById(hotelId);

    if (!hotel) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Hotel not found',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: hotel,
    };
  } catch (error) {
    console.error('Get hotel detail error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels/:id/reviews
 * Get reviews for a specific hotel
 */
router.get('/hotels/:id/reviews', async (ctx: any) => {
  try {
    const hotelId = ctx.params.id;
    const { page = 1, limit = 10 } = ctx.query as any;

    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const reviews = await adminHotelsService.getHotelReviews(hotelId, {
      page: Number(page),
      limit: Number(limit),
    });

    ctx.body = {
      success: true,
      data: reviews,
    };
  } catch (error) {
    console.error('Get hotel reviews error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * GET /api/admin/hotels/:id/transactions
 * Get transactions for a specific hotel
 */
router.get('/hotels/:id/transactions', async (ctx: any) => {
  try {
    const hotelId = ctx.params.id;
    const { page = 1, limit = 10 } = ctx.query as any;

    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const transactions = await adminHotelsService.getHotelTransactions(hotelId, {
      page: Number(page),
      limit: Number(limit),
    });

    ctx.body = {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Get hotel transactions error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

/**
 * POST /api/admin/hotels/:id/status
 * Update hotel status (activate/deactivate)
 */
router.post('/hotels/:id/status', async (ctx: any) => {
  try {
    const hotelId = ctx.params.id;
    const { status } = ctx.request.body as { status: string };

    if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Valid status is required (ACTIVE, INACTIVE, SUSPENDED)',
      };
      return;
    }

    const { adminHotelsService } = await import('../services/admin-hotels.service');
    const success = await adminHotelsService.updateHotelStatus(hotelId, status);

    if (!success) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Hotel not found',
      };
      return;
    }

    // Log action
    const authHeader = ctx.get('authorization');
    const token = adminAuthService.extractToken(authHeader);
    const payload = token ? adminAuthService.verifyAccessToken(token) : null;

    if (payload) {
      await auditService.logAction({
        admin_user_id: payload.adminUserId,
        action_type: 'UPDATE_STATUS',
        entity_type: 'HOTEL',
        entity_id: hotelId,
        reason: `Status changed to ${status}`,
        ip_address: ctx.ip,
        user_agent: ctx.get('user-agent'),
      });
    }

    const hotel = await adminHotelsService.getHotelById(hotelId);

    ctx.body = {
      success: true,
      data: hotel,
    };
  } catch (error) {
    console.error('Update hotel status error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal server error',
    };
  }
});

export default router;
