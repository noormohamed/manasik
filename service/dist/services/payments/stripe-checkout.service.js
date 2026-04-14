"use strict";
/**
 * Stripe Checkout Service
 *
 * Handles Stripe Checkout Session creation and payment verification.
 * Uses Stripe's hosted checkout page for secure payment processing.
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
exports.stripeCheckoutService = exports.StripeCheckoutService = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class StripeCheckoutService {
    constructor(database) {
        this.database = database;
        this.baseURL = process.env.STRIPE_BASE_URL || 'https://api.stripe.com/v1';
        this.secretKey = process.env.STRIPE_SECRET_KEY || '';
        this.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.secretKey}`,
        };
    }
    /**
     * Create a Stripe Checkout Session
     * Returns a URL to redirect the user to Stripe's hosted checkout page
     */
    createCheckoutSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { customerId, customerEmail, items, successUrl, cancelUrl, metadata } = params;
            // Build line items for Stripe
            const lineItems = {};
            items.forEach((item, index) => {
                lineItems[`line_items[${index}][price_data][currency]`] = item.currency.toLowerCase();
                lineItems[`line_items[${index}][price_data][product_data][name]`] = item.name;
                if (item.description) {
                    lineItems[`line_items[${index}][price_data][product_data][description]`] = item.description;
                }
                lineItems[`line_items[${index}][price_data][unit_amount]`] = String(item.amount);
                lineItems[`line_items[${index}][quantity]`] = String(item.quantity);
            });
            // Build request body
            const requestBody = Object.assign(Object.assign({}, lineItems), { mode: 'payment', success_url: successUrl, cancel_url: cancelUrl });
            // Add customer info
            if (customerId) {
                requestBody.customer = customerId;
            }
            else if (customerEmail) {
                requestBody.customer_email = customerEmail;
            }
            // Add metadata
            if (metadata) {
                Object.entries(metadata).forEach(([key, value]) => {
                    requestBody[`metadata[${key}]`] = value;
                });
            }
            try {
                const response = yield axios_1.default.post(`${this.baseURL}/checkout/sessions`, new URLSearchParams(requestBody), { headers: this.headers });
                const session = response.data;
                return {
                    sessionId: session.id,
                    url: session.url,
                    expiresAt: new Date(session.expires_at * 1000),
                };
            }
            catch (error) {
                console.error('Stripe Checkout Session creation failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error(((_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || 'Failed to create checkout session');
            }
        });
    }
    /**
     * Retrieve a Checkout Session to verify payment status
     */
    getCheckoutSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/checkout/sessions/${sessionId}`, { headers: this.headers });
                const session = response.data;
                return {
                    sessionId: session.id,
                    paymentStatus: session.payment_status,
                    paymentIntentId: session.payment_intent,
                    amountTotal: session.amount_total,
                    currency: session.currency,
                    customerEmail: (_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email,
                    metadata: session.metadata,
                };
            }
            catch (error) {
                console.error('Failed to retrieve checkout session:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
                throw new Error(((_e = (_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) === null || _e === void 0 ? void 0 : _e.message) || 'Failed to retrieve checkout session');
            }
        });
    }
    /**
     * Store payment record in database
     */
    storePaymentRecord(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.database) {
                throw new Error('Database not initialized');
            }
            const paymentId = (0, uuid_1.v4)();
            yield this.database.query(`INSERT INTO payments (id, session_id, booking_id, customer_id, amount, currency, status, payment_intent_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                paymentId,
                params.sessionId,
                params.bookingId,
                params.customerId,
                params.amount,
                params.currency,
                params.status,
                params.paymentIntentId || null,
                params.metadata ? JSON.stringify(params.metadata) : null,
            ]);
            return paymentId;
        });
    }
    /**
     * Update payment status in database
     */
    updatePaymentStatus(sessionId, status, paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.database) {
                throw new Error('Database not initialized');
            }
            yield this.database.query(`UPDATE payments SET status = ?, payment_intent_id = ?, updated_at = NOW() WHERE session_id = ?`, [status, paymentIntentId || null, sessionId]);
        });
    }
    /**
     * Get payment by session ID
     */
    getPaymentBySessionId(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.database) {
                throw new Error('Database not initialized');
            }
            const results = yield this.database.query(`SELECT * FROM payments WHERE session_id = ?`, [sessionId]);
            return results.length > 0 ? results[0] : null;
        });
    }
}
exports.StripeCheckoutService = StripeCheckoutService;
exports.stripeCheckoutService = new StripeCheckoutService();
