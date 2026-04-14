"use strict";
/**
 * Checkout Session Service
 * Manages checkout sessions for both authenticated and guest users
 * TODO: Implement database persistence
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutSessionService = void 0;
const uuid_1 = require("uuid");
const checkout_session_1 = require("../models/checkout-session");
class CheckoutSessionService {
    /**
     * Get or create session for user
     */
    getOrCreateSession(sessionId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const isGuest = (_a = options === null || options === void 0 ? void 0 : options.isGuest) !== null && _a !== void 0 ? _a : true;
            const currency = (_b = options === null || options === void 0 ? void 0 : options.currency) !== null && _b !== void 0 ? _b : 'GBP';
            // Create new session
            const session = new checkout_session_1.CheckoutSession({
                id: (0, uuid_1.v4)(),
                sessionId,
                customerId: options === null || options === void 0 ? void 0 : options.customerId,
                email: options === null || options === void 0 ? void 0 : options.email,
                currency,
                isGuest,
            });
            return session;
        });
    }
    /**
     * Get session by ID
     */
    getSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Fetch from database
            return null;
        });
    }
    /**
     * Add booking item to session
     */
    addBookingItem(sessionId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.addItem(item);
            return session;
        });
    }
    /**
     * Remove booking item from session
     */
    removeBookingItem(sessionId, bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.removeItem(bookingId);
            return session;
        });
    }
    /**
     * Update booking item quantity
     */
    updateBookingItemQuantity(sessionId, bookingId, newQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.updateItemQuantity(bookingId, newQuantity);
            return session;
        });
    }
    /**
     * Apply discount code
     */
    applyDiscountCode(sessionId, discountCode, discountAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.applyDiscount(discountCode, discountAmount);
            return session;
        });
    }
    /**
     * Clear discount code
     */
    clearDiscountCode(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.clearDiscount();
            return session;
        });
    }
    /**
     * Complete session
     */
    completeSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.complete();
            return session;
        });
    }
    /**
     * Abandon session
     */
    abandonSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Mark as abandoned in database
            return true;
        });
    }
    /**
     * Migrate guest session to authenticated user
     */
    migrateGuestToUser(sessionId, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(sessionId);
            if (!session)
                return null;
            session.customerId = customerId;
            session.isGuest = false;
            return session;
        });
    }
    /**
     * Delete session
     */
    deleteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Delete from database
            return true;
        });
    }
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Delete expired sessions from database
            return 0;
        });
    }
}
exports.CheckoutSessionService = CheckoutSessionService;
