/**
 * Session Middleware
 * Handles session tracking for both authenticated and guest users
 */

import { Context, Next } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'checkout_session_id';
const GUEST_USER_COOKIE_NAME = 'guest_user_id';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Session middleware - creates or retrieves session ID and guest user
 * For authenticated users: uses userId
 * For guests: uses guest-{uuid} format and stores in cookie
 */
export async function sessionMiddleware(ctx: Context, next: Next) {
  // If user is authenticated, use their userId as session ID
  if (ctx.state.user && ctx.state.user.userId) {
    ctx.state.sessionId = ctx.state.user.userId;
    ctx.state.userId = ctx.state.user.userId;
    ctx.state.isAuthenticated = true;
    ctx.state.isGuest = false;
  } else {
    // For guests, check if they have a guest user ID cookie
    let guestUserId = ctx.cookies.get(GUEST_USER_COOKIE_NAME);

    if (!guestUserId) {
      // Create new guest user ID
      guestUserId = `guest-${uuidv4()}`;
      ctx.cookies.set(GUEST_USER_COOKIE_NAME, guestUserId, {
        maxAge: SESSION_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    ctx.state.sessionId = guestUserId;
    ctx.state.userId = guestUserId;
    ctx.state.isAuthenticated = false;
    ctx.state.isGuest = true;
  }

  await next();
}

/**
 * Generate session identifier for tracking
 * Authenticated: userId
 * Guest: guest-{uuid}
 */
export function getSessionIdentifier(ctx: Context): string {
  return ctx.state.sessionId;
}

/**
 * Generate MD5 hash of email for guest identification
 */
export function hashEmail(email: string): string {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

/**
 * Get user identifier (userId or guest-uuid)
 */
export function getUserIdentifier(ctx: Context): {
  type: 'authenticated' | 'guest';
  id: string;
  email?: string;
} {
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
export function isGuestUserId(userId: string): boolean {
  return userId.startsWith('guest-');
}

/**
 * Clear guest user cookie (on logout or conversion)
 */
export function clearGuestUserCookie(ctx: Context): void {
  ctx.cookies.set(GUEST_USER_COOKIE_NAME, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
