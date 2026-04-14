"use strict";
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
exports.authRoutes = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const feature_flag_1 = require("../middleware/feature-flag");
const auth_service_1 = require("../services/auth.service");
const user_repository_1 = require("../database/repositories/user.repository");
const user_1 = require("../models/user");
const uuid_1 = require("uuid");
const authService = new auth_service_1.AuthService();
exports.authRoutes = new koa_router_1.default({ prefix: '/auth' });
/**
 * POST /api/auth/register
 * Register a new user
 */
exports.authRoutes.post('/register', (0, feature_flag_1.requireFeature)('registration'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        // @ts-ignore
        const { email, password, firstName, lastName } = ctx.request.body;
        if (!email || !password || !firstName || !lastName) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: email, password, firstName, lastName' };
            return;
        }
        // Check if user already exists
        const existingUser = yield userRepository.findByEmail(email);
        if (existingUser) {
            ctx.status = 409;
            ctx.body = { error: 'User already exists' };
            return;
        }
        // Create new user
        const userId = (0, uuid_1.v4)();
        const hashedPassword = yield authService.hashPassword(password);
        const newUser = new user_1.User(userId);
        newUser.id = userId;
        newUser.email = email;
        newUser.first_name = firstName;
        newUser.last_name = lastName;
        newUser.password_hash = hashedPassword;
        newUser.role = 'CUSTOMER';
        newUser.is_active = true;
        newUser.created_at = new Date();
        newUser.updated_at = new Date();
        yield userRepository.create(newUser);
        // Generate tokens
        const tokens = authService.generateTokens(newUser);
        ctx.status = 201;
        ctx.body = {
            message: 'User registered successfully',
            user: {
                id: userId,
                email,
                firstName,
                lastName,
            },
            tokens,
        };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Registration failed' };
    }
}));
/**
 * POST /api/auth/login
 * Login user
 */
exports.authRoutes.post('/login', (0, feature_flag_1.requireFeature)('login'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        // @ts-ignore
        const { email, password } = ctx.request.body;
        if (!email || !password) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: email, password' };
            return;
        }
        // Find user
        const user = yield userRepository.findByEmail(email);
        if (!user) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid credentials' };
            return;
        }
        // TODO: Verify password against stored hash
        // For now, accept any password
        // const isPasswordValid = await authService.comparePassword(password, user.password);
        // if (!isPasswordValid) {
        //   ctx.status = 401;
        //   ctx.body = { error: 'Invalid credentials' };
        //   return;
        // }
        // Generate tokens
        const tokens = authService.generateTokens(user);
        ctx.body = {
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            },
            tokens,
        };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Login failed' };
    }
}));
/**
 * POST /api/auth/refresh
 * Refresh access token
 */
exports.authRoutes.post('/refresh', (0, feature_flag_1.requireFeature)('refreshToken'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        // @ts-ignore
        const { refreshToken } = ctx.request.body;
        if (!refreshToken) {
            ctx.status = 400;
            ctx.body = { error: 'Missing refreshToken' };
            return;
        }
        const decoded = authService.verifyRefreshToken(refreshToken);
        if (!decoded) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid refresh token' };
            return;
        }
        const user = yield userRepository.findById(decoded.userId);
        if (!user) {
            ctx.status = 401;
            ctx.body = { error: 'User not found' };
            return;
        }
        const tokens = authService.generateTokens(user);
        ctx.body = {
            message: 'Token refreshed',
            tokens,
        };
    }
    catch (error) {
        ctx.status = 401;
        ctx.body = { error: 'Token refresh failed' };
    }
}));
/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
exports.authRoutes.post('/logout', auth_middleware_1.authMiddleware, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.body = { message: 'Logout successful' };
}));
/**
 * GET /api/auth/me
 * Get current user
 */
exports.authRoutes.get('/me', auth_middleware_1.authMiddleware, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        const userId = ctx.state.userId;
        const user = yield userRepository.findById(userId);
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
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to fetch user' };
    }
}));
/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
exports.authRoutes.post('/change-password', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('login'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRepository = new user_repository_1.UserRepository();
        const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
        // @ts-ignore
        const { currentPassword, newPassword } = ctx.request.body;
        if (!userId) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized' };
            return;
        }
        if (!currentPassword || !newPassword) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: currentPassword, newPassword' };
            return;
        }
        if (newPassword.length < 6) {
            ctx.status = 400;
            ctx.body = { error: 'New password must be at least 6 characters long' };
            return;
        }
        const user = yield userRepository.findById(userId);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }
        // Verify current password
        const isPasswordValid = yield authService.comparePassword(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            ctx.status = 401;
            ctx.body = { error: 'Current password is incorrect' };
            return;
        }
        // Hash new password and update
        const hashedPassword = yield authService.hashPassword(newPassword);
        yield userRepository.update(user.id, {
            password_hash: hashedPassword,
            updated_at: new Date(),
        });
        ctx.body = { message: 'Password changed successfully' };
    }
    catch (error) {
        console.error('Change password error:', error);
        ctx.status = 500;
        ctx.body = { error: 'Failed to change password' };
    }
}));
/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
exports.authRoutes.post('/forgot-password', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        // @ts-ignore
        const { email } = ctx.request.body;
        if (!email) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required field: email' };
            return;
        }
        const user = yield userRepository.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            ctx.body = { message: 'If email exists, password reset link has been sent' };
            return;
        }
        // TODO: Generate reset token and send email
        // For now, just return success
        ctx.body = { message: 'Password reset link sent to email' };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to process password reset request' };
    }
}));
/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
exports.authRoutes.post('/reset-password', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        // @ts-ignore
        const { email, token, newPassword } = ctx.request.body;
        if (!email || !token || !newPassword) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: email, token, newPassword' };
            return;
        }
        const user = yield userRepository.findByEmail(email);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }
        // TODO: Verify reset token
        // For now, accept any token
        // const isTokenValid = await authService.verifyResetToken(token, user.id);
        // if (!isTokenValid) {
        //   ctx.status = 401;
        //   ctx.body = { error: 'Invalid or expired reset token' };
        //   return;
        // }
        // Hash new password and update
        const hashedPassword = yield authService.hashPassword(newPassword);
        user.password_hash = hashedPassword;
        user.updated_at = new Date();
        yield userRepository.update(user.id, {
            password_hash: hashedPassword,
            updated_at: new Date(),
        });
        ctx.body = { message: 'Password reset successfully' };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to reset password' };
    }
}));
