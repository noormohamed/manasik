-- Migration: Create email_audit_log table
-- Purpose: Track all email sends for audit and retry purposes
-- Date: 2024

CREATE TABLE IF NOT EXISTS email_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  email_type ENUM('BOOKING_CONFIRMATION', 'PAYMENT_LINK', 'PAYMENT_CONFIRMATION', 'PAYMENT_REMINDER') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('SENT', 'FAILED', 'BOUNCED', 'OPENED') DEFAULT 'SENT',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP NULL,
  metadata JSON,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_email_type (email_type),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
