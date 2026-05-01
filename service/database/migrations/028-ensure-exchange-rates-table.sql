-- Migration 028: Ensure exchange_rates table exists and has live rate support
-- The table was defined in 010-create-credits-system.sql but may not have been applied
-- This migration is idempotent (IF NOT EXISTS)

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

-- Seed default rates if table is empty (will be overwritten by live Frankfurter API rates)
INSERT INTO exchange_rates (id, from_currency, to_currency, rate, source) VALUES
  (UUID(), 'GBP', 'GBP', 1.000000, 'fixed'),
  (UUID(), 'USD', 'GBP', 0.790000, 'manual'),
  (UUID(), 'EUR', 'GBP', 0.860000, 'manual'),
  (UUID(), 'SAR', 'GBP', 0.210000, 'manual'),
  (UUID(), 'GBP', 'USD', 1.270000, 'manual'),
  (UUID(), 'GBP', 'EUR', 1.160000, 'manual'),
  (UUID(), 'GBP', 'SAR', 4.760000, 'manual')
ON DUPLICATE KEY UPDATE id = id;
