-- Migration: Add booking_source column to bookings table
-- This tracks whether a booking was made by an agent or directly by the customer

ALTER TABLE bookings 
ADD COLUMN booking_source ENUM('DIRECT', 'AGENT', 'API', 'ADMIN') DEFAULT 'DIRECT' AFTER service_type;

-- Add agent_id column to track which agent made the booking (if applicable)
ALTER TABLE bookings 
ADD COLUMN agent_id VARCHAR(36) NULL AFTER booking_source;

-- Add index for filtering by booking source
CREATE INDEX idx_booking_source ON bookings(booking_source);

-- Update existing bookings to have a source (default to DIRECT for existing data)
UPDATE bookings SET booking_source = 'DIRECT' WHERE booking_source IS NULL;
