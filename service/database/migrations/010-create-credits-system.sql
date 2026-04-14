-- Migration: Create credits system
-- Credits are 1:1 with GBP pence (1 credit = £0.01)

-- User credits balance table
CREATE TABLE IF NOT EXISTS user_credits (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  balance BIGINT DEFAULT 0,
  lifetime_earned BIGINT DEFAULT 0,
  lifetime_spent BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(36) NULL,
  type ENUM('EARN', 'SPEND', 'REFUND', 'ADJUSTMENT', 'BONUS') NOT NULL,
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  currency_original VARCHAR(3) NULL,
  amount_original DECIMAL(12, 2) NULL,
  exchange_rate DECIMAL(10, 6) NULL,
  description VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exchange rates table (cached rates)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id VARCHAR(36) PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  UNIQUE KEY unique_currency_pair (from_currency, to_currency),
  INDEX idx_currencies (from_currency, to_currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default exchange rates (GBP is base, 1 GBP = X currency)
INSERT INTO exchange_rates (id, from_currency, to_currency, rate, source) VALUES
  (UUID(), 'GBP', 'GBP', 1.000000, 'fixed'),
  (UUID(), 'USD', 'GBP', 0.790000, 'manual'),
  (UUID(), 'EUR', 'GBP', 0.860000, 'manual'),
  (UUID(), 'SAR', 'GBP', 0.210000, 'manual')
ON DUPLICATE KEY UPDATE rate = VALUES(rate), fetched_at = NOW();
