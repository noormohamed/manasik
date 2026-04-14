/**
 * Feature Flags Utility
 * Centralized management of feature flags from environment variables
 */

export interface FeatureFlags {
  // API Endpoints
  auth: boolean;
  users: boolean;
  hotels: boolean;
  checkout: boolean;

  // Auth Methods
  registration: boolean;
  login: boolean;
  refreshToken: boolean;
  guestCheckout: boolean;

  // Hotel Features
  hotelListing: boolean;
  hotelDetails: boolean;
  roomAvailability: boolean;
  hotelBooking: boolean;

  // Checkout Features
  checkoutSession: boolean;
  checkoutItems: boolean;
  checkoutDiscount: boolean;
  checkoutConversion: boolean;
  checkoutComplete: boolean;
}

class FeatureFlagsManager {
  private flags: FeatureFlags;

  constructor() {
    this.flags = this.loadFlags();
  }

  private loadFlags(): FeatureFlags {
    return {
      // API Endpoints
      auth: this.parseEnv('ENABLE_AUTH_ENDPOINTS', true),
      users: this.parseEnv('ENABLE_USER_ENDPOINTS', true),
      hotels: this.parseEnv('ENABLE_HOTEL_ENDPOINTS', true),
      checkout: this.parseEnv('ENABLE_CHECKOUT_ENDPOINTS', true),

      // Auth Methods
      registration: this.parseEnv('ENABLE_REGISTRATION', true),
      login: this.parseEnv('ENABLE_LOGIN', true),
      refreshToken: this.parseEnv('ENABLE_REFRESH_TOKEN', true),
      guestCheckout: this.parseEnv('ENABLE_GUEST_CHECKOUT', true),

      // Hotel Features
      hotelListing: this.parseEnv('ENABLE_HOTEL_LISTING', true),
      hotelDetails: this.parseEnv('ENABLE_HOTEL_DETAILS', true),
      roomAvailability: this.parseEnv('ENABLE_ROOM_AVAILABILITY', true),
      hotelBooking: this.parseEnv('ENABLE_HOTEL_BOOKING', true),

      // Checkout Features
      checkoutSession: this.parseEnv('ENABLE_CHECKOUT_SESSION', true),
      checkoutItems: this.parseEnv('ENABLE_CHECKOUT_ITEMS', true),
      checkoutDiscount: this.parseEnv('ENABLE_CHECKOUT_DISCOUNT', true),
      checkoutConversion: this.parseEnv('ENABLE_CHECKOUT_CONVERSION', true),
      checkoutComplete: this.parseEnv('ENABLE_CHECKOUT_COMPLETE', true),
    };
  }

  private parseEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature];
  }

  /**
   * Get all flags
   */
  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Get flags status for logging
   */
  getStatus(): Record<string, boolean> {
    const flags = this.getAll();
    return Object.entries(flags).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, boolean>);
  }
}

export const featureFlags = new FeatureFlagsManager();
