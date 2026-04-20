/**
 * SendMessageModal Component
 * Modal for sending the first message to a hotel about a booking
 */

import React, { useState } from 'react';
import { Booking } from './types';
import { apiClient } from '@/lib/api';
import styles from './SendMessageModal.module.css';

interface SendMessageModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a new conversation with the first message
      // The apiClient automatically unwraps { data: conversation } to just conversation
      const conversation = await apiClient.post('/messages/conversations', {
        hotelId: booking.hotelId,
        bookingId: booking.id,
        subject: `Message about booking at ${booking.hotelName}`,
        description: message,
        participants: [
          {
            userId: booking.hotelId, // Hotel as participant
            userRole: 'HOTEL_STAFF',
          },
        ],
      });

      console.log('Create conversation response:', conversation);

      // Extract conversation ID from response
      // apiClient unwraps the response, so conversation is the actual object
      const conversationId = (conversation as any)?.id;

      if (!conversationId) {
        console.error('Response structure:', conversation);
        throw new Error('No conversation ID returned from API');
      }

      // Success - close modal and navigate to conversation
      setMessage('');
      onSuccess(conversationId);
      onClose();
    } catch (err: any) {
      console.error('Error sending message:', err);
      console.error('Error details:', {
        message: err.message,
        error: err.error,
        response: err.response,
      });
      setError(err.error || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Send Message to Hotel</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.bookingInfo}>
            <p className={styles.hotelName}>{booking.hotelName}</p>
            <p className={styles.bookingDetails}>
              Booking: {booking.checkIn} to {booking.checkOut}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                Your Message
              </label>
              <textarea
                id="message"
                className={styles.textarea}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                rows={5}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.sendButton}
                disabled={loading || !message.trim()}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
