/**
 * GateInformationSection Component
 * Displays closest gate (teal) and Kaaba gate (purple) information
 */

import React from 'react';
import { Booking } from './types';
import styles from './GateInformationSection.module.css';

interface GateInformationSectionProps {
  booking: Booking;
}

const GateInformationSection: React.FC<GateInformationSectionProps> = ({ booking }) => {
  if (!booking.closestGate && !booking.kaabaGate) {
    return null;
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>🕌 Haram Gate Access</h3>

      <div className={styles.gateGrid}>
        {booking.closestGate ? (
          <div className={`${styles.gateBox} ${styles.closestGate}`}>
            <h4 className={styles.gateTitle}>🚶 Closest Haram Gate</h4>
            <p className={styles.gateName}>
              Gate {booking.closestGate.gateNumber} - {booking.closestGate.name}
            </p>
            <div className={styles.gateDetails}>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📏</span>
                <span>{booking.closestGate.distance} km</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>🚶</span>
                <span>{booking.closestGate.walkingTime} min walk</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.gateBox} ${styles.closestGate}`}>
            <h4 className={styles.gateTitle}>🚶 Closest Haram Gate</h4>
            <p className={styles.notAvailable}>Not available</p>
          </div>
        )}

        {booking.kaabaGate ? (
          <div className={`${styles.gateBox} ${styles.kaabaGate}`}>
            <h4 className={styles.gateTitle}>🕋 Kaaba Gate Access</h4>
            <p className={styles.gateName}>
              Gate {booking.kaabaGate.gateNumber} - {booking.kaabaGate.name}
            </p>
            <div className={styles.gateDetails}>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📏</span>
                <span>{booking.kaabaGate.distance} km</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>🚶</span>
                <span>{booking.kaabaGate.walkingTime} min walk</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.gateBox} ${styles.kaabaGate}`}>
            <h4 className={styles.gateTitle}>🕋 Kaaba Gate Access</h4>
            <p className={styles.notAvailable}>Not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GateInformationSection;
