/**
 * Checkout Service Tests
 * Tests for hotel booking checkout page
 */

import { checkoutService, BookingItem } from '../services/checkout.service';

describe('Checkout Service - Hotels', () => {
  let hotelBookingItem1: BookingItem;
  let hotelBookingItem2: BookingItem;

  beforeEach(() => {
    hotelBookingItem1 = {
      id: 'hotel-booking-123',
      serviceType: 'HOTEL',
      serviceName: 'The Savoy London',
      description: '2 rooms for 3 nights',
      quantity: 1,
      pricePerUnit: 1500,
      subtotal: 1500,
      tax: 300,
      total: 1800,
      territory: 'GB',
      taxRate: 0.20,
      metadata: {
        hotelId: 'hotel-123',
        checkInDate: '2026-02-15',
        checkOutDate: '2026-02-18',
        roomCount: 2,
      },
    };

    hotelBookingItem2 = {
      id: 'hotel-booking-456',
      serviceType: 'HOTEL',
      serviceName: 'Claridge\'s London',
      description: '1 room for 2 nights',
      quantity: 1,
      pricePerUnit: 800,
      subtotal: 800,
      tax: 160,
      total: 960,
      territory: 'GB',
      taxRate: 0.20,
      metadata: {
        hotelId: 'hotel-456',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-03',
        roomCount: 1,
      },
    };
  });

  describe('Checkout Summary Creation', () => {
    it('should create a checkout summary with single hotel booking', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      expect(checkout.customerId).toBe('customer-123');
      expect(checkout.itemCount).toBe(1);
      expect(checkout.subtotal).toBe(1500);
      expect(checkout.totalTax).toBe(300);
      expect(checkout.finalTotal).toBe(1800);
      expect(checkout.currency).toBe('GBP');
      expect(checkout.discountAmount).toBe(0);
    });

    it('should create a checkout summary with multiple hotel bookings', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      expect(checkout.itemCount).toBe(2);
      expect(checkout.subtotal).toBe(2300); // 1500 + 800
      expect(checkout.totalTax).toBe(460); // 300 + 160
      expect(checkout.finalTotal).toBe(2760); // 2300 + 460
    });

    it('should set checkout expiry to 30 minutes by default', () => {
      const before = new Date();
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });
      const after = new Date();

      const expectedMinTime = new Date(before.getTime() + 29 * 60 * 1000);
      const expectedMaxTime = new Date(after.getTime() + 31 * 60 * 1000);

      expect(checkout.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMinTime.getTime());
      expect(checkout.expiresAt.getTime()).toBeLessThanOrEqual(expectedMaxTime.getTime());
    });
  });

  describe('Add/Remove Booking Items', () => {
    it('should add a booking item to checkout', () => {
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      expect(checkout.itemCount).toBe(1);

      checkout = checkoutService.addBookingItem(checkout, hotelBookingItem2);

      expect(checkout.itemCount).toBe(2);
      expect(checkout.subtotal).toBe(2300); // 1500 + 800
      expect(checkout.finalTotal).toBe(2760); // 2300 + 460
    });

    it('should remove a booking item from checkout', () => {
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      expect(checkout.itemCount).toBe(2);

      checkout = checkoutService.removeBookingItem(checkout, 'hotel-booking-456');

      expect(checkout.itemCount).toBe(1);
      expect(checkout.subtotal).toBe(1500);
      expect(checkout.finalTotal).toBe(1800);
    });
  });

  describe('Update Booking Item Quantity', () => {
    it('should update quantity of a booking item', () => {
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      expect(checkout.subtotal).toBe(1500);

      checkout = checkoutService.updateBookingItemQuantity(checkout, 'hotel-booking-123', 2);

      expect(checkout.subtotal).toBe(3000); // 1500 × 2
      expect(checkout.totalTax).toBe(600); // 3000 × 0.20
      expect(checkout.finalTotal).toBe(3600);
    });
  });

  describe('Discount Code Application', () => {
    it('should apply a percentage discount code', () => {
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      const result = checkoutService.applyDiscountCode(checkout, 'WELCOME10');

      expect(result.success).toBe(true);
      expect(result.updatedCheckout?.discountCode).toBe('WELCOME10');
      expect(result.updatedCheckout?.discountAmount).toBe(150); // 1500 × 10%
      expect(result.updatedCheckout?.finalTotal).toBe(1650); // 1800 - 150
    });

    it('should apply a fixed amount discount code', () => {
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      const result = checkoutService.applyDiscountCode(checkout, 'SAVE50');

      expect(result.success).toBe(true);
      expect(result.updatedCheckout?.discountAmount).toBe(50);
      expect(result.updatedCheckout?.finalTotal).toBe(2710); // 2760 - 50
    });

    it('should reject invalid discount code', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      const result = checkoutService.applyDiscountCode(checkout, 'INVALID123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should reject discount code below minimum purchase', () => {
      const smallItem: BookingItem = {
        ...hotelBookingItem1,
        subtotal: 30,
        tax: 6,
        total: 36,
      };

      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [smallItem],
        currency: 'GBP',
      });

      const result = checkoutService.applyDiscountCode(checkout, 'WELCOME10');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Minimum purchase amount');
    });

    it('should apply discount only to applicable service types', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      const result = checkoutService.applyDiscountCode(checkout, 'HOTEL20');

      expect(result.success).toBe(true);
      // HOTEL20 applies only to HOTEL service type
      // Discount = (1500 + 800) × 20% = 460
      expect(result.updatedCheckout?.discountAmount).toBe(460);
    });
  });

  describe('Checkout Breakdown by Service Type', () => {
    it('should get checkout breakdown by service type', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      const breakdown = checkoutService.getCheckoutBreakdown(checkout);

      expect(breakdown.length).toBe(1);

      const hotelBreakdown = breakdown.find(b => b.serviceType === 'HOTEL');
      expect(hotelBreakdown?.itemCount).toBe(2);
      expect(hotelBreakdown?.subtotal).toBe(2300);
      expect(hotelBreakdown?.tax).toBe(460);
      expect(hotelBreakdown?.total).toBe(2760);
    });

    it('should get checkout by specific service type', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      const hotelCheckout = checkoutService.getCheckoutByServiceType(checkout, 'HOTEL');

      expect(hotelCheckout.serviceType).toBe('HOTEL');
      expect(hotelCheckout.itemCount).toBe(2);
      expect(hotelCheckout.subtotal).toBe(2300);
      expect(hotelCheckout.total).toBe(2760);
    });
  });

  describe('Checkout Validation', () => {
    it('should validate an active checkout', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      const validation = checkoutService.validateCheckout(checkout);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should reject an expired checkout', () => {
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      // Manually set expiry to past
      checkout.expiresAt = new Date(Date.now() - 1000);

      const validation = checkoutService.validateCheckout(checkout);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Checkout session has expired');
    });

    it('should reject an empty checkout', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [],
        currency: 'GBP',
      });

      const validation = checkoutService.validateCheckout(checkout);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Checkout is empty');
    });
  });

  describe('Checkout Page Data Generation', () => {
    it('should generate complete checkout page data', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      const pageData = checkoutService.generateCheckoutPageData(checkout);

      expect(pageData.summary).toBeDefined();
      expect(pageData.breakdown).toBeDefined();
      expect(pageData.items.length).toBe(2);
      expect(pageData.priceDetails.subtotal).toBe(2300);
      expect(pageData.priceDetails.tax).toBe(460);
      expect(pageData.priceDetails.total).toBe(2760);
      expect(pageData.validation.isValid).toBe(true);
    });

    it('should include all service types in breakdown', () => {
      const checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1, hotelBookingItem2],
        currency: 'GBP',
      });

      const pageData = checkoutService.generateCheckoutPageData(checkout);

      expect(pageData.breakdown.length).toBe(1);
      expect(pageData.breakdown.map(b => b.serviceType)).toContain('HOTEL');
    });
  });

  describe('Multi-Service Checkout Workflow', () => {
    it('should complete a full multi-hotel checkout workflow', () => {
      // 1. Create checkout with first hotel booking
      let checkout = checkoutService.createCheckoutSummary({
        customerId: 'customer-123',
        bookingItems: [hotelBookingItem1],
        currency: 'GBP',
      });

      expect(checkout.finalTotal).toBe(1800);

      // 2. Add second hotel booking
      checkout = checkoutService.addBookingItem(checkout, hotelBookingItem2);
      expect(checkout.itemCount).toBe(2);
      expect(checkout.finalTotal).toBe(2760);

      // 3. Apply discount
      const discountResult = checkoutService.applyDiscountCode(checkout, 'WELCOME10');
      expect(discountResult.success).toBe(true);
      checkout = discountResult.updatedCheckout!;

      // Discount applies to HOTEL (1500 + 800 = 2300 × 10% = 230)
      expect(checkout.discountAmount).toBe(230);
      expect(checkout.finalTotal).toBe(2530); // 2760 - 230

      // 4. Get breakdown
      const breakdown = checkoutService.getCheckoutBreakdown(checkout);
      expect(breakdown.length).toBe(1);
      expect(breakdown[0].serviceType).toBe('HOTEL');

      // 5. Validate checkout
      const validation = checkoutService.validateCheckout(checkout);
      expect(validation.isValid).toBe(true);

      // 6. Generate page data
      const pageData = checkoutService.generateCheckoutPageData(checkout);
      expect(pageData.items.length).toBe(2);
      expect(pageData.priceDetails.total).toBe(2530);
    });
  });
});
