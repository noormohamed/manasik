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
  isHotelManager?: boolean;
}

const PaymentSummarySection: React.FC<PaymentSummarySectionProps> = ({ booking, isHotelManager = false }) => {
  // Calculate refund proportions for tax
  const refundTax = booking.refundAmount && booking.total > 0
    ? (booking.refundAmount / booking.total) * booking.tax
    : 0;

  const showManasikFee = isHotelManager && booking.manasikFeeAmount > 0;
  const hotelPayout = showManasikFee
    ? Math.round((booking.subtotal - booking.manasikFeeAmount) * 100) / 100
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

        {/* Broker Fee (if present) */}
        {booking.brokerFee && booking.brokerFee > 0 && (
          <div className={styles.paymentRow}>
            <span>Broker Fee</span>
            <span>{formatCurrency(booking.brokerFee, booking.currency)}</span>
          </div>
        )}

        {/* Manasik Fee - hotel manager only */}
        {showManasikFee && (
          <>
            <div className={styles.paymentRow}>
              <span>Manasik Fee ({booking.manasikFeePercent}%)</span>
              <span style={{ color: '#6f42c1' }}>-{formatCurrency(booking.manasikFeeAmount, booking.currency)}</span>
            </div>
            <div className={styles.paymentRow}>
              <span style={{ fontWeight: 600 }}>Hotel Payout</span>
              <span style={{ fontWeight: 600, color: '#28a745' }}>{formatCurrency(hotelPayout, booking.currency)}</span>
            </div>
          </>
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
