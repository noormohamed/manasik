-- Migration: Add booking hold fields for broker bookings
-- This adds fields to track payment links and hold expiry times

ALTER TABLE bookings 
ADD COLUMN payment_link_id VARCHAR(255) NULL AFTER payment_status,
ADD COLUMN payment_link_url TEXT NULL AFTER payment_link_id,
ADD COLUMN payment_link_expires_at TIMESTAMP NULL AFTER payment_link_url,
ADD COLUMN hold_expires_at TIMESTAMP NULL AFTER payment_link_expires_at,
ADD COLUMN broker_notes TEXT NULL AFTER hold_expires_at;

-- Add index for finding expired holds
CREATE INDEX idx_bookings_hold_expires ON bookings(hold_expires_at);
CREATE INDEX idx_bookings_payment_link ON bookings(payment_link_id);
