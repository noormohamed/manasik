-- Migration: Create admin_users table for super admin authentication and authorization
-- This migration creates the admin_users table to store super admin accounts with MFA support

-- Admin Users table
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

-- Add comment to table for documentation
ALTER TABLE admin_users COMMENT='Stores super admin user accounts with authentication and MFA support';

-- Add comments to columns for documentation
ALTER TABLE admin_users MODIFY COLUMN id INT AUTO_INCREMENT COMMENT='Unique identifier for admin user';
ALTER TABLE admin_users MODIFY COLUMN email VARCHAR(255) NOT NULL UNIQUE COMMENT='Unique email address for login';
ALTER TABLE admin_users MODIFY COLUMN password_hash VARCHAR(255) NOT NULL COMMENT='Bcrypt hashed password';
ALTER TABLE admin_users MODIFY COLUMN full_name VARCHAR(255) NOT NULL COMMENT='Full name of the admin user';
ALTER TABLE admin_users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN' COMMENT='Admin role (SUPER_ADMIN)';
ALTER TABLE admin_users MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' COMMENT='Account status (ACTIVE, INACTIVE, SUSPENDED)';
ALTER TABLE admin_users MODIFY COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT='Whether MFA is enabled for this account';
ALTER TABLE admin_users MODIFY COLUMN mfa_secret VARCHAR(255) COMMENT='TOTP secret for MFA (encrypted)';
ALTER TABLE admin_users MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT='Timestamp when account was created';
ALTER TABLE admin_users MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT='Timestamp when account was last updated';
ALTER TABLE admin_users MODIFY COLUMN last_login_at TIMESTAMP NULL COMMENT='Timestamp of last successful login';
ALTER TABLE admin_users MODIFY COLUMN created_by_id INT COMMENT='ID of the admin user who created this account';
