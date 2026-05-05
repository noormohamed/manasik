-- Add Manasik Fee columns to bookings table
-- Stores the platform commission percentage and calculated amount per booking

-- Check if columns exist before adding (MySQL 8.0 compatible)
SET @dbname = DATABASE();
SET @tablename = 'bookings';

-- Add manasik_fee_percent column if it doesn't exist
SET @columnname = 'manasik_fee_percent';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE bookings ADD COLUMN manasik_fee_percent DECIMAL(5,2) DEFAULT 0.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add manasik_fee_amount column if it doesn't exist
SET @columnname = 'manasik_fee_amount';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE bookings ADD COLUMN manasik_fee_amount DECIMAL(12,2) DEFAULT 0.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
