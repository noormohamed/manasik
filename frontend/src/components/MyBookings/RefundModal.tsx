/**
 * RefundModal Component
 * Modal for processing refunds with validation
 */

import React, { useState, useEffect } from 'react';
import { Booking } from './types';
import { formatCurrency } from './utils';
import styles from './RefundModal.module.css';

interface RefundModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
  isProcessing: boolean;
}

const RefundModal: React.FC<RefundModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
}) => {
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});

  const maxRefund = booking.total - (booking.refundAmount || 0);

  useEffect(() => {
    if (isOpen) {
      setRefundAmount(maxRefund.toString());
      setRefundReason('');
      setErrors({});
    }
  }, [isOpen, maxRefund]);

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; reason?: string } = {};

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid refund amount';
    } else if (amount > maxRefund) {
      newErrors.amount = `Refund amount cannot exceed ${formatCurrency(maxRefund, booking.currency)}`;
    }

    if (!refundReason.trim()) {
      newErrors.reason = 'Please provide a refund reason';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(parseFloat(refundAmount), refundReason);
    } catch (error) {
      console.error('Refund submission error:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Process Refund</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
            disabled={isProcessing}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.bookingInfo}>
            <p className={styles.bookingName}>{booking.hotelName}</p>
            <p className={styles.bookingId}>Booking ID: {booking.id}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="refund-amount" className={styles.label}>
                Refund Amount
              </label>
              <div className={styles.amountInput}>
                <input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxRefund}
                  value={refundAmount}
                  onChange={(e) => {
                    setRefundAmount(e.target.value);
                    if (errors.amount) {
                      setErrors({ ...errors, amount: undefined });
                    }
                  }}
                  disabled={isProcessing}
                  className={errors.amount ? styles.inputError : ''}
                />
                <span className={styles.currency}>{booking.currency}</span>
              </div>
              <p className={styles.helper}>
                Maximum available: {formatCurrency(maxRefund, booking.currency)}
              </p>
              {errors.amount && (
                <p className={styles.error}>{errors.amount}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="refund-reason" className={styles.label}>
                Refund Reason
              </label>
              <textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => {
                  setRefundReason(e.target.value);
                  if (errors.reason) {
                    setErrors({ ...errors, reason: undefined });
                  }
                }}
                disabled={isProcessing}
                placeholder="Please explain the reason for this refund..."
                rows={4}
                className={`${styles.textarea} ${errors.reason ? styles.textareaError : ''}`}
              />
              {errors.reason && (
                <p className={styles.error}>{errors.reason}</p>
              )}
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ri-refund-line"></i>
                    Process Refund
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
