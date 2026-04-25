-- Migration: Add refund fields and secondary payment status
-- This adds fields to track refunds and payment status separately from booking status

ALTER TABLE bookings 
ADD COLUMN refund_amount DECIMAL(12, 2) NULL DEFAULT 0 AFTER total,
ADD COLUMN refund_reason VARCHAR(255) NULL AFTER refund_amount,
ADD COLUMN refunded_at TIMESTAMP NULL AFTER refund_reason,
ADD COLUMN payment_status ENUM('PENDING', 'PAID', 'PARTIAL_REFUND', 'FULLY_REFUNDED', 'FAILED') DEFAULT 'PENDING' AFTER refunded_at;

-- Add index for finding refunded bookings
CREATE INDEX idx_bookings_refund_amount ON bookings(refund_amount);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_refunded_at ON bookings(refunded_at);
