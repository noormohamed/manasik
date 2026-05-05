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
import SendMessageModal from './SendMessageModal';
import styles from './BookingDetailPanel.module.css';

interface BookingDetailPanelProps {
  booking: Booking | null;
  onEdit: () => void;
  onCancel: () => void;
  onPrint: (booking: Booking) => void;
  onRefund: (booking: Booking, amount: number, reason: string) => Promise<void>;
  onMessage: (booking: Booking, conversationId?: string) => void;
  onUpdateBooking?: (booking: Booking) => void;
  isRefundProcessing: boolean;
}

const BookingDetailPanel: React.FC<BookingDetailPanelProps> = ({
  booking,
  onEdit,
  onCancel,
  onPrint,
  onRefund,
  onMessage,
  onUpdateBooking,
  isRefundProcessing,
}) => {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

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

  const handleMessageClick = () => {
    // If conversation already exists, open it directly
    if (booking?.conversationId) {
      onMessage(booking, booking.conversationId);
    } else {
      // Otherwise show modal to send first message
      setShowMessageModal(true);
    }
  };

  const handleMessageSuccess = (conversationId: string) => {
    // Update booking with conversation ID
    if (booking && onUpdateBooking) {
      const updatedBooking = { ...booking, conversationId };
      onUpdateBooking(updatedBooking);
    }
    // After successful message creation, navigate to the conversation
    onMessage(booking!, conversationId);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          {/* Accommodation Section */}
          <AccommodationSection booking={booking} />

          {/* Guest Information Section */}
          <GuestInformationSection booking={booking} />

          {/* Broker Attribution Section */}
          {booking.bookingSource === 'BROKER' && booking.agentName && (
            <div style={{
              marginTop: 20,
              padding: 16,
              background: '#f0f7ff',
              borderRadius: 10,
              border: '1px solid #bfdbfe',
            }}>
              <h4 style={{
                margin: '0 0 10px',
                fontSize: 14,
                fontWeight: 600,
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <i className="ri-user-shared-line" style={{ fontSize: 16 }}></i>
                Booked by
              </h4>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#1e3a5f' }}>
                {booking.agentName}
              </p>
              {booking.agentEmail && (
                <p style={{ margin: 0, fontSize: 13, color: '#4b7bb5' }}>
                  {booking.agentEmail}
                </p>
              )}
            </div>
          )}
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
              onMessage={handleMessageClick}
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

      {/* Send Message Modal */}
      {booking && (
        <SendMessageModal
          booking={booking}
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          onSuccess={handleMessageSuccess}
        />
      )}
    </div>
  );
};

export default BookingDetailPanel;
