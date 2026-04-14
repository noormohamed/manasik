-- Migration: Create admin_sessions table for session management
-- This migration creates the admin_sessions table to store active admin sessions with expiration

-- Admin Sessions table
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

-- Add comment to table for documentation
ALTER TABLE admin_sessions COMMENT='Stores active admin sessions with expiration and device information';

-- Add comments to columns for documentation
ALTER TABLE admin_sessions MODIFY COLUMN id INT AUTO_INCREMENT COMMENT='Unique identifier for session';
ALTER TABLE admin_sessions MODIFY COLUMN admin_user_id INT NOT NULL COMMENT='Reference to admin_users table';
ALTER TABLE admin_sessions MODIFY COLUMN token_hash VARCHAR(255) NOT NULL UNIQUE COMMENT='Hash of the JWT token for validation';
ALTER TABLE admin_sessions MODIFY COLUMN ip_address VARCHAR(45) COMMENT='IP address of the session';
ALTER TABLE admin_sessions MODIFY COLUMN user_agent TEXT COMMENT='User agent string from the browser';
ALTER TABLE admin_sessions MODIFY COLUMN expires_at TIMESTAMP NOT NULL COMMENT='Timestamp when session expires';
ALTER TABLE admin_sessions MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT='Timestamp when session was created';
