/**
 * StayDetailsSection Component
 * Displays check-in/out dates, duration, and booking creation date
 */

import React from 'react';
import { Booking } from './types';
import { formatDate, formatTime } from './utils';
import styles from './StayDetailsSection.module.css';

interface StayDetailsSectionProps {
  booking: Booking;
}

const StayDetailsSection: React.FC<StayDetailsSectionProps> = ({ booking }) => {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>📅 Stay Details</h3>

      <div className={styles.infoGrid}>
        <div className={styles.infoBox}>
          <h4 className={styles.label}>Check-in Date</h4>
          <p className={styles.value}>{formatDate(booking.checkIn)}</p>
          <p className={styles.subtext}>
            From {formatTime(booking.checkInTime || '14:00')}
          </p>
        </div>

        <div className={styles.infoBox}>
          <h4 className={styles.label}>Check-out Date</h4>
          <p className={styles.value}>{formatDate(booking.checkOut)}</p>
          <p className={styles.subtext}>
            By {formatTime(booking.checkOutTime || '11:00')}
          </p>
        </div>

        <div className={styles.infoBox}>
          <h4 className={styles.label}>Duration</h4>
          <p className={styles.value}>{booking.nights}</p>
          <p className={styles.subtext}>
            {booking.nights === 1 ? 'night' : 'nights'}
          </p>
        </div>

        <div className={styles.infoBox}>
          <h4 className={styles.label}>Booking Date</h4>
          <p className={styles.value}>
            {new Date(booking.createdAt).toLocaleDateString()}
          </p>
          <p className={styles.subtext}>
            {new Date(booking.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StayDetailsSection;
