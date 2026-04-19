/**
 * GuestInformationSection Component
 * Displays guest information with lead passenger highlighted
 */

import React from 'react';
import { Booking } from './types';
import styles from './GuestInformationSection.module.css';

interface GuestInformationSectionProps {
  booking: Booking;
}

const GuestInformationSection: React.FC<GuestInformationSectionProps> = ({ booking }) => {
  const guests = booking.guests && booking.guests.length > 0 ? booking.guests : [];

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Guest Information</h3>

      {guests.length > 0 ? (
        <div className={styles.guestsList}>
          {guests.map((guest) => (
            <div
              key={guest.id}
              className={`${styles.guestCard} ${
                guest.isLeadPassenger ? styles.leadPassenger : ''
              }`}
            >
              <div className={styles.guestHeader}>
                <h4 className={styles.guestName}>
                  {guest.firstName} {guest.lastName}
                  {guest.isLeadPassenger && (
                    <span className={styles.leadBadge}>LEAD</span>
                  )}
                </h4>
              </div>

              <div className={styles.guestDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>📧 Email</span>
                  <p className={styles.value}>{guest.email || 'N/A'}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>📱 Phone</span>
                  <p className={styles.value}>{guest.phone || 'N/A'}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>🌍 Nationality</span>
                  <p className={styles.value}>{guest.nationality || 'N/A'}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>📄 Passport</span>
                  <p className={styles.value}>{guest.passportNumber || 'N/A'}</p>
                </div>

                {guest.dateOfBirth && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>🎂 Date of Birth</span>
                    <p className={styles.value}>
                      {new Date(guest.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <h4 className={styles.infoLabel}>Guest Name</h4>
            <p className={styles.infoValue}>{booking.guestName || 'N/A'}</p>
          </div>

          <div className={styles.infoBox}>
            <h4 className={styles.infoLabel}>Email</h4>
            <p className={styles.infoValue}>{booking.guestEmail || 'N/A'}</p>
          </div>

          <div className={styles.infoBox}>
            <h4 className={styles.infoLabel}>Phone</h4>
            <p className={styles.infoValue}>{booking.guestPhone || 'N/A'}</p>
          </div>

          <div className={styles.infoBox}>
            <h4 className={styles.infoLabel}>Guest Count</h4>
            <p className={styles.infoValue}>
              {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestInformationSection;
