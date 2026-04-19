/**
 * BookingDetailPanel Component
 * Right column: displays comprehensive booking details
 */

import React, { useState } from 'react';
import { Booking } from './types';
import { isBookingEditable } from './utils';
import EmptyState from './EmptyState';
import AccommodationSection from './AccommodationSection';
import GuestInformationSection from './GuestInformationSection';
import PaymentSummarySection from './PaymentSummarySection';
import ActionButtons from './ActionButtons';
import RefundModal from './RefundModal';
import styles from './BookingDetailPanel.module.css';

interface BookingDetailPanelProps {
  booking: Booking | null;
  onEdit: () => void;
  onCancel: () => void;
  onPrint: (booking: Booking) => void;
  onRefund: (booking: Booking, amount: number, reason: string) => Promise<void>;
  isRefundProcessing: boolean;
}

const BookingDetailPanel: React.FC<BookingDetailPanelProps> = ({
  booking,
  onEdit,
  onCancel,
  onPrint,
  onRefund,
  isRefundProcessing,
}) => {
  const [showRefundModal, setShowRefundModal] = useState(false);

  if (!booking) {
    return (
      <div className={styles.panel}>
        <EmptyState />
      </div>
    );
  }

  const isEditable = isBookingEditable(booking);

  const handleRefundSubmit = async (amount: number, reason: string) => {
    try {
      await onRefund(booking, amount, reason);
      setShowRefundModal(false);
    } catch (error) {
      console.error('Refund error:', error);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          {/* Accommodation Section */}
          <AccommodationSection booking={booking} />

          {/* Guest Information Section */}
          <GuestInformationSection booking={booking} />
        </div>

        <div className={styles.rightColumn}>
          {/* Payment Summary Section */}
          <PaymentSummarySection booking={booking} />

          {/* Action Buttons */}
          <div className={styles.actions}>
            <ActionButtons
              booking={booking}
              onEdit={onEdit}
              onRefund={() => setShowRefundModal(true)}
              onCancel={onCancel}
              onPrint={() => onPrint(booking)}
            />
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <RefundModal
        booking={booking}
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onSubmit={handleRefundSubmit}
        isProcessing={isRefundProcessing}
      />
    </div>
  );
};

export default BookingDetailPanel;
