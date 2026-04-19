/**
 * BookingCard Component
 * Displays a single booking in the list with selection state
 */

import React from 'react';
import { Booking } from './types';
import { formatDate, getStatusBadgeClass, getStatusIcon, getDisplayStatus } from './utils';
import styles from './BookingCard.module.css';

interface BookingCardProps {
  booking: Booking;
  isSelected: boolean;
  onClick: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, isSelected, onClick }) => {
  const displayStatus = getDisplayStatus(booking);

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.header}>
        <div className={styles.hotelInfo}>
          <h4 className={styles.hotelName}>{booking.hotelName}</h4>
          <p className={styles.roomType}>{booking.roomName}</p>
        </div>
        <span className={`badge ${getStatusBadgeClass(booking)}`}>
          <i className={getStatusIcon(booking)}></i> {displayStatus}
        </span>
      </div>

      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <span className={styles.label}>Check-in</span>
          <span className={styles.value}>{formatDate(booking.checkIn)}</span>
        </div>
        <div className={styles.dateItem}>
          <span className={styles.label}>Check-out</span>
          <span className={styles.value}>{formatDate(booking.checkOut)}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.nights}>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
        <span className={styles.price}>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: booking.currency || 'USD',
          }).format(booking.total)}
        </span>
      </div>
    </div>
  );
};

export default BookingCard;
