"use strict";
/**
 * Checkout Routes
 *
 * Handles Stripe Checkout Session creation and payment verification
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
exports.initializeCheckoutRoutes = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const stripe_checkout_service_1 = require("../services/payments/stripe-checkout.service");
const router = new koa_router_1.default({ prefix: '/api/checkout' });
let db;
let stripeService;
const initializeCheckoutRoutes = (database) => {
    db = database;
    stripeService = new stripe_checkout_service_1.StripeCheckoutService(database);
};
exports.initializeCheckoutRoutes = initializeCheckoutRoutes;
/**
 * POST /api/checkout/create-session
 * Create a Stripe Checkout Session for payment
 */
router.post('/create-session', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { items, customerEmail, customerId, bookingIds, metadata } = ctx.request.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            ctx.status = 400;
            ctx.body = { success: false, error: 'Items are required' };
            return;
        }
        // Get frontend URL from environment or request origin
        const frontendUrl = process.env.FRONTEND_URL || ctx.request.origin || 'http://localhost:3000';
        // Create checkout session
        const session = yield stripeService.createCheckoutSession({
            customerEmail,
            items: items.map((item) => ({
                name: item.name,
                description: item.description,
                amount: Math.round(item.amount * 100), // Convert to pence/cents
                quantity: item.quantity || 1,
                currency: item.currency || 'GBP',
            })),
            successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${frontendUrl}/checkout/cancel`,
            metadata: Object.assign(Object.assign({}, metadata), { customerId: customerId || '', bookingIds: bookingIds ? JSON.stringify(bookingIds) : '' }),
        });
        // Store pending payment record
        const totalAmount = items.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
        yield stripeService.storePaymentRecord({
            sessionId: session.sessionId,
            bookingId: (bookingIds === null || bookingIds === void 0 ? void 0 : bookingIds[0]) || null,
            customerId: customerId || null,
            amount: totalAmount,
            currency: ((_a = items[0]) === null || _a === void 0 ? void 0 : _a.currency) || 'GBP',
            status: 'pending',
            metadata: {
                items,
                bookingIds,
                customerEmail,
            },
        });
        ctx.body = {
            success: true,
            data: {
                sessionId: session.sessionId,
                url: session.url,
                expiresAt: session.expiresAt,
            },
        };
    }
    catch (error) {
        console.error('Create checkout session error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: error.message || 'Failed to create checkout session',
        };
    }
}));
/**
 * GET /api/checkout/session/:sessionId
 * Get checkout session status and verify payment
 */
router.get('/session/:sessionId', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { sessionId } = ctx.params;
        if (!sessionId) {
            ctx.status = 400;
            ctx.body = { success: false, error: 'Session ID is required' };
            return;
        }
        // Get payment status from Stripe
        const paymentStatus = yield stripeService.getCheckoutSession(sessionId);
        // Update payment record in database
        if (paymentStatus.paymentStatus === 'paid') {
            yield stripeService.updatePaymentStatus(sessionId, 'paid', paymentStatus.paymentIntentId);
            // Update booking status if bookingIds exist in metadata
            if ((_a = paymentStatus.metadata) === null || _a === void 0 ? void 0 : _a.bookingIds) {
                try {
                    const bookingIds = JSON.parse(paymentStatus.metadata.bookingIds);
                    for (const bookingId of bookingIds) {
                        yield db.query(`UPDATE bookings SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW() WHERE id = ?`, [bookingId]);
                    }
                }
                catch (e) {
                    console.error('Failed to update booking status:', e);
                }
            }
        }
        ctx.body = {
            success: true,
            data: {
                sessionId: paymentStatus.sessionId,
                paymentStatus: paymentStatus.paymentStatus,
                amountTotal: paymentStatus.amountTotal / 100, // Convert back to pounds/dollars
                currency: paymentStatus.currency,
                customerEmail: paymentStatus.customerEmail,
                metadata: paymentStatus.metadata,
            },
        };
    }
    catch (error) {
        console.error('Get checkout session error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: error.message || 'Failed to get checkout session',
        };
    }
}));
/**
 * POST /api/checkout/verify-payment
 * Verify payment and update booking status
 */
router.post('/verify-payment', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId } = ctx.request.body;
        if (!sessionId) {
            ctx.status = 400;
            ctx.body = { success: false, error: 'Session ID is required' };
            return;
        }
        // Get payment status from Stripe
        const paymentStatus = yield stripeService.getCheckoutSession(sessionId);
        if (paymentStatus.paymentStatus !== 'paid') {
            ctx.body = {
                success: false,
                error: 'Payment not completed',
                data: {
                    paymentStatus: paymentStatus.paymentStatus,
                },
            };
            return;
        }
        // Update payment record
        yield stripeService.updatePaymentStatus(sessionId, 'paid', paymentStatus.paymentIntentId);
        // Get payment record to find booking IDs
        const payment = yield stripeService.getPaymentBySessionId(sessionId);
        let bookingIds = [];
        if (payment === null || payment === void 0 ? void 0 : payment.metadata) {
            const metadata = typeof payment.metadata === 'string'
                ? JSON.parse(payment.metadata)
                : payment.metadata;
            if (metadata.bookingIds) {
                bookingIds = Array.isArray(metadata.bookingIds)
                    ? metadata.bookingIds
                    : JSON.parse(metadata.bookingIds);
            }
        }
        // Update booking statuses
        for (const bookingId of bookingIds) {
            yield db.query(`UPDATE bookings SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW() WHERE id = ?`, [bookingId]);
        }
        ctx.body = {
            success: true,
            data: {
                paymentStatus: 'paid',
                amountTotal: paymentStatus.amountTotal / 100,
                currency: paymentStatus.currency,
                bookingIds,
            },
        };
    }
    catch (error) {
        console.error('Verify payment error:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            error: error.message || 'Failed to verify payment',
        };
    }
}));
exports.default = router;
