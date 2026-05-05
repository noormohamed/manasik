-- Platform Settings table for storing configurable platform parameters
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default rebate percentage
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES ('rebate_percent', '15', 'Platform commission percentage taken from each booking subtotal')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
