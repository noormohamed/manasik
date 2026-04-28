-- ============================================================================
-- PRODUCTION MIGRATION SCRIPT
-- Manasik Booking Platform
-- ============================================================================
-- Idempotent: safe to run multiple times on an existing database.
-- Uses information_schema checks via stored procedures to guard column additions.
-- Run on the backend server (46.101.13.38):
--   mysql -u root -proot booking_platform < production-migration.sql
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

-- Helper: add a column only if it doesn't already exist
DELIMITER //
CREATE PROCEDURE add_column_if_missing(
  IN tbl VARCHAR(64), IN col VARCHAR(64), IN col_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN ', col_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //

-- Helper: add an index only if it doesn't already exist
CREATE PROCEDURE add_index_if_missing(
  IN tbl VARCHAR(64), IN idx VARCHAR(64), IN idx_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND INDEX_NAME = idx
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD INDEX ', idx_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

-- ============================================================================
-- 1. ALTER EXISTING TABLES - add missing columns
-- ============================================================================

-- hotels: Hajj/Umrah features (migration 011)
CALL add_column_if_missing('hotels', 'walking_time_to_haram', 'walking_time_to_haram INT DEFAULT NULL COMMENT \'Walking time to Haram in minutes\'');
CALL add_column_if_missing('hotels', 'view_type',             'view_type ENUM(\'kaaba\',\'partial_haram\',\'city\',\'none\') DEFAULT \'none\'');
CALL add_column_if_missing('hotels', 'is_elderly_friendly',   'is_elderly_friendly BOOLEAN DEFAULT FALSE');
CALL add_column_if_missing('hotels', 'has_family_rooms',      'has_family_rooms BOOLEAN DEFAULT FALSE');
CALL add_column_if_missing('hotels', 'manasik_score',         'manasik_score DECIMAL(3,1) DEFAULT NULL');
CALL add_column_if_missing('hotels', 'distance_to_haram_meters', 'distance_to_haram_meters INT DEFAULT NULL');
CALL add_column_if_missing('hotels', 'nearest_gate_id',       'nearest_gate_id VARCHAR(36) DEFAULT NULL');

-- hotels: provider info (migration 012)
CALL add_column_if_missing('hotels', 'provider_name',         'provider_name VARCHAR(255) NULL');
CALL add_column_if_missing('hotels', 'provider_reference',    'provider_reference VARCHAR(100) NULL');
CALL add_column_if_missing('hotels', 'provider_phone',        'provider_phone VARCHAR(20) NULL');

-- hotels: scoring, rules, policies, gate flag (migrations 016-019)
CALL add_column_if_missing('hotels', 'scoring_data',    'scoring_data JSON NULL');
CALL add_column_if_missing('hotels', 'hotel_rules',     'hotel_rules TEXT NULL');
CALL add_column_if_missing('hotels', 'custom_policies', 'custom_policies JSON DEFAULT NULL');
CALL add_column_if_missing('hotels', 'gates_assigned',  'gates_assigned BOOLEAN DEFAULT FALSE');

-- hotels: indexes
CALL add_index_if_missing('hotels', 'idx_hotels_walking_time',    'idx_hotels_walking_time (walking_time_to_haram)');
CALL add_index_if_missing('hotels', 'idx_hotels_view_type',       'idx_hotels_view_type (view_type)');
CALL add_index_if_missing('hotels', 'idx_hotels_elderly_friendly','idx_hotels_elderly_friendly (is_elderly_friendly)');
CALL add_index_if_missing('hotels', 'idx_hotels_family_rooms',    'idx_hotels_family_rooms (has_family_rooms)');
CALL add_index_if_missing('hotels', 'idx_hotels_manasik_score',   'idx_hotels_manasik_score (manasik_score)');
CALL add_index_if_missing('hotels', 'idx_hotels_distance_haram',  'idx_hotels_distance_haram (distance_to_haram_meters)');
CALL add_index_if_missing('hotels', 'idx_provider_name',          'idx_provider_name (provider_name)');

-- bookings: update booking_source enum to include all required values
ALTER TABLE bookings
  MODIFY COLUMN booking_source ENUM('DIRECT','STAFF_CREATED','AGENT','BROKER','API','ADMIN') DEFAULT 'DIRECT';

-- bookings: new columns (migrations 010, 011, 013, 015)
CALL add_column_if_missing('bookings', 'staff_created_by',       'staff_created_by VARCHAR(36) NULL');
CALL add_column_if_missing('bookings', 'payment_status',         'payment_status ENUM(\'PENDING\',\'PAID\',\'PARTIAL_REFUND\',\'FULLY_REFUNDED\',\'FAILED\') DEFAULT \'PENDING\'');
CALL add_column_if_missing('bookings', 'refund_amount',          'refund_amount DECIMAL(12,2) NULL DEFAULT 0');
CALL add_column_if_missing('bookings', 'refund_reason',          'refund_reason VARCHAR(255) NULL');
CALL add_column_if_missing('bookings', 'refunded_at',            'refunded_at TIMESTAMP NULL');
CALL add_column_if_missing('bookings', 'payment_link_id',        'payment_link_id VARCHAR(255) NULL');
CALL add_column_if_missing('bookings', 'payment_link_url',       'payment_link_url TEXT NULL');
CALL add_column_if_missing('bookings', 'payment_link_expires_at','payment_link_expires_at TIMESTAMP NULL');
CALL add_column_if_missing('bookings', 'hold_expires_at',        'hold_expires_at TIMESTAMP NULL');
CALL add_column_if_missing('bookings', 'broker_notes',           'broker_notes TEXT NULL');
CALL add_column_if_missing('bookings', 'guest_details',          'guest_details JSON NULL');

-- bookings: indexes
CALL add_index_if_missing('bookings', 'idx_payment_status',        'idx_payment_status (payment_status)');
CALL add_index_if_missing('bookings', 'idx_staff_created_by',      'idx_staff_created_by (staff_created_by)');
CALL add_index_if_missing('bookings', 'idx_hold_expires',          'idx_hold_expires (hold_expires_at)');
CALL add_index_if_missing('bookings', 'idx_bookings_payment_link', 'idx_bookings_payment_link (payment_link_id)');
CALL add_index_if_missing('bookings', 'idx_bookings_refunded_at',  'idx_bookings_refunded_at (refunded_at)');

-- room_types: family room fields (migration 011)
CALL add_column_if_missing('room_types', 'is_family_room',       'is_family_room BOOLEAN DEFAULT FALSE');
CALL add_column_if_missing('room_types', 'max_adults',           'max_adults INT DEFAULT 2');
CALL add_column_if_missing('room_types', 'max_children',         'max_children INT DEFAULT 0');
CALL add_column_if_missing('room_types', 'has_connecting_rooms', 'has_connecting_rooms BOOLEAN DEFAULT FALSE');

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

-- ============================================================================
-- 2. NEW TABLES
-- ============================================================================

-- hotel_best_for_tags (migration 011)
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

-- guests (migration 013)
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

-- payment_links
CREATE TABLE IF NOT EXISTS payment_links (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  guest_email VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('SENT','CLICKED','EXPIRED','COMPLETED') DEFAULT 'SENT',
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

-- hotel_gate_assignments (migration 019)
-- Per-column collations match each FK target:
--   hotel_id       -> hotels.id        (utf8mb4_unicode_ci)
--   closest/kaaba  -> haram_gates.id   (utf8mb4_0900_ai_ci)
CREATE TABLE IF NOT EXISTS hotel_gate_assignments (
  id              VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
  hotel_id        VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  closest_gate_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  kaaba_gate_id   VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id)        REFERENCES hotels(id)      ON DELETE CASCADE,
  FOREIGN KEY (closest_gate_id) REFERENCES haram_gates(id),
  FOREIGN KEY (kaaba_gate_id)   REFERENCES haram_gates(id),
  INDEX idx_hotel_id (hotel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- scoring_weights (migration 016)
CREATE TABLE IF NOT EXISTS scoring_weights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_weight DECIMAL(5,2) NOT NULL DEFAULT 35.00 COMMENT 'Weight % for Location category',
  pilgrim_suitability_weight DECIMAL(5,2) NOT NULL DEFAULT 25.00 COMMENT 'Weight % for Pilgrim Suitability category',
  hotel_quality_weight DECIMAL(5,2) NOT NULL DEFAULT 20.00 COMMENT 'Weight % for Hotel Quality category',
  experience_friction_weight DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Weight % for Experience Friction category',
  user_reviews_weight DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Weight % for User Reviews category',
  updated_by VARCHAR(36) NULL COMMENT 'Admin user ID who last updated',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- email_audit_log
CREATE TABLE IF NOT EXISTS email_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  email_type VARCHAR(50),
  status ENUM('PENDING','SENT','FAILED','BOUNCED') DEFAULT 'PENDING',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_status (status),
  INDEX idx_email_type (email_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- hotel_filters
CREATE TABLE IF NOT EXISTS hotel_filters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filter_name VARCHAR(100) NOT NULL UNIQUE,
  filter_description TEXT,
  filter_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. MESSAGING TABLES (migration 014)
-- ============================================================================

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(36),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('ACTIVE','ARCHIVED','CLOSED') DEFAULT 'ACTIVE',
  created_by_id VARCHAR(36) NOT NULL,
  created_by_role ENUM('GUEST','BROKER','HOTEL_STAFF','MANAGER','ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  user_role ENUM('GUEST','BROKER','HOTEL_STAFF','MANAGER','ADMIN') NOT NULL,
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

-- messages (full version with conversations)
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  sender_role ENUM('GUEST','BROKER','HOTEL_STAFF','MANAGER','ADMIN') NOT NULL,
  content TEXT NOT NULL,
  content_sanitized TEXT,
  message_type ENUM('TEXT','SYSTEM','UPGRADE_OFFER') DEFAULT 'TEXT',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- message_read_receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_id (message_id),
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_receipt (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- conversation_assignments
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

-- message_audit_log
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
-- 4. SEED / DEFAULT DATA
-- ============================================================================

-- Default alert configurations
INSERT IGNORE INTO admin_alerts (alert_type, severity, title, description, threshold_value, is_enabled) VALUES
('HIGH_REFUND_RATE',          'WARNING',  'High Refund Rate',            'Alert when refund rate exceeds threshold',              10.00, TRUE),
('PAYMENT_FAILURES',          'CRITICAL', 'Payment Failures',            'Alert when payment failure rate is high',               5.00,  TRUE),
('SUSPICIOUS_ACTIVITY',       'CRITICAL', 'Suspicious Activity',         'Alert when suspicious user activity is detected',       NULL,  TRUE),
('LOW_PLATFORM_UPTIME',       'CRITICAL', 'Low Platform Uptime',         'Alert when platform uptime drops below threshold',      99.00, TRUE),
('HIGH_BOOKING_CANCELLATION', 'WARNING',  'High Booking Cancellation',   'Alert when booking cancellation rate is high',          15.00, TRUE),
('NEGATIVE_REVIEWS',          'WARNING',  'Negative Reviews',            'Alert when average rating drops below threshold',       3.50,  TRUE);

-- Default scoring weights (one row only)
INSERT INTO scoring_weights (location_weight, pilgrim_suitability_weight, hotel_quality_weight, experience_friction_weight, user_reviews_weight)
SELECT 35.00, 25.00, 20.00, 10.00, 10.00
WHERE NOT EXISTS (SELECT 1 FROM scoring_weights LIMIT 1);

-- ============================================================================
-- 5. RE-ENABLE FK CHECKS
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- DONE
-- Run SHOW TABLES; to verify all tables are present.
-- ============================================================================
