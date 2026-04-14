"use strict";
/**
 * Admin Routes - Super Admin Panel API endpoints
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAdminRoutes = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const admin_auth_service_1 = require("../services/admin-auth.service");
const admin_audit_service_1 = require("../services/admin-audit.service");
const router = new koa_router_1.default({ prefix: '/api/admin' });
// Initialize database and services
let db;
let auditService;
const initializeAdminRoutes = (database) => {
    db = database;
    auditService = (0, admin_audit_service_1.createAdminAuditService)(database);
};
exports.initializeAdminRoutes = initializeAdminRoutes;
/**
 * GET /api/admin/users/me
 * Get current admin user info
 */
router.get('/users/me', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = ctx.get('authorization');
        console.log('Auth header:', authHeader);
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        console.log('Extracted token:', token ? 'present' : 'missing');
        if (!token) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                error: 'No token provided',
            };
            return;
        }
        const payload = admin_auth_service_1.adminAuthService.verifyAccessToken(token);
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
        const users = yield db.query(query, [payload.adminUserId]);
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
    }
    catch (error) {
        console.error('Get current user error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
            debug: error instanceof Error ? error.message : String(error),
        };
    }
}));
/**
 * POST /api/admin/auth/login
 * Admin login endpoint
 */
router.post('/auth/login', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Login endpoint called, db initialized:', !!db);
        if (!db) {
            console.log('ERROR: db is null!');
            ctx.body = { error: 'Database not initialized' };
            return;
        }
        const { email, password } = ctx.request.body;
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
        const users = yield db.query(query, [email, 1, 'SUPER_ADMIN', 'COMPANY_ADMIN']);
        if (users.length === 0) {
            // Log failed login attempt
            yield auditService.logAction({
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
        const passwordValid = yield admin_auth_service_1.adminAuthService.comparePassword(password, adminUser.password_hash);
        if (!passwordValid) {
            // Log failed login attempt
            yield auditService.logAction({
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
        const tokens = admin_auth_service_1.adminAuthService.generateTokens(adminUser, 0);
        // Log successful login
        yield auditService.logAction({
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
    }
    catch (error) {
        console.error('Login error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/auth/verify-mfa
 * Verify MFA code and complete login
 */
router.post('/auth/verify-mfa', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mfaCode, tempToken } = ctx.request.body;
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
        const payload = admin_auth_service_1.adminAuthService.verifyAccessToken(tempToken);
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
        const users = yield db.query(query, [payload.adminUserId, 1, 'SUPER_ADMIN', 'COMPANY_ADMIN']);
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
        const mfaValid = admin_auth_service_1.adminAuthService.verifyMFACode(adminUser.mfa_secret, mfaCode);
        if (!mfaValid) {
            // Log failed MFA attempt
            yield auditService.logAction({
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
        const tokenHash = admin_auth_service_1.adminAuthService.generateTokenHash(Math.random().toString());
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const sessionQuery = `
      INSERT INTO admin_sessions (admin_user_id, token_hash, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
        const sessionResult = yield db.query(sessionQuery, [
            adminUser.id,
            tokenHash,
            ctx.ip,
            ctx.get('user-agent'),
            expiresAt,
        ]);
        const sessionId = sessionResult.insertId;
        // Generate tokens
        const tokens = admin_auth_service_1.adminAuthService.generateTokens(adminUser, sessionId);
        // Update last login
        const updateQuery = 'UPDATE admin_users SET last_login_at = NOW() WHERE id = ?';
        yield db.query(updateQuery, [adminUser.id]);
        // Log successful MFA verification
        yield auditService.logAction({
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
    }
    catch (error) {
        console.error('MFA verification error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/auth/logout
 * Admin logout endpoint
 */
router.post('/auth/logout', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = ctx.get('authorization');
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        if (token) {
            const payload = admin_auth_service_1.adminAuthService.verifyAccessToken(token);
            if (payload) {
                // No session to delete since we're using users table
                // Just log the logout action
                yield auditService.logAction({
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
    }
    catch (error) {
        console.error('Logout error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/auth/refresh-token
 * Refresh access token
 */
router.post('/auth/refresh-token', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = ctx.request.body;
        if (!refreshToken) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Refresh token is required',
            };
            return;
        }
        // Verify refresh token
        const payload = admin_auth_service_1.adminAuthService.verifyRefreshToken(refreshToken);
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
        const users = yield db.query(query, [payload.adminUserId, 1, 'SUPER_ADMIN', 'COMPANY_ADMIN']);
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
        const tokens = admin_auth_service_1.adminAuthService.generateTokens(adminUser, payload.sessionId);
        ctx.body = {
            success: true,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 86400, // 24 hours
        };
    }
    catch (error) {
        console.error('Token refresh error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/users
 * Get users list with pagination, search, and filtering
 */
router.get('/users', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, role, status, page = 1, limit = 25 } = ctx.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Import users service
        const { createAdminUsersService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-users.service')));
        const usersService = createAdminUsersService(db);
        const result = yield usersService.getUsers({
            search: search,
            role: role,
            status: status,
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
    }
    catch (error) {
        console.error('Get users error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/users/:id
 * Get user detail with related data
 */
router.get('/users/:id', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(ctx.params.id);
        const { createAdminUsersService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-users.service')));
        const usersService = createAdminUsersService(db);
        const user = yield usersService.getUserDetail(userId);
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
    }
    catch (error) {
        console.error('Get user detail error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/users/:id/suspend
 * Suspend a user account
 */
router.post('/users/:id/suspend', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(ctx.params.id);
        const { reason } = ctx.request.body;
        if (!reason) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Reason is required',
            };
            return;
        }
        const { createAdminUsersService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-users.service')));
        const usersService = createAdminUsersService(db);
        const success = yield usersService.suspendUser(userId, reason);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'SUSPEND',
                entity_type: 'USER',
                entity_id: userId,
                reason,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const user = yield usersService.getUserById(userId);
        ctx.body = {
            success: true,
            data: user,
        };
    }
    catch (error) {
        console.error('Suspend user error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/users/:id/reactivate
 * Reactivate a suspended user account
 */
router.post('/users/:id/reactivate', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(ctx.params.id);
        const { createAdminUsersService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-users.service')));
        const usersService = createAdminUsersService(db);
        const success = yield usersService.reactivateUser(userId);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'REACTIVATE',
                entity_type: 'USER',
                entity_id: userId,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const user = yield usersService.getUserById(userId);
        ctx.body = {
            success: true,
            data: user,
        };
    }
    catch (error) {
        console.error('Reactivate user error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password
 */
router.post('/users/:id/reset-password', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(ctx.params.id);
        const { createAdminUsersService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-users.service')));
        const usersService = createAdminUsersService(db);
        const user = yield usersService.getUserById(userId);
        if (!user) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                error: 'User not found',
            };
            return;
        }
        // In a real implementation, this would send a password reset email
        const success = yield usersService.resetPassword(userId);
        // Log action
        const authHeader = ctx.get('authorization');
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
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
    }
    catch (error) {
        console.error('Reset password error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/bookings
 * Get bookings list with pagination, search, and filtering
 */
router.get('/bookings', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, status, serviceType, dateRangeStart, dateRangeEnd, amountRangeMin, amountRangeMax, page = 1, limit = 25 } = ctx.query;
        const offset = (Number(page) - 1) * Number(limit);
        const { createAdminBookingsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-bookings.service')));
        const bookingsService = createAdminBookingsService(db);
        const result = yield bookingsService.getBookings({
            search: search,
            status: status,
            serviceType: serviceType,
            dateRangeStart: dateRangeStart,
            dateRangeEnd: dateRangeEnd,
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
    }
    catch (error) {
        console.error('Get bookings error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/bookings/:id
 * Get booking detail
 */
router.get('/bookings/:id', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = ctx.params.id;
        const { createAdminBookingsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-bookings.service')));
        const bookingsService = createAdminBookingsService(db);
        const booking = yield bookingsService.getBookingDetail(bookingId);
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
    }
    catch (error) {
        console.error('Get booking detail error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/bookings/:id/cancel
 * Cancel a booking
 */
router.post('/bookings/:id/cancel', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = ctx.params.id;
        const { reason } = ctx.request.body;
        if (!reason) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Reason is required',
            };
            return;
        }
        const { createAdminBookingsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-bookings.service')));
        const bookingsService = createAdminBookingsService(db);
        const success = yield bookingsService.cancelBooking(bookingId, reason);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'CANCEL',
                entity_type: 'BOOKING',
                entity_id: parseInt(bookingId),
                reason,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const booking = yield bookingsService.getBookingDetail(bookingId);
        ctx.body = {
            success: true,
            data: booking,
        };
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/bookings/:id/refund
 * Issue a refund for a booking
 */
router.post('/bookings/:id/refund', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = ctx.params.id;
        const { amount, reason } = ctx.request.body;
        if (!amount || !reason) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Amount and reason are required',
            };
            return;
        }
        const { createAdminBookingsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-bookings.service')));
        const bookingsService = createAdminBookingsService(db);
        const success = yield bookingsService.refundBooking(bookingId, amount, reason);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'REFUND',
                entity_type: 'BOOKING',
                entity_id: parseInt(bookingId),
                reason,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const booking = yield bookingsService.getBookingDetail(bookingId);
        ctx.body = {
            success: true,
            data: booking,
        };
    }
    catch (error) {
        console.error('Refund booking error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/reviews
 * Get reviews list with pagination, search, and filtering
 */
router.get('/reviews', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { search, status, rating, dateRangeStart, dateRangeEnd, serviceType, page = 1, limit = 25 } = ctx.query;
        const offset = (Number(page) - 1) * Number(limit);
        console.log('Reviews endpoint called with params:', { search, status, rating, dateRangeStart, dateRangeEnd, serviceType, page, limit, offset });
        const { createAdminReviewsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-reviews.service')));
        const reviewsService = createAdminReviewsService(db);
        const result = yield reviewsService.getReviews({
            search: search,
            status: status,
            rating: rating ? Number(rating) : undefined,
            dateRangeStart: dateRangeStart,
            dateRangeEnd: dateRangeEnd,
            serviceType: serviceType,
            limit: Number(limit),
            offset,
        });
        console.log('Reviews result:', { reviewsCount: (_a = result.reviews) === null || _a === void 0 ? void 0 : _a.length, total: result.total });
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
    }
    catch (error) {
        console.error('Get reviews error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/reviews/:id
 * Get review detail
 */
router.get('/reviews/:id', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = ctx.params.id;
        const { createAdminReviewsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-reviews.service')));
        const reviewsService = createAdminReviewsService(db);
        const review = yield reviewsService.getReviewDetail(reviewId);
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
    }
    catch (error) {
        console.error('Get review detail error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/reviews/:id/approve
 * Approve a review
 */
router.post('/reviews/:id/approve', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = ctx.params.id;
        const { createAdminReviewsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-reviews.service')));
        const reviewsService = createAdminReviewsService(db);
        const success = yield reviewsService.approveReview(reviewId);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'APPROVE',
                entity_type: 'REVIEW',
                entity_id: parseInt(reviewId),
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const review = yield reviewsService.getReviewDetail(reviewId);
        ctx.body = {
            success: true,
            data: review,
        };
    }
    catch (error) {
        console.error('Approve review error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/reviews/:id/reject
 * Reject a review
 */
router.post('/reviews/:id/reject', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = ctx.params.id;
        const { reason } = ctx.request.body;
        if (!reason) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Reason is required',
            };
            return;
        }
        const { createAdminReviewsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-reviews.service')));
        const reviewsService = createAdminReviewsService(db);
        const success = yield reviewsService.rejectReview(reviewId, reason);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'REJECT',
                entity_type: 'REVIEW',
                entity_id: parseInt(reviewId),
                reason,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const review = yield reviewsService.getReviewDetail(reviewId);
        ctx.body = {
            success: true,
            data: review,
        };
    }
    catch (error) {
        console.error('Reject review error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/reviews/:id/flag
 * Flag a review as inappropriate
 */
router.post('/reviews/:id/flag', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = ctx.params.id;
        const { reason } = ctx.request.body;
        if (!reason) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Reason is required',
            };
            return;
        }
        const { createAdminReviewsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-reviews.service')));
        const reviewsService = createAdminReviewsService(db);
        const success = yield reviewsService.flagReview(reviewId, reason);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'FLAG',
                entity_type: 'REVIEW',
                entity_id: parseInt(reviewId),
                reason,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const review = yield reviewsService.getReviewDetail(reviewId);
        ctx.body = {
            success: true,
            data: review,
        };
    }
    catch (error) {
        console.error('Flag review error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/reviews/:id/delete
 * Delete a review
 */
router.post('/reviews/:id/delete', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = ctx.params.id;
        const { reason } = ctx.request.body;
        if (!reason) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Reason is required',
            };
            return;
        }
        const { createAdminReviewsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-reviews.service')));
        const reviewsService = createAdminReviewsService(db);
        const success = yield reviewsService.deleteReview(reviewId);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
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
    }
    catch (error) {
        console.error('Delete review error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/transactions
 * Get transactions list with pagination, search, and filtering
 */
router.get('/transactions', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, type, status, dateRangeStart, dateRangeEnd, amountRangeMin, amountRangeMax, currency, page = 1, limit = 25 } = ctx.query;
        const offset = (Number(page) - 1) * Number(limit);
        const { createAdminTransactionsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-transactions.service')));
        const transactionsService = createAdminTransactionsService(db);
        const result = yield transactionsService.getTransactions({
            search: search,
            type: type,
            status: status,
            dateRangeStart: dateRangeStart,
            dateRangeEnd: dateRangeEnd,
            amountRangeMin: amountRangeMin ? Number(amountRangeMin) : undefined,
            amountRangeMax: amountRangeMax ? Number(amountRangeMax) : undefined,
            currency: currency,
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
    }
    catch (error) {
        console.error('Get transactions error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * GET /api/admin/transactions/:id
 * Get transaction detail
 */
router.get('/transactions/:id', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = ctx.params.id;
        const { createAdminTransactionsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-transactions.service')));
        const transactionsService = createAdminTransactionsService(db);
        const transaction = yield transactionsService.getTransactionDetail(transactionId);
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
    }
    catch (error) {
        console.error('Get transaction detail error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
/**
 * POST /api/admin/transactions/:id/dispute
 * Mark a transaction as disputed
 */
router.post('/transactions/:id/dispute', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = ctx.params.id;
        const { reason, amount } = ctx.request.body;
        if (!reason || !amount) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Reason and amount are required',
            };
            return;
        }
        const { createAdminTransactionsService } = yield Promise.resolve().then(() => __importStar(require('../services/admin-transactions.service')));
        const transactionsService = createAdminTransactionsService(db);
        const success = yield transactionsService.disputeTransaction(transactionId, reason, amount);
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
        const token = admin_auth_service_1.adminAuthService.extractToken(authHeader);
        const payload = token ? admin_auth_service_1.adminAuthService.verifyAccessToken(token) : null;
        if (payload) {
            yield auditService.logAction({
                admin_user_id: payload.adminUserId,
                action_type: 'DISPUTE',
                entity_type: 'TRANSACTION',
                entity_id: parseInt(transactionId),
                reason,
                ip_address: ctx.ip,
                user_agent: ctx.get('user-agent'),
            });
        }
        const transaction = yield transactionsService.getTransactionDetail(transactionId);
        ctx.body = {
            success: true,
            data: transaction,
        };
    }
    catch (error) {
        console.error('Dispute transaction error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: 'Internal server error',
        };
    }
}));
exports.default = router;
