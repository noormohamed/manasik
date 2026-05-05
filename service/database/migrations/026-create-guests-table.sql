-- Migration: Create guests table
-- This table stores guest information for bookings
-- Required by the /api/hotels/bookings endpoint

CREATE TABLE IF NOT EXISTS guests (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  nationality VARCHAR(100),
  passport_number VARCHAR(50),
  date_of_birth DATE,
  is_lead_passenger TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_guests_booking_id (booking_id)
);
