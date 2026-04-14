"use strict";
/**
 * Checkout Session Model
 * Represents a shopping cart session for both guests and authenticated users
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutSession = void 0;
class CheckoutSession {
    constructor(params) {
        var _a;
        this.id = params.id;
        this.sessionId = params.sessionId;
        this.customerId = params.customerId;
        this.email = params.email;
        this.bookingItems = params.bookingItems || [];
        this.itemCount = this.bookingItems.length;
        this.subtotal = this.bookingItems.reduce((sum, item) => sum + item.subtotal, 0);
        this.totalTax = this.bookingItems.reduce((sum, item) => sum + item.tax, 0);
        this.discountAmount = 0;
        this.finalTotal = this.subtotal + this.totalTax;
        this.currency = params.currency || 'GBP';
        this.status = 'ACTIVE';
        this.isGuest = (_a = params.isGuest) !== null && _a !== void 0 ? _a : true;
        this.createdAt = new Date();
        this.expiresAt = this.calculateExpiry();
        this.updatedAt = new Date();
    }
    /**
     * Add booking item to session
     */
    addItem(item) {
        const existing = this.bookingItems.findIndex(b => b.id === item.id);
        if (existing >= 0) {
            this.updateItemQuantity(item.id, item.quantity);
        }
        else {
            this.bookingItems.push(item);
        }
        this.recalculateTotals();
    }
    /**
     * Remove booking item from session
     */
    removeItem(bookingId) {
        this.bookingItems = this.bookingItems.filter(item => item.id !== bookingId);
        this.recalculateTotals();
    }
    /**
     * Update item quantity
     */
    updateItemQuantity(bookingId, newQuantity) {
        const item = this.bookingItems.find(b => b.id === bookingId);
        if (!item)
            return;
        const quantityRatio = newQuantity / item.quantity;
        item.quantity = newQuantity;
        item.subtotal = item.pricePerUnit * newQuantity;
        item.tax = item.tax * quantityRatio;
        item.total = item.subtotal + item.tax;
        this.recalculateTotals();
    }
    /**
     * Apply discount code
     */
    applyDiscount(discountCode, discountAmount) {
        this.discountCode = discountCode;
        this.discountAmount = discountAmount;
        this.recalculateTotals();
    }
    /**
     * Clear discount
     */
    clearDiscount() {
        this.discountCode = undefined;
        this.discountAmount = 0;
        this.recalculateTotals();
    }
    /**
     * Recalculate totals
     */
    recalculateTotals() {
        this.itemCount = this.bookingItems.length;
        this.subtotal = this.bookingItems.reduce((sum, item) => sum + item.subtotal, 0);
        this.totalTax = this.bookingItems.reduce((sum, item) => sum + item.tax, 0);
        this.finalTotal = this.subtotal + this.totalTax - this.discountAmount;
        this.updatedAt = new Date();
    }
    /**
     * Calculate expiry time (30 minutes from now)
     */
    calculateExpiry() {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 30);
        return expiry;
    }
    /**
     * Check if session is expired
     */
    isExpired() {
        return new Date() > this.expiresAt;
    }
    /**
     * Mark as completed
     */
    complete() {
        this.status = 'COMPLETED';
        this.updatedAt = new Date();
    }
    /**
     * Mark as abandoned
     */
    abandon() {
        this.status = 'ABANDONED';
        this.updatedAt = new Date();
    }
}
exports.CheckoutSession = CheckoutSession;
