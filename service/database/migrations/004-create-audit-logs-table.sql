-- Migration: Create audit_logs table for comprehensive action logging
-- This migration creates the audit_logs table to store all administrative actions with change tracking

-- Audit Logs table
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

-- Add comment to table for documentation
ALTER TABLE audit_logs COMMENT='Stores comprehensive audit trail of all administrative actions with change tracking';

-- Add comments to columns for documentation
ALTER TABLE audit_logs MODIFY COLUMN id INT AUTO_INCREMENT COMMENT='Unique identifier for audit log entry';
ALTER TABLE audit_logs MODIFY COLUMN admin_user_id INT NOT NULL COMMENT='Reference to admin_users table';
ALTER TABLE audit_logs MODIFY COLUMN action_type VARCHAR(50) NOT NULL COMMENT='Type of action (CREATE, UPDATE, DELETE, SUSPEND, REACTIVATE, APPROVE, REJECT, etc.)';
ALTER TABLE audit_logs MODIFY COLUMN entity_type VARCHAR(50) NOT NULL COMMENT='Type of entity affected (USER, BOOKING, REVIEW, TRANSACTION, etc.)';
ALTER TABLE audit_logs MODIFY COLUMN entity_id INT COMMENT='ID of the entity affected by the action';
ALTER TABLE audit_logs MODIFY COLUMN old_values JSON COMMENT='Previous values before the action (for updates)';
ALTER TABLE audit_logs MODIFY COLUMN new_values JSON COMMENT='New values after the action (for updates)';
ALTER TABLE audit_logs MODIFY COLUMN reason TEXT COMMENT='Reason for the action (for actions that require a reason)';
ALTER TABLE audit_logs MODIFY COLUMN ip_address VARCHAR(45) COMMENT='IP address of the admin performing the action';
ALTER TABLE audit_logs MODIFY COLUMN user_agent TEXT COMMENT='User agent string from the browser';
ALTER TABLE audit_logs MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT='Timestamp when action was performed';
