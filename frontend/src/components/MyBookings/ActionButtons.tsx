/**
 * ActionButtons Component
 * Displays Edit, Refund, Cancel, and Print buttons
 */

import React from 'react';
import { Booking } from './types';
import { isBookingEditable, isBookingRefundable, isBookingCancellable } from './utils';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  booking: Booking;
  onEdit: () => void;
  onRefund: () => void;
  onCancel: () => void;
  onPrint: () => void;
  onMessage: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  booking,
  onEdit,
  onRefund,
  onCancel,
  onPrint,
  onMessage,
}) => {
  const canEdit = isBookingEditable(booking);
  const canRefund = isBookingRefundable(booking);
  const canCancel = isBookingCancellable(booking);

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={onEdit}
        disabled={!canEdit}
        title={!canEdit ? 'This booking cannot be edited' : 'Edit booking details'}
      >
        <i className="ri-edit-line"></i> Edit
      </button>

      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onMessage}
        title="Send a message to the hotel"
      >
        <i className="ri-mail-line"></i> Message
      </button>

      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onCancel}
        disabled={!canCancel}
        title={!canCancel ? 'This booking cannot be cancelled' : 'Cancel booking'}
      >
        <i className="ri-close-line"></i> Cancel
      </button>

      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onPrint}
        title="Print booking confirmation"
      >
        <i className="ri-printer-line"></i> Print
      </button>
    </div>
  );
};

export default ActionButtons;
