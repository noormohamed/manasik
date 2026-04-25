-- Migration: Create payment_links table
-- Purpose: Store payment links for staff-created bookings
-- Date: 2024

CREATE TABLE IF NOT EXISTS payment_links (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  guest_email VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('SENT', 'CLICKED', 'EXPIRED', 'COMPLETED') DEFAULT 'SENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  clicked_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  stripe_session_id VARCHAR(255),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_token (token),
  INDEX idx_guest_email (guest_email),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
