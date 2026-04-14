-- Migration: Create admin_preferences table for user settings
-- This migration creates the admin_preferences table to store admin user preferences

-- Admin Preferences table
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

-- Add comment to table for documentation
ALTER TABLE admin_preferences COMMENT='Stores admin user preferences for theme, pagination, and notifications';

-- Add comments to columns for documentation
ALTER TABLE admin_preferences MODIFY COLUMN id INT AUTO_INCREMENT COMMENT='Unique identifier for preferences';
ALTER TABLE admin_preferences MODIFY COLUMN admin_user_id INT NOT NULL UNIQUE COMMENT='Reference to admin_users table';
ALTER TABLE admin_preferences MODIFY COLUMN theme VARCHAR(20) NOT NULL DEFAULT 'light' COMMENT='Theme preference (light, dark)';
ALTER TABLE admin_preferences MODIFY COLUMN items_per_page INT NOT NULL DEFAULT 25 COMMENT='Number of items to display per page (10, 25, 50, 100)';
ALTER TABLE admin_preferences MODIFY COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT='Whether in-app notifications are enabled';
ALTER TABLE admin_preferences MODIFY COLUMN email_alerts BOOLEAN NOT NULL DEFAULT TRUE COMMENT='Whether email alerts are enabled';
ALTER TABLE admin_preferences MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT='Timestamp when preferences were created';
ALTER TABLE admin_preferences MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT='Timestamp when preferences were last updated';
