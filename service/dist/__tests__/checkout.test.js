"use strict";
/**
 * Checkout Service Tests
 * Tests for hotel booking checkout page
 */
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_service_1 = require("../services/checkout.service");
describe('Checkout Service - Hotels', () => {
    let hotelBookingItem1;
    let hotelBookingItem2;
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
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
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
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
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
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
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
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            expect(checkout.itemCount).toBe(1);
            checkout = checkout_service_1.checkoutService.addBookingItem(checkout, hotelBookingItem2);
            expect(checkout.itemCount).toBe(2);
            expect(checkout.subtotal).toBe(2300); // 1500 + 800
            expect(checkout.finalTotal).toBe(2760); // 2300 + 460
        });
        it('should remove a booking item from checkout', () => {
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            expect(checkout.itemCount).toBe(2);
            checkout = checkout_service_1.checkoutService.removeBookingItem(checkout, 'hotel-booking-456');
            expect(checkout.itemCount).toBe(1);
            expect(checkout.subtotal).toBe(1500);
            expect(checkout.finalTotal).toBe(1800);
        });
    });
    describe('Update Booking Item Quantity', () => {
        it('should update quantity of a booking item', () => {
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            expect(checkout.subtotal).toBe(1500);
            checkout = checkout_service_1.checkoutService.updateBookingItemQuantity(checkout, 'hotel-booking-123', 2);
            expect(checkout.subtotal).toBe(3000); // 1500 × 2
            expect(checkout.totalTax).toBe(600); // 3000 × 0.20
            expect(checkout.finalTotal).toBe(3600);
        });
    });
    describe('Discount Code Application', () => {
        it('should apply a percentage discount code', () => {
            var _a, _b, _c;
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            const result = checkout_service_1.checkoutService.applyDiscountCode(checkout, 'WELCOME10');
            expect(result.success).toBe(true);
            expect((_a = result.updatedCheckout) === null || _a === void 0 ? void 0 : _a.discountCode).toBe('WELCOME10');
            expect((_b = result.updatedCheckout) === null || _b === void 0 ? void 0 : _b.discountAmount).toBe(150); // 1500 × 10%
            expect((_c = result.updatedCheckout) === null || _c === void 0 ? void 0 : _c.finalTotal).toBe(1650); // 1800 - 150
        });
        it('should apply a fixed amount discount code', () => {
            var _a, _b;
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            const result = checkout_service_1.checkoutService.applyDiscountCode(checkout, 'SAVE50');
            expect(result.success).toBe(true);
            expect((_a = result.updatedCheckout) === null || _a === void 0 ? void 0 : _a.discountAmount).toBe(50);
            expect((_b = result.updatedCheckout) === null || _b === void 0 ? void 0 : _b.finalTotal).toBe(2710); // 2760 - 50
        });
        it('should reject invalid discount code', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            const result = checkout_service_1.checkoutService.applyDiscountCode(checkout, 'INVALID123');
            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });
        it('should reject discount code below minimum purchase', () => {
            const smallItem = Object.assign(Object.assign({}, hotelBookingItem1), { subtotal: 30, tax: 6, total: 36 });
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [smallItem],
                currency: 'GBP',
            });
            const result = checkout_service_1.checkoutService.applyDiscountCode(checkout, 'WELCOME10');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Minimum purchase amount');
        });
        it('should apply discount only to applicable service types', () => {
            var _a;
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            const result = checkout_service_1.checkoutService.applyDiscountCode(checkout, 'HOTEL20');
            expect(result.success).toBe(true);
            // HOTEL20 applies only to HOTEL service type
            // Discount = (1500 + 800) × 20% = 460
            expect((_a = result.updatedCheckout) === null || _a === void 0 ? void 0 : _a.discountAmount).toBe(460);
        });
    });
    describe('Checkout Breakdown by Service Type', () => {
        it('should get checkout breakdown by service type', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            const breakdown = checkout_service_1.checkoutService.getCheckoutBreakdown(checkout);
            expect(breakdown.length).toBe(1);
            const hotelBreakdown = breakdown.find(b => b.serviceType === 'HOTEL');
            expect(hotelBreakdown === null || hotelBreakdown === void 0 ? void 0 : hotelBreakdown.itemCount).toBe(2);
            expect(hotelBreakdown === null || hotelBreakdown === void 0 ? void 0 : hotelBreakdown.subtotal).toBe(2300);
            expect(hotelBreakdown === null || hotelBreakdown === void 0 ? void 0 : hotelBreakdown.tax).toBe(460);
            expect(hotelBreakdown === null || hotelBreakdown === void 0 ? void 0 : hotelBreakdown.total).toBe(2760);
        });
        it('should get checkout by specific service type', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            const hotelCheckout = checkout_service_1.checkoutService.getCheckoutByServiceType(checkout, 'HOTEL');
            expect(hotelCheckout.serviceType).toBe('HOTEL');
            expect(hotelCheckout.itemCount).toBe(2);
            expect(hotelCheckout.subtotal).toBe(2300);
            expect(hotelCheckout.total).toBe(2760);
        });
    });
    describe('Checkout Validation', () => {
        it('should validate an active checkout', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            const validation = checkout_service_1.checkoutService.validateCheckout(checkout);
            expect(validation.isValid).toBe(true);
            expect(validation.errors.length).toBe(0);
        });
        it('should reject an expired checkout', () => {
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            // Manually set expiry to past
            checkout.expiresAt = new Date(Date.now() - 1000);
            const validation = checkout_service_1.checkoutService.validateCheckout(checkout);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Checkout session has expired');
        });
        it('should reject an empty checkout', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [],
                currency: 'GBP',
            });
            const validation = checkout_service_1.checkoutService.validateCheckout(checkout);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Checkout is empty');
        });
    });
    describe('Checkout Page Data Generation', () => {
        it('should generate complete checkout page data', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            const pageData = checkout_service_1.checkoutService.generateCheckoutPageData(checkout);
            expect(pageData.summary).toBeDefined();
            expect(pageData.breakdown).toBeDefined();
            expect(pageData.items.length).toBe(2);
            expect(pageData.priceDetails.subtotal).toBe(2300);
            expect(pageData.priceDetails.tax).toBe(460);
            expect(pageData.priceDetails.total).toBe(2760);
            expect(pageData.validation.isValid).toBe(true);
        });
        it('should include all service types in breakdown', () => {
            const checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1, hotelBookingItem2],
                currency: 'GBP',
            });
            const pageData = checkout_service_1.checkoutService.generateCheckoutPageData(checkout);
            expect(pageData.breakdown.length).toBe(1);
            expect(pageData.breakdown.map(b => b.serviceType)).toContain('HOTEL');
        });
    });
    describe('Multi-Service Checkout Workflow', () => {
        it('should complete a full multi-hotel checkout workflow', () => {
            // 1. Create checkout with first hotel booking
            let checkout = checkout_service_1.checkoutService.createCheckoutSummary({
                customerId: 'customer-123',
                bookingItems: [hotelBookingItem1],
                currency: 'GBP',
            });
            expect(checkout.finalTotal).toBe(1800);
            // 2. Add second hotel booking
            checkout = checkout_service_1.checkoutService.addBookingItem(checkout, hotelBookingItem2);
            expect(checkout.itemCount).toBe(2);
            expect(checkout.finalTotal).toBe(2760);
            // 3. Apply discount
            const discountResult = checkout_service_1.checkoutService.applyDiscountCode(checkout, 'WELCOME10');
            expect(discountResult.success).toBe(true);
            checkout = discountResult.updatedCheckout;
            // Discount applies to HOTEL (1500 + 800 = 2300 × 10% = 230)
            expect(checkout.discountAmount).toBe(230);
            expect(checkout.finalTotal).toBe(2530); // 2760 - 230
            // 4. Get breakdown
            const breakdown = checkout_service_1.checkoutService.getCheckoutBreakdown(checkout);
            expect(breakdown.length).toBe(1);
            expect(breakdown[0].serviceType).toBe('HOTEL');
            // 5. Validate checkout
            const validation = checkout_service_1.checkoutService.validateCheckout(checkout);
            expect(validation.isValid).toBe(true);
            // 6. Generate page data
            const pageData = checkout_service_1.checkoutService.generateCheckoutPageData(checkout);
            expect(pageData.items.length).toBe(2);
            expect(pageData.priceDetails.total).toBe(2530);
        });
    });
});
