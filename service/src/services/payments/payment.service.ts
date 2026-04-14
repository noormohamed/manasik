/**
 * Payment Service
 * 
 * Handles payment processing for all booking types.
 * Integrates with tax services to calculate accurate pricing.
 * 
 * Future Implementation:
 * - Integration with payment gateways (Stripe, PayPal, etc.)
 * - Payment method handling (credit card, digital wallets, etc.)
 * - Refund processing
 * - Payment status tracking
 * - Invoice generation
 */

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'DIGITAL_WALLET' | 'BANK_TRANSFER';

export interface PaymentDetails {
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  timestamp: Date;
}

export interface PriceQuote {
  bookingId: string;
  pricePerNight?: number;
  nights?: number;
  roomCount?: number;
  subtotal: number;
  territory: string;
  taxRate: number;
  tax: number;
  total: number;
  currency: string;
  validUntil: Date;
}

export class PaymentService {
  /**
   * Generate a price quote for a booking
   */
  generatePriceQuote(params: {
    bookingId: string;
    subtotal: number;
    territory: string;
    taxRate: number;
    currency: string;
    quoteValidityMinutes?: number;
  }): PriceQuote {
    const { bookingId, subtotal, territory, taxRate, currency, quoteValidityMinutes = 30 } = params;

    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;

    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + quoteValidityMinutes);

    return {
      bookingId,
      subtotal,
      territory,
      taxRate,
      tax,
      total,
      currency,
      validUntil,
    };
  }

  /**
   * Validate a price quote
   */
  validatePriceQuote(quote: PriceQuote, currentTaxRate: number): {
    isValid: boolean;
    reason?: string;
    currentQuote?: PriceQuote;
  } {
    const now = new Date();

    // Check if quote has expired
    if (now > quote.validUntil) {
      return {
        isValid: false,
        reason: 'Price quote has expired',
      };
    }

    // Check if tax rate has changed
    if (currentTaxRate !== quote.taxRate) {
      const newTax = Math.round(quote.subtotal * currentTaxRate * 100) / 100;
      const newTotal = quote.subtotal + newTax;

      return {
        isValid: false,
        reason: 'Price has changed due to tax rate update',
        currentQuote: {
          ...quote,
          taxRate: currentTaxRate,
          tax: newTax,
          total: newTotal,
        },
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefundAmount(params: {
    totalAmount: number;
    cancellationPolicy: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'NO_REFUND' | 'DAYS_BASED';
    daysBeforeCheckIn?: number;
  }): {
    refundAmount: number;
    retainedAmount: number;
    policy: string;
  } {
    const { totalAmount, cancellationPolicy, daysBeforeCheckIn = 0 } = params;

    switch (cancellationPolicy) {
      case 'FULL_REFUND':
        return {
          refundAmount: totalAmount,
          retainedAmount: 0,
          policy: 'Full refund',
        };

      case 'PARTIAL_REFUND':
        return {
          refundAmount: Math.round(totalAmount * 0.5 * 100) / 100,
          retainedAmount: Math.round(totalAmount * 0.5 * 100) / 100,
          policy: '50% refund',
        };

      case 'NO_REFUND':
        return {
          refundAmount: 0,
          retainedAmount: totalAmount,
          policy: 'No refund',
        };

      case 'DAYS_BASED':
        if (daysBeforeCheckIn >= 7) {
          return {
            refundAmount: totalAmount,
            retainedAmount: 0,
            policy: 'Full refund (7+ days before check-in)',
          };
        } else if (daysBeforeCheckIn >= 3) {
          return {
            refundAmount: Math.round(totalAmount * 0.5 * 100) / 100,
            retainedAmount: Math.round(totalAmount * 0.5 * 100) / 100,
            policy: '50% refund (3-6 days before check-in)',
          };
        } else {
          return {
            refundAmount: 0,
            retainedAmount: totalAmount,
            policy: 'No refund (less than 3 days before check-in)',
          };
        }

      default:
        throw new Error(`Unknown cancellation policy: ${cancellationPolicy}`);
    }
  }

  /**
   * Process a payment (Theoretical)
   */
  async processPayment(params: {
    bookingId: string;
    customerId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    paymentGateway?: string;
  }): Promise<PaymentDetails> {
    const { bookingId, customerId, amount, currency, method } = params;

    const paymentDetails: PaymentDetails = {
      bookingId,
      customerId,
      amount,
      currency,
      status: 'PENDING',
      method,
      timestamp: new Date(),
    };

    // In real implementation:
    // 1. Validate amount and currency
    // 2. Call payment gateway (Stripe, PayPal, etc.)
    // 3. Handle response and update status
    // 4. Store transaction details
    // 5. Emit payment events

    return paymentDetails;
  }

  /**
   * Process a refund (Theoretical)
   */
  async processRefund(params: {
    bookingId: string;
    transactionId: string;
    refundAmount: number;
    reason: string;
  }): Promise<PaymentDetails> {
    const { bookingId, transactionId, refundAmount, reason } = params;

    const refundDetails: PaymentDetails = {
      bookingId,
      customerId: '',
      amount: refundAmount,
      currency: 'GBP',
      status: 'PENDING',
      method: 'CREDIT_CARD',
      transactionId,
      timestamp: new Date(),
    };

    // In real implementation:
    // 1. Validate refund amount against original payment
    // 2. Call payment gateway refund API
    // 3. Handle response and update status
    // 4. Store refund details
    // 5. Emit refund events

    return refundDetails;
  }

  /**
   * Generate invoice (Theoretical)
   */
  generateInvoice(params: {
    bookingId: string;
    customerId: string;
    serviceName: string;
    checkInDate?: string;
    checkOutDate?: string;
    quantity?: number;
    pricePerUnit?: number;
    subtotal: number;
    tax: number;
    total: number;
    territory: string;
    currency: string;
  }): {
    invoiceId: string;
    bookingId: string;
    content: string;
    generatedAt: Date;
  } {
    const invoiceId = `INV-${params.bookingId}-${Date.now()}`;

    const content = `
INVOICE
Invoice ID: ${invoiceId}
Booking ID: ${params.bookingId}
Customer ID: ${params.customerId}

SERVICE DETAILS
Service: ${params.serviceName}
${params.checkInDate ? `Check-in: ${params.checkInDate}` : ''}
${params.checkOutDate ? `Check-out: ${params.checkOutDate}` : ''}

BOOKING DETAILS
${params.quantity ? `Quantity: ${params.quantity}` : ''}
${params.pricePerUnit ? `Price per Unit: ${params.currency} ${params.pricePerUnit}` : ''}
Subtotal: ${params.currency} ${params.subtotal}

TAX CALCULATION
Territory: ${params.territory}
Tax Rate: ${(params.tax / params.subtotal * 100).toFixed(2)}%
Tax Amount: ${params.currency} ${params.tax}

TOTAL
Total Amount: ${params.currency} ${params.total}

Generated: ${new Date().toISOString()}
    `.trim();

    return {
      invoiceId,
      bookingId: params.bookingId,
      content,
      generatedAt: new Date(),
    };
  }
}

export const paymentService = new PaymentService();
