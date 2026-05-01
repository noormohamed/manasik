-- Migration 027: Add payment_method column to bookings table
-- Part of payments-calculation-fix spec
-- Tracks whether payment was made via Stripe checkout or manually marked by hotel staff

-- Add payment_method column to bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS payment_method ENUM('STRIPE', 'MANUAL') NULL DEFAULT NULL 
  AFTER broker_notes;

-- Add index for query performance
CREATE INDEX IF NOT EXISTS idx_payment_method ON bookings (payment_method);

-- Fix Countryside Lodge hotel to point to correct agent record
UPDATE hotels SET agent_id = 'agent-10' WHERE id = 'hotel-020' AND name = 'Countryside Lodge';

-- Fix William Smith agent record to have correct user_id mapping
UPDATE agents SET user_id = 'agent-010' WHERE id = 'agent-10';

-- Mark existing manually-paid seed bookings with payment_method = 'MANUAL'
UPDATE bookings SET payment_method = 'MANUAL' 
  WHERE id IN ('booking-0030', 'booking-0050') 
  AND payment_status = 'PAID';
