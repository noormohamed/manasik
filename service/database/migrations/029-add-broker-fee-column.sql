-- Add broker_fee column to bookings table
-- Stores the fee charged by a broker for broker-created bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS broker_fee DECIMAL(10,2) DEFAULT 0.00 AFTER broker_notes;
