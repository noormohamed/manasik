-- Migration: Create admin_alerts table for alert configuration
-- This migration creates the admin_alerts table to store alert configurations and thresholds

-- Admin Alerts table
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

-- Add comment to table for documentation
ALTER TABLE admin_alerts COMMENT='Stores alert configurations with thresholds and severity levels';

-- Add comments to columns for documentation
ALTER TABLE admin_alerts MODIFY COLUMN id INT AUTO_INCREMENT COMMENT='Unique identifier for alert configuration';
ALTER TABLE admin_alerts MODIFY COLUMN alert_type VARCHAR(100) NOT NULL UNIQUE COMMENT='Type of alert (HIGH_REFUND_RATE, PAYMENT_FAILURES, SUSPICIOUS_ACTIVITY, etc.)';
ALTER TABLE admin_alerts MODIFY COLUMN severity VARCHAR(20) NOT NULL COMMENT='Severity level (INFO, WARNING, CRITICAL)';
ALTER TABLE admin_alerts MODIFY COLUMN title VARCHAR(255) NOT NULL COMMENT='Human-readable title for the alert';
ALTER TABLE admin_alerts MODIFY COLUMN description TEXT COMMENT='Detailed description of the alert';
ALTER TABLE admin_alerts MODIFY COLUMN threshold_value DECIMAL(10, 2) COMMENT='Threshold value that triggers the alert';
ALTER TABLE admin_alerts MODIFY COLUMN is_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT='Whether this alert is currently enabled';
ALTER TABLE admin_alerts MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT='Timestamp when alert configuration was created';
ALTER TABLE admin_alerts MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT='Timestamp when alert configuration was last updated';

-- Insert default alert configurations
INSERT INTO admin_alerts (alert_type, severity, title, description, threshold_value, is_enabled) VALUES
('HIGH_REFUND_RATE', 'WARNING', 'High Refund Rate', 'Alert when refund rate exceeds threshold', 10.00, TRUE),
('PAYMENT_FAILURES', 'CRITICAL', 'Payment Failures', 'Alert when payment failure rate is high', 5.00, TRUE),
('SUSPICIOUS_ACTIVITY', 'CRITICAL', 'Suspicious Activity', 'Alert when suspicious user activity is detected', NULL, TRUE),
('LOW_PLATFORM_UPTIME', 'CRITICAL', 'Low Platform Uptime', 'Alert when platform uptime drops below threshold', 99.00, TRUE),
('HIGH_BOOKING_CANCELLATION', 'WARNING', 'High Booking Cancellation', 'Alert when booking cancellation rate is high', 15.00, TRUE),
('NEGATIVE_REVIEWS', 'WARNING', 'Negative Reviews', 'Alert when average rating drops below threshold', 3.50, TRUE)
ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled);
