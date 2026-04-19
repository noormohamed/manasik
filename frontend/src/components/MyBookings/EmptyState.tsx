/**
 * EmptyState Component
 * Displayed when no booking is selected
 */

import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>📋</div>
      <h3 className={styles.title}>Select a booking to view details</h3>
      <p className={styles.subtitle}>Choose a booking from the list on the left to see full details</p>
    </div>
  );
};

export default EmptyState;
