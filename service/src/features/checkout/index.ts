/**
 * Checkout Feature
 * Complete checkout system for managing shopping carts
 * Supports both authenticated and guest users
 */

// Models
export { CheckoutSession } from './models/checkout-session';

// Types
export type { BookingItem, CheckoutSessionRecord, GuestUser, DiscountCode } from './types';

// Services
export { CheckoutSessionService } from './services/checkout-session.service';
