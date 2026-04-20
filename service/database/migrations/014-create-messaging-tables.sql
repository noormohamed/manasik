-- Messaging System Tables

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

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
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
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
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
