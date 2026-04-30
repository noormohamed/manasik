"use strict";
/**
 * Session Middleware
 * Handles session tracking for both authenticated and guest users
 */
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
exports.sessionMiddleware = sessionMiddleware;
exports.getSessionIdentifier = getSessionIdentifier;
exports.hashEmail = hashEmail;
exports.getUserIdentifier = getUserIdentifier;
exports.isGuestUserId = isGuestUserId;
exports.clearGuestUserCookie = clearGuestUserCookie;
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const SESSION_COOKIE_NAME = 'checkout_session_id';
const GUEST_USER_COOKIE_NAME = 'guest_user_id';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
/**
 * Session middleware - creates or retrieves session ID and guest user
 * For authenticated users: uses userId
 * For guests: uses guest-{uuid} format and stores in cookie
 */
function sessionMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // If user is authenticated, use their userId as session ID
        if (ctx.state.user && ctx.state.user.userId) {
            ctx.state.sessionId = ctx.state.user.userId;
            ctx.state.userId = ctx.state.user.userId;
            ctx.state.isAuthenticated = true;
            ctx.state.isGuest = false;
        }
        else {
            // For guests, check if they have a guest user ID cookie
            let guestUserId = ctx.cookies.get(GUEST_USER_COOKIE_NAME);
            if (!guestUserId) {
                // Create new guest user ID
                guestUserId = `guest-${(0, uuid_1.v4)()}`;
                ctx.cookies.set(GUEST_USER_COOKIE_NAME, guestUserId, {
                    maxAge: SESSION_COOKIE_MAX_AGE,
                    httpOnly: true,
                    secure: false, // Allow HTTP for now, will be HTTPS in production
                    sameSite: 'lax',
                });
            }
            ctx.state.sessionId = guestUserId;
            ctx.state.userId = guestUserId;
            ctx.state.isAuthenticated = false;
            ctx.state.isGuest = true;
        }
        yield next();
    });
}
/**
 * Generate session identifier for tracking
 * Authenticated: userId
 * Guest: guest-{uuid}
 */
function getSessionIdentifier(ctx) {
    return ctx.state.sessionId;
}
/**
 * Generate MD5 hash of email for guest identification
 */
function hashEmail(email) {
    return crypto_1.default.createHash('md5').update(email.toLowerCase()).digest('hex');
}
/**
 * Get user identifier (userId or guest-uuid)
 */
function getUserIdentifier(ctx) {
    if (ctx.state.isAuthenticated) {
        return {
            type: 'authenticated',
            id: ctx.state.user.userId,
            email: ctx.state.user.email,
        };
    }
    return {
        type: 'guest',
        id: ctx.state.userId,
    };
}
/**
 * Check if user ID is a guest
 */
function isGuestUserId(userId) {
    return userId.startsWith('guest-');
}
/**
 * Clear guest user cookie (on logout or conversion)
 */
function clearGuestUserCookie(ctx) {
    ctx.cookies.set(GUEST_USER_COOKIE_NAME, '', {
        maxAge: 0,
        httpOnly: true,
        secure: false, // Allow HTTP for now
        sameSite: 'lax',
    });
}
