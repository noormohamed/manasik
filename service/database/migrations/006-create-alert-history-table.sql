-- Migration: Create alert_history table for alert tracking
-- This migration creates the alert_history table to store alert triggers and acknowledgments

-- Alert History table
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

-- Add comment to table for documentation
ALTER TABLE alert_history COMMENT='Stores history of alert triggers and acknowledgments for compliance and analysis';

-- Add comments to columns for documentation
ALTER TABLE alert_history MODIFY COLUMN id INT AUTO_INCREMENT COMMENT='Unique identifier for alert history entry';
ALTER TABLE alert_history MODIFY COLUMN alert_id INT NOT NULL COMMENT='Reference to admin_alerts table';
ALTER TABLE alert_history MODIFY COLUMN triggered_at TIMESTAMP NOT NULL COMMENT='Timestamp when alert was triggered';
ALTER TABLE alert_history MODIFY COLUMN current_value DECIMAL(10, 2) COMMENT='Current value that triggered the alert';
ALTER TABLE alert_history MODIFY COLUMN acknowledged_by_id INT COMMENT='Reference to admin_users table who acknowledged the alert';
ALTER TABLE alert_history MODIFY COLUMN acknowledged_at TIMESTAMP NULL COMMENT='Timestamp when alert was acknowledged';
ALTER TABLE alert_history MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT='Timestamp when alert history entry was created';
