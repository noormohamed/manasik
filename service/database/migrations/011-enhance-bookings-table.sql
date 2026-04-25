-- Migration: Enhance bookings table with staff booking fields
-- Purpose: Add support for staff-created bookings and payment tracking
-- Date: 2024

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source ENUM('DIRECT', 'STAFF_CREATED', 'BROKER') DEFAULT 'DIRECT';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS staff_created_by VARCHAR(36);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status ENUM('UNPAID', 'PAID', 'PARTIALLY_PAID', 'REFUNDED') DEFAULT 'UNPAID';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_link_id VARCHAR(36);

-- Add foreign key constraints
ALTER TABLE bookings ADD CONSTRAINT fk_staff_created_by FOREIGN KEY (staff_created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD CONSTRAINT fk_payment_link_id FOREIGN KEY (payment_link_id) REFERENCES payment_links(id) ON DELETE SET NULL;

-- Add indexes
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_booking_source (booking_source);
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_staff_created_by (staff_created_by);
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_payment_link_id (payment_link_id);
