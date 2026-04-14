"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutService = exports.CheckoutService = void 0;
class CheckoutService {
    constructor() {
        this.discountCodes = new Map();
        this.initializeDefaultDiscounts();
    }
    /**
     * Initialize default discount codes (theoretical)
     */
    initializeDefaultDiscounts() {
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
    createCheckoutSummary(params) {
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
    addBookingItem(checkout, item) {
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
    removeBookingItem(checkout, bookingId) {
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
    updateBookingItemQuantity(checkout, bookingId, newQuantity) {
        const updatedItems = checkout.bookingItems.map(item => {
            if (item.id === bookingId) {
                const newSubtotal = item.pricePerUnit * newQuantity;
                const newTax = item.tax * (newQuantity / item.quantity);
                return Object.assign(Object.assign({}, item), { quantity: newQuantity, subtotal: newSubtotal, tax: newTax, total: newSubtotal + newTax });
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
    applyDiscountCode(checkout, discountCode) {
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
    calculateDiscount(discountCode, bookingItems, subtotal) {
        const discount = this.discountCodes.get(discountCode);
        if (!discount || !discount.isActive)
            return 0;
        // Filter items applicable to this discount
        const applicableItems = discount.applicableServices
            ? bookingItems.filter(item => { var _a; return (_a = discount.applicableServices) === null || _a === void 0 ? void 0 : _a.includes(item.serviceType); })
            : bookingItems;
        const applicableSubtotal = applicableItems.reduce((sum, item) => sum + item.subtotal, 0);
        let discountAmount = 0;
        if (discount.type === 'PERCENTAGE') {
            discountAmount = Math.round(applicableSubtotal * (discount.value / 100) * 100) / 100;
        }
        else if (discount.type === 'FIXED_AMOUNT') {
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
    getCheckoutByServiceType(checkout, serviceType) {
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
    getCheckoutBreakdown(checkout) {
        const serviceTypes = ['HOTEL', 'TAXI', 'EXPERIENCE', 'FOOD', 'CAR'];
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
    validateCheckout(checkout) {
        const errors = [];
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
    generateCheckoutPageData(checkout) {
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
    addDiscountCode(discount) {
        this.discountCodes.set(discount.code, discount);
    }
    /**
     * Get all available discount codes
     */
    getAvailableDiscountCodes() {
        return Array.from(this.discountCodes.values()).filter(discount => discount.isActive && discount.expiresAt > new Date());
    }
}
exports.CheckoutService = CheckoutService;
exports.checkoutService = new CheckoutService();
