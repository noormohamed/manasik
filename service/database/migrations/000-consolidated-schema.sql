-- Consolidated Migration Script
-- Combines all database schema changes into a single file for easier management
-- This replaces migrations 001-019 and ensures all schema is created in proper dependency order

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Hotel Filters Table
CREATE TABLE IF NOT EXISTS hotel_filters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filter_name VARCHAR(100) NOT NULL UNIQUE,
  filter_description TEXT,
  filter_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Haram Gates Table
CREATE TABLE IF NOT EXISTS haram_gates (
  id VARCHAR(36) PRIMARY KEY,
  gate_number INT NOT NULL UNIQUE,
  name_english VARCHAR(255) NOT NULL,
  name_arabic VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  has_direct_kaaba_access BOOLEAN DEFAULT FALSE,
  floor_level INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gate_number (gate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel Gate Distances Table
CREATE TABLE IF NOT EXISTS hotel_gate_distances (
  id VARCHAR(36) PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  gate_id VARCHAR(36) NOT NULL,
  distance_meters INT,
  walking_time_minutes INT,
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (gate_id) REFERENCES haram_gates(id),
  UNIQUE KEY unique_hotel_gate (hotel_id, gate_id),
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_gate_id (gate_id),
  INDEX idx_distance_meters (distance_meters),
  INDEX idx_is_recommended (is_recommended)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel Gate Assignments Table
CREATE TABLE IF NOT EXISTS hotel_gate_assignments (
  id VARCHAR(36) PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL UNIQUE,
  closest_gate_id VARCHAR(36),
  kaaba_gate_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (closest_gate_id) REFERENCES haram_gates(id),
  FOREIGN KEY (kaaba_gate_id) REFERENCES haram_gates(id),
  INDEX idx_hotel_id (hotel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENT LINKS TABLE
-- ============================================================================

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

-- ============================================================================
-- HOTEL BEST FOR TAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hotel_best_for_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_tag (tag),
  UNIQUE KEY unique_hotel_tag (hotel_id, tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MESSAGING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_attachments (
  id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  file_url VARCHAR(255),
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EMAIL AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  email_type VARCHAR(50),
  status ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED') DEFAULT 'PENDING',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_status (status),
  INDEX idx_email_type (email_type),
  INDEX idx_created_at (created_at)
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

-- Insert Haram Gates seed data
INSERT IGNORE INTO haram_gates (id, gate_number, name_english, name_arabic, latitude, longitude, has_direct_kaaba_access, floor_level) VALUES
('gate-001', 1, 'King Abdul Aziz Gate', 'باب الملك عبدالعزيز', 21.4243, 39.8259, TRUE, 0),
('gate-002', 2, 'Umrah Gate', 'باب العمرة', 21.4295, 39.8294, FALSE, 0),
('gate-003', 3, 'Ajyad Gate', 'باب الأجياد', 21.4225, 39.8262, FALSE, 0),
('gate-004', 4, 'Al-Safa Gate', 'باب الصفا', 21.4208, 39.8247, FALSE, 0),
('gate-005', 5, 'Al-Marwa Gate', 'باب المروة', 21.4190, 39.8230, FALSE, 0),
('gate-006', 6, 'Al-Qiblatein Gate', 'باب القبلتين', 21.4173, 39.8215, FALSE, 0),
('gate-007', 7, 'Bab Al-Dhabaih Gate', 'باب الذبايح', 21.4155, 39.8200, FALSE, 0),
('gate-008', 8, 'Bab Al-Noor Gate', 'باب النور', 21.4137, 39.8185, FALSE, 0),
('gate-009', 9, 'Bab Al-Noor Upper Gate', 'باب النور العلوي', 21.4120, 39.8170, FALSE, 1),
('gate-010', 10, 'Bab Ali Gate', 'باب علي', 21.4102, 39.8155, FALSE, 0);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
