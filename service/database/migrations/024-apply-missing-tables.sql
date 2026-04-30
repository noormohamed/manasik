-- Migration 024: Apply Missing Tables
-- This migration creates all tables that were missing from the database
-- Includes: conversations, messaging tables, guests table, and admin tables

-- ============================================================================
-- MESSAGING SYSTEM TABLES
-- ============================================================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(36),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('ACTIVE', 'ARCHIVED', 'CLOSED') DEFAULT 'ACTIVE',
  created_by_id VARCHAR(36) NOT NULL,
  created_by_role ENUM('GUEST', 'BROKER', 'HOTEL_STAFF', 'MANAGER', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  user_role ENUM('GUEST', 'BROKER', 'HOTEL_STAFF', 'MANAGER', 'ADMIN') NOT NULL,
  hotel_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_user_id (user_id),
  INDEX idx_hotel_id (hotel_id),
  UNIQUE KEY unique_participant (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table (conversation-based)
CREATE TABLE IF NOT EXISTS conversation_messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  sender_role ENUM('GUEST', 'BROKER', 'HOTEL_STAFF', 'MANAGER', 'ADMIN') NOT NULL,
  content TEXT NOT NULL,
  content_sanitized TEXT,
  message_type ENUM('TEXT', 'SYSTEM', 'UPGRADE_OFFER') DEFAULT 'TEXT',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message read receipts table
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_id (message_id),
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_receipt (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES conversation_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation assignments (for hotel staff to be assigned conversations)
CREATE TABLE IF NOT EXISTS conversation_assignments (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  assigned_to_id VARCHAR(36) NOT NULL,
  assigned_by_id VARCHAR(36) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unassigned_at TIMESTAMP NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_assigned_to_id (assigned_to_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log for messaging
CREATE TABLE IF NOT EXISTS message_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36),
  message_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_message_id (message_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GUEST DETAILS TABLE
-- ============================================================================

-- Create guests table to store individual guest information
CREATE TABLE IF NOT EXISTS guests (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  nationality VARCHAR(100),
  is_lead_passenger BOOLEAN DEFAULT FALSE,
  passport_number VARCHAR(50),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ADMIN TABLES
-- ============================================================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  created_by_id INT,
  FOREIGN KEY (created_by_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_created_by_id (created_by_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_values JSON,
  new_values JSON,
  reason TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE RESTRICT,
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_entity_type (entity_type),
  INDEX idx_action_type (action_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_created_at_entity_type (created_at, entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Alerts Table
CREATE TABLE IF NOT EXISTS admin_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL UNIQUE,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  threshold_value DECIMAL(10, 2),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alert_type (alert_type),
  INDEX idx_severity (severity),
  INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  triggered_at TIMESTAMP NOT NULL,
  current_value DECIMAL(10, 2),
  acknowledged_by_id INT,
  acknowledged_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES admin_alerts(id) ON DELETE CASCADE,
  FOREIGN KEY (acknowledged_by_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_alert_id (alert_id),
  INDEX idx_triggered_at (triggered_at),
  INDEX idx_acknowledged_by_id (acknowledged_by_id),
  INDEX idx_created_at (created_at),
  INDEX idx_alert_id_triggered_at (alert_id, triggered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Preferences Table
CREATE TABLE IF NOT EXISTS admin_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL UNIQUE,
  theme VARCHAR(20) NOT NULL DEFAULT 'light',
  items_per_page INT NOT NULL DEFAULT 25,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_admin_user_id (admin_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default alert configurations
INSERT IGNORE INTO admin_alerts (alert_type, severity, title, description, threshold_value, is_enabled) VALUES
('HIGH_REFUND_RATE', 'WARNING', 'High Refund Rate', 'Alert when refund rate exceeds threshold', 10.00, TRUE),
('PAYMENT_FAILURES', 'CRITICAL', 'Payment Failures', 'Alert when payment failure rate is high', 5.00, TRUE),
('SUSPICIOUS_ACTIVITY', 'CRITICAL', 'Suspicious Activity', 'Alert when suspicious user activity is detected', NULL, TRUE),
('LOW_PLATFORM_UPTIME', 'CRITICAL', 'Low Platform Uptime', 'Alert when platform uptime drops below threshold', 99.00, TRUE),
('HIGH_BOOKING_CANCELLATION', 'WARNING', 'High Booking Cancellation', 'Alert when booking cancellation rate is high', 15.00, TRUE),
('NEGATIVE_REVIEWS', 'WARNING', 'Negative Reviews', 'Alert when average rating drops below threshold', 3.50, TRUE);
