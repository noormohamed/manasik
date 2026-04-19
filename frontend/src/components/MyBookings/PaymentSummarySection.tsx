/**
 * PaymentSummarySection Component
 * Displays payment breakdown and refund information
 */

import React from 'react';
import { Booking } from './types';
import { formatCurrency } from './utils';
import styles from './PaymentSummarySection.module.css';

interface PaymentSummarySectionProps {
  booking: Booking;
}

const PaymentSummarySection: React.FC<PaymentSummarySectionProps> = ({ booking }) => {
  // Calculate refund proportions for tax
  const refundTax = booking.refundAmount && booking.total > 0
    ? (booking.refundAmount / booking.total) * booking.tax
    : 0;

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Payment Summary</h3>

      <div className={styles.paymentSummary}>
        <div className={styles.paymentRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(booking.subtotal, booking.currency)}</span>
        </div>

        {booking.refundAmount && booking.refundAmount > 0 && (
          <div className={styles.paymentRow}>
            <span>
              {booking.refundAmount >= booking.total
                ? 'Full Refund'
                : 'Partial Refund'}
            </span>
            <span style={{ color: '#dc3545' }}>-{formatCurrency(booking.refundAmount, booking.currency)}</span>
          </div>
        )}

        <div className={styles.paymentRow}>
          <span>Tax</span>
          <span>{formatCurrency(booking.tax - refundTax, booking.currency)}</span>
        </div>

        <div className={styles.paymentRow + ' ' + styles.total}>
          <span>Total</span>
          <span
            style={{
              color:
                booking.status === 'CANCELLED' || booking.status === 'REFUNDED'
                  ? '#dc3545'
                  : '#0d6efd',
              textDecoration:
                booking.refundAmount && booking.refundAmount >= booking.total
                  ? 'line-through'
                  : 'none',
            }}
          >
            {formatCurrency(booking.total - (booking.refundAmount || 0), booking.currency)}
          </span>
        </div>

        {booking.refundAmount && booking.refundAmount > 0 && (
          <div className={styles.refundSection}>
            {booking.refundReason && (
              <div className={styles.refundReason}>
                <strong>Refund Reason:</strong> {booking.refundReason}
              </div>
            )}

            {booking.refundedAt && (
              <div className={styles.refundDate}>
                Refunded on: {new Date(booking.refundedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {booking.status === 'CANCELLED' && !booking.refundAmount && (
          <div className={styles.cancelledNotice}>
            <span>Booking Cancelled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSummarySection;
