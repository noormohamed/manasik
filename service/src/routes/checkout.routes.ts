/**
 * Checkout Routes
 * 
 * Handles Stripe Checkout Session creation and payment verification
 */

import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database/connection';
import { StripeCheckoutService } from '../services/payments/stripe-checkout.service';

const router = new Router({ prefix: '/api/checkout' });

let db: Database;
let stripeService: StripeCheckoutService;

export const initializeCheckoutRoutes = (database: Database) => {
  db = database;
  stripeService = new StripeCheckoutService(database);
};

/**
 * POST /api/checkout/create-session
 * Create a Stripe Checkout Session for payment
 */
router.post('/create-session', async (ctx: any) => {
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
    const session = await stripeService.createCheckoutSession({
      customerEmail,
      items: items.map((item: any) => ({
        name: item.name,
        description: item.description,
        amount: Math.round(item.amount * 100), // Convert to pence/cents
        quantity: item.quantity || 1,
        currency: item.currency || 'GBP',
      })),
      successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/checkout/cancel`,
      metadata: {
        ...metadata,
        customerId: customerId || '',
        bookingIds: bookingIds ? JSON.stringify(bookingIds) : '',
      },
    });

    // Store pending payment record
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.amount * (item.quantity || 1)), 0);
    
    await stripeService.storePaymentRecord({
      sessionId: session.sessionId,
      bookingId: bookingIds?.[0] || null,
      customerId: customerId || null,
      amount: totalAmount,
      currency: items[0]?.currency || 'GBP',
      status: 'pending',
      metadata: {
        items,
        bookingIds,
        customerEmail,
      },
    });

    ctx.body = {
      success: true,
      sessionId: session.sessionId,
      url: session.url,
      expiresAt: session.expiresAt,
    };
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
});

/**
 * GET /api/checkout/session/:sessionId
 * Get checkout session status and verify payment
 */
router.get('/session/:sessionId', async (ctx: any) => {
  try {
    const { sessionId } = ctx.params;

    if (!sessionId) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Session ID is required' };
      return;
    }

    // Get payment status from Stripe
    const paymentStatus = await stripeService.getCheckoutSession(sessionId);

    // Update payment record in database
    if (paymentStatus.paymentStatus === 'paid') {
      await stripeService.updatePaymentStatus(
        sessionId,
        'paid',
        paymentStatus.paymentIntentId
      );

      // Update booking status if bookingIds exist in metadata
      if (paymentStatus.metadata?.bookingIds) {
        try {
          const bookingIds = JSON.parse(paymentStatus.metadata.bookingIds);
          for (const bookingId of bookingIds) {
            await db.query(
              `UPDATE bookings SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW() WHERE id = ?`,
              [bookingId]
            );
          }
        } catch (e) {
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
  } catch (error: any) {
    console.error('Get checkout session error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message || 'Failed to get checkout session',
    };
  }
});

/**
 * POST /api/checkout/verify-payment
 * Verify payment and update booking status
 */
router.post('/verify-payment', async (ctx: any) => {
  try {
    const { sessionId } = ctx.request.body;

    if (!sessionId) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Session ID is required' };
      return;
    }

    // Get payment status from Stripe
    const paymentStatus = await stripeService.getCheckoutSession(sessionId);

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
    await stripeService.updatePaymentStatus(
      sessionId,
      'paid',
      paymentStatus.paymentIntentId
    );

    // Get payment record to find booking IDs
    const payment = await stripeService.getPaymentBySessionId(sessionId);
    let bookingIds: string[] = [];

    if (payment?.metadata) {
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
      await db.query(
        `UPDATE bookings SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW() WHERE id = ?`,
        [bookingId]
      );
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
  } catch (error: any) {
    console.error('Verify payment error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
});

export default router;
