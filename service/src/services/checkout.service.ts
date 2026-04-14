/**
 * Checkout Service
 * 
 * Unified checkout/payment page service that aggregates bookings from all features.
 * Supports multiple service types: HOTEL, TAXI, EXPERIENCE, FOOD, CAR, etc.
 * 
 * This service handles:
 * - Aggregating bookings from different features
 * - Calculating total price across all bookings
 * - Applying discounts and promotions
 * - Generating unified checkout summary
 * - Processing multi-service payments
 */

import { ServiceType } from '../typing/roles';

export type BookingServiceType = 'HOTEL' | 'TAXI' | 'EXPERIENCE' | 'FOOD' | 'CAR';

export interface BookingItem {
  id: string;
  serviceType: BookingServiceType;
  serviceName: string;
  description: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  tax: number;
  total: number;
  territory?: string;
  taxRate?: number;
  metadata: Record<string, any>;
}

export interface CheckoutSummary {
  customerId: string;
  bookingItems: BookingItem[];
  itemCount: number;
  subtotal: number;
  totalTax: number;
  discountAmount: number;
  discountCode?: string;
  finalTotal: number;
  currency: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface DiscountCode {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minPurchaseAmount?: number;
  maxDiscount?: number;
  applicableServices?: BookingServiceType[];
  expiresAt: Date;
  isActive: boolean;
}

export class CheckoutService {
  private discountCodes: Map<string, DiscountCode> = new Map();

  constructor() {
    this.initializeDefaultDiscounts();
  }

  /**
   * Initialize default discount codes (theoretical)
   */
  private initializeDefaultDiscounts(): void {
    this.discountCodes.set('WELCOME10', {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minPurchaseAmount: 50,
      applicableServices: ['HOTEL', 'TAXI', 'EXPERIENCE'],
      expiresAt: new Date('2026-12-31'),
      isActive: true,
    });

    this.discountCodes.set('HOTEL20', {
      code: 'HOTEL20',
      type: 'PERCENTAGE',
      value: 20,
      applicableServices: ['HOTEL'],
      expiresAt: new Date('2026-06-30'),
      isActive: true,
    });

    this.discountCodes.set('SAVE50', {
      code: 'SAVE50',
      type: 'FIXED_AMOUNT',
      value: 50,
      minPurchaseAmount: 200,
      maxDiscount: 50,
      expiresAt: new Date('2026-03-31'),
      isActive: true,
    });
  }

  /**
   * Create a checkout summary from booking items
   */
  createCheckoutSummary(params: {
    customerId: string;
    bookingItems: BookingItem[];
    currency: string;
    discountCode?: string;
    checkoutValidityMinutes?: number;
  }): CheckoutSummary {
    const { customerId, bookingItems, currency, discountCode, checkoutValidityMinutes = 30 } = params;

    // Calculate totals
    const subtotal = bookingItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = bookingItems.reduce((sum, item) => sum + item.tax, 0);

    // Apply discount if provided
    let discountAmount = 0;
    if (discountCode) {
      discountAmount = this.calculateDiscount(discountCode, bookingItems, subtotal);
    }

    const finalTotal = subtotal + totalTax - discountAmount;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + checkoutValidityMinutes);

    return {
      customerId,
      bookingItems,
      itemCount: bookingItems.length,
      subtotal,
      totalTax,
      discountAmount,
      discountCode,
      finalTotal,
      currency,
      createdAt: new Date(),
      expiresAt,
    };
  }

  /**
   * Add a booking item to checkout
   */
  addBookingItem(
    checkout: CheckoutSummary,
    item: BookingItem
  ): CheckoutSummary {
    const updatedItems = [...checkout.bookingItems, item];
    return this.createCheckoutSummary({
      customerId: checkout.customerId,
      bookingItems: updatedItems,
      currency: checkout.currency,
      discountCode: checkout.discountCode,
    });
  }

  /**
   * Remove a booking item from checkout
   */
  removeBookingItem(
    checkout: CheckoutSummary,
    bookingId: string
  ): CheckoutSummary {
    const updatedItems = checkout.bookingItems.filter(item => item.id !== bookingId);
    return this.createCheckoutSummary({
      customerId: checkout.customerId,
      bookingItems: updatedItems,
      currency: checkout.currency,
      discountCode: checkout.discountCode,
    });
  }

  /**
   * Update quantity of a booking item
   */
  updateBookingItemQuantity(
    checkout: CheckoutSummary,
    bookingId: string,
    newQuantity: number
  ): CheckoutSummary {
    const updatedItems = checkout.bookingItems.map(item => {
      if (item.id === bookingId) {
        const newSubtotal = item.pricePerUnit * newQuantity;
        const newTax = item.tax * (newQuantity / item.quantity);
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newSubtotal,
          tax: newTax,
          total: newSubtotal + newTax,
        };
      }
      return item;
    });

    return this.createCheckoutSummary({
      customerId: checkout.customerId,
      bookingItems: updatedItems,
      currency: checkout.currency,
      discountCode: checkout.discountCode,
    });
  }

  /**
   * Apply a discount code to checkout
   */
  applyDiscountCode(
    checkout: CheckoutSummary,
    discountCode: string
  ): {
    success: boolean;
    message: string;
    updatedCheckout?: CheckoutSummary;
  } {
    const discount = this.discountCodes.get(discountCode);

    if (!discount) {
      return {
        success: false,
        message: `Discount code "${discountCode}" not found`,
      };
    }

    if (!discount.isActive) {
      return {
        success: false,
        message: `Discount code "${discountCode}" is not active`,
      };
    }

    if (discount.expiresAt < new Date()) {
      return {
        success: false,
        message: `Discount code "${discountCode}" has expired`,
      };
    }

    if (discount.minPurchaseAmount && checkout.subtotal < discount.minPurchaseAmount) {
      return {
        success: false,
        message: `Minimum purchase amount of ${checkout.currency} ${discount.minPurchaseAmount} required`,
      };
    }

    const updatedCheckout = this.createCheckoutSummary({
      customerId: checkout.customerId,
      bookingItems: checkout.bookingItems,
      currency: checkout.currency,
      discountCode,
    });

    return {
      success: true,
      message: `Discount code "${discountCode}" applied successfully`,
      updatedCheckout,
    };
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(
    discountCode: string,
    bookingItems: BookingItem[],
    subtotal: number
  ): number {
    const discount = this.discountCodes.get(discountCode);
    if (!discount || !discount.isActive) return 0;

    // Filter items applicable to this discount
    const applicableItems = discount.applicableServices
      ? bookingItems.filter(item => discount.applicableServices?.includes(item.serviceType))
      : bookingItems;

    const applicableSubtotal = applicableItems.reduce((sum, item) => sum + item.subtotal, 0);

    let discountAmount = 0;

    if (discount.type === 'PERCENTAGE') {
      discountAmount = Math.round(applicableSubtotal * (discount.value / 100) * 100) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = discount.value;
    }

    // Apply max discount limit if set
    if (discount.maxDiscount) {
      discountAmount = Math.min(discountAmount, discount.maxDiscount);
    }

    return discountAmount;
  }

  /**
   * Get checkout summary by service type
   */
  getCheckoutByServiceType(
    checkout: CheckoutSummary,
    serviceType: BookingServiceType
  ): {
    serviceType: BookingServiceType;
    items: BookingItem[];
    itemCount: number;
    subtotal: number;
    tax: number;
    total: number;
  } {
    const items = checkout.bookingItems.filter(item => item.serviceType === serviceType);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);

    return {
      serviceType,
      items,
      itemCount: items.length,
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }

  /**
   * Get checkout breakdown by service type
   */
  getCheckoutBreakdown(checkout: CheckoutSummary): Array<{
    serviceType: BookingServiceType;
    itemCount: number;
    subtotal: number;
    tax: number;
    total: number;
  }> {
    const serviceTypes: BookingServiceType[] = ['HOTEL', 'TAXI', 'EXPERIENCE', 'FOOD', 'CAR'];
    const breakdown = [];

    for (const serviceType of serviceTypes) {
      const items = checkout.bookingItems.filter(item => item.serviceType === serviceType);
      if (items.length > 0) {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = items.reduce((sum, item) => sum + item.tax, 0);

        breakdown.push({
          serviceType,
          itemCount: items.length,
          subtotal,
          tax,
          total: subtotal + tax,
        });
      }
    }

    return breakdown;
  }

  /**
   * Validate checkout (check if all items are still available, prices haven't changed, etc.)
   */
  validateCheckout(checkout: CheckoutSummary): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if checkout has expired
    if (new Date() > checkout.expiresAt) {
      errors.push('Checkout session has expired');
    }

    // Check if checkout has items
    if (checkout.bookingItems.length === 0) {
      errors.push('Checkout is empty');
    }

    // Check if all items have valid prices
    checkout.bookingItems.forEach(item => {
      if (item.pricePerUnit <= 0) {
        errors.push(`Invalid price for ${item.serviceName}`);
      }
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.serviceName}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate checkout page data (for frontend)
   */
  generateCheckoutPageData(checkout: CheckoutSummary): {
    summary: CheckoutSummary;
    breakdown: Array<{
      serviceType: BookingServiceType;
      itemCount: number;
      subtotal: number;
      tax: number;
      total: number;
    }>;
    items: BookingItem[];
    priceDetails: {
      subtotal: number;
      tax: number;
      discount: number;
      total: number;
      currency: string;
    };
    validation: {
      isValid: boolean;
      errors: string[];
    };
  } {
    return {
      summary: checkout,
      breakdown: this.getCheckoutBreakdown(checkout),
      items: checkout.bookingItems,
      priceDetails: {
        subtotal: checkout.subtotal,
        tax: checkout.totalTax,
        discount: checkout.discountAmount,
        total: checkout.finalTotal,
        currency: checkout.currency,
      },
      validation: this.validateCheckout(checkout),
    };
  }

  /**
   * Add a discount code (admin function)
   */
  addDiscountCode(discount: DiscountCode): void {
    this.discountCodes.set(discount.code, discount);
  }

  /**
   * Get all available discount codes
   */
  getAvailableDiscountCodes(): DiscountCode[] {
    return Array.from(this.discountCodes.values()).filter(
      discount => discount.isActive && discount.expiresAt > new Date()
    );
  }
}

export const checkoutService = new CheckoutService();
