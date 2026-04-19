/**
 * BookingConfirmationPrint Component
 * Printable booking confirmation page
 */

import React from 'react';
import { Booking } from './types';
import { formatDate, formatCurrency, formatTime } from './utils';
import styles from './BookingConfirmationPrint.module.css';

interface BookingConfirmationPrintProps {
  booking: Booking;
}

const BookingConfirmationPrint: React.FC<BookingConfirmationPrintProps> = ({ booking }) => {
  // Calculate refund proportions for tax
  const refundTax = booking.refundAmount && booking.total > 0
    ? (booking.refundAmount / booking.total) * booking.tax
    : 0;

  return (
    <div className={styles.printContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Booking Confirmation</h1>
          <p className={styles.bookingId}>Booking ID: {booking.id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Hotel Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hotel Information</h2>
          <div className={styles.hotelInfo}>
            {booking.hotelImage && (
              <img src={booking.hotelImage} alt={booking.hotelName} className={styles.hotelImage} />
            )}
            <div className={styles.hotelDetails}>
              <h3 className={styles.hotelName}>{booking.hotelName}</h3>
              {booking.starRating && (
                <p className={styles.starRating}>
                  {'★'.repeat(booking.starRating)}{'☆'.repeat(5 - booking.starRating)}
                </p>
              )}
              <p className={styles.address}>{booking.hotelFullAddress || booking.hotelAddress}</p>
              {booking.hotelPhone && <p className={styles.phone}>Phone: {booking.hotelPhone}</p>}
            </div>
          </div>
        </section>

        {/* Accommodation Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accommodation Details</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <span className={styles.label}>Room Type</span>
              <span className={styles.value}>{booking.roomName}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.label}>Check-in</span>
              <span className={styles.value}>
                {formatDate(booking.checkIn)} at {formatTime(booking.checkInTime || '14:00')}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.label}>Check-out</span>
              <span className={styles.value}>
                {formatDate(booking.checkOut)} at {formatTime(booking.checkOutTime || '11:00')}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.label}>Duration</span>
              <span className={styles.value}>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.label}>Guests</span>
              <span className={styles.value}>{booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.label}>Status</span>
              <span className={`${styles.value} ${styles.status}`}>{booking.status}</span>
            </div>
          </div>
        </section>

        {/* Guest Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Guest Information</h2>
          <div className={styles.guestInfo}>
            <div className={styles.guestItem}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>{booking.guestName}</span>
            </div>
            <div className={styles.guestItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{booking.guestEmail}</span>
            </div>
            {booking.guestPhone && (
              <div className={styles.guestItem}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>{booking.guestPhone}</span>
              </div>
            )}
          </div>
        </section>

        {/* Payment Summary */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Payment Summary</h2>
          <div className={styles.paymentSummary}>
            <div className={styles.paymentRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(booking.subtotal, booking.currency)}</span>
            </div>

            {booking.refundAmount && booking.refundAmount > 0 && (
              <div className={styles.paymentRow}>
                <span>
                  {booking.refundAmount >= booking.total ? 'Full Refund' : 'Partial Refund'}
                </span>
                <span style={{ color: '#dc3545' }}>
                  -{formatCurrency(booking.refundAmount, booking.currency)}
                </span>
              </div>
            )}

            <div className={styles.paymentRow}>
              <span>Tax</span>
              <span>{formatCurrency(booking.tax - refundTax, booking.currency)}</span>
            </div>

            <div className={`${styles.paymentRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatCurrency(booking.total - (booking.refundAmount || 0), booking.currency)}</span>
            </div>

            {booking.refundAmount && booking.refundAmount > 0 && (
              <div className={styles.refundInfo}>
                {booking.refundReason && (
                  <p>
                    <strong>Refund Reason:</strong> {booking.refundReason}
                  </p>
                )}
                {booking.refundedAt && (
                  <p>
                    <strong>Refunded on:</strong> {new Date(booking.refundedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Haram Gate Information */}
        {(booking.closestGate || booking.kaabaGate) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Haram Gate Access</h2>
            <div className={styles.gateInfo}>
              {booking.closestGate && (
                <div className={styles.gateItem}>
                  <span className={styles.label}>{booking.closestGate.name}</span>
                  <span className={styles.value}>
                    {booking.closestGate.distance}m • {booking.closestGate.walkingTime} min walk
                  </span>
                </div>
              )}
              {booking.kaabaGate && (
                <div className={styles.gateItem}>
                  <span className={styles.label}>{booking.kaabaGate.name}</span>
                  <span className={styles.value}>
                    {booking.kaabaGate.distance}m • {booking.kaabaGate.walkingTime} min walk
                  </span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>This is your booking confirmation. Please keep it for your records.</p>
        <p className={styles.printDate}>Printed on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default BookingConfirmationPrint;
