/**
 * AccommodationSection Component
 * Displays hotel information, room type, address, and check-in/out times
 */

import React from 'react';
import { Booking } from './types';
import { formatTime, getFullHotelAddress, formatDate } from './utils';
import styles from './AccommodationSection.module.css';

interface AccommodationSectionProps {
  booking: Booking;
}

const AccommodationSection: React.FC<AccommodationSectionProps> = ({ booking }) => {
  const hotelAddress = getFullHotelAddress(booking);

  return (
    <div className={styles.section}>
      <div className={styles.hotelName}>{booking.hotelName}</div>

      <div className={styles.bookingDate}>
        {new Date(booking.createdAt).toLocaleDateString()}
      </div>

      <div className={styles.address}>
        <span>{hotelAddress}</span>
      </div>

      <h3 className={styles.title}>Accommodation</h3>

      <div className={styles.times}>
        <div className={styles.timeItem}>
          <span className={styles.roomLabel}>Room</span>
          <span className={styles.roomValue}>{booking.roomName}</span>
        </div>
        <div className={styles.timeItem}>
          <span className={styles.roomLabel}>Check-in</span>
          <span className={styles.roomValue}>{formatDate(booking.checkIn)} @ {formatTime(booking.checkInTime || '14:00')}</span>
        </div>
        <div className={styles.timeItem}>
          <span className={styles.roomLabel}>Check-out</span>
          <span className={styles.roomValue}>{formatDate(booking.checkOut)} @ {formatTime(booking.checkOutTime || '11:00')}</span>
        </div>
        <div className={styles.timeItem}>
          <span className={styles.roomLabel}>Duration</span>
          <span className={styles.roomValue}>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</span>
        </div>
        <div className={styles.timeItem}>
          <span className={styles.roomLabel}>Booking Date</span>
          <span className={styles.roomValue}>{new Date(booking.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className={styles.detailsBox}>
        {(booking.hotelPhone || booking.providerName || booking.providerReference || booking.providerPhone) && (
          <div className={styles.providerDetailsBox}>
            {booking.hotelPhone && (
              <p className={styles.detailItem}>
                <strong>Hotel Phone:</strong> {booking.hotelPhone}
              </p>
            )}
            {booking.providerName && (
              <p className={styles.detailItem}>
                <strong>Provider:</strong> {booking.providerName}
              </p>
            )}
            {booking.providerReference && (
              <p className={styles.detailItem}>
                <strong>Reference:</strong> {booking.providerReference}
              </p>
            )}
            {booking.providerPhone && (
              <p className={styles.detailItem}>
                <strong>Provider Contact:</strong> {booking.providerPhone}
              </p>
            )}
          </div>
        )}
      </div>

      {(booking.closestGate || booking.kaabaGate) && (
        <>
          <h3 className={styles.title} style={{ marginTop: '24px' }}>Haram Gate Access</h3>
          <div className={styles.gateColumn}>
            {booking.closestGate ? (
              <div className={`${styles.gateBox} ${styles.closestGate}`}>
                <h4 className={styles.gateTitle}>Closest Haram Gate</h4>
                <p className={styles.gateName}>
                  Gate {booking.closestGate.gateNumber} - {booking.closestGate.name}
                </p>
                <div className={styles.gateDetails}>
                  <div className={styles.detailItem}>
                    <span>{booking.closestGate.distance}m</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>{booking.closestGate.walkingTime} min walk</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${styles.gateBox} ${styles.closestGate}`}>
                <h4 className={styles.gateTitle}>Closest Haram Gate</h4>
                <p className={styles.notAvailable}>Not available</p>
              </div>
            )}

            {booking.kaabaGate ? (
              <div className={`${styles.gateBox} ${styles.kaabaGate}`}>
                <h4 className={styles.gateTitle}>Kaaba Gate Access</h4>
                <p className={styles.gateName}>
                  Gate {booking.kaabaGate.gateNumber} - {booking.kaabaGate.name}
                </p>
                <div className={styles.gateDetails}>
                  <div className={styles.detailItem}>
                    <span>{booking.kaabaGate.distance}m</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>{booking.kaabaGate.walkingTime} min walk</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${styles.gateBox} ${styles.kaabaGate}`}>
                <h4 className={styles.gateTitle}>Kaaba Gate Access</h4>
                <p className={styles.notAvailable}>Not available</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AccommodationSection;
