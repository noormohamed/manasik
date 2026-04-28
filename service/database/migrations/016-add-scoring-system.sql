-- Migration: Add weighted scoring system
-- Adds scoring_data JSON column to hotels for per-hotel characteristic inputs
-- Adds scoring_weights table for globally configurable category percentages

-- Add scoring_data column to hotels table (stores per-hotel characteristic scores as JSON)
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS scoring_data JSON NULL COMMENT 'Per-category characteristic scores entered by hotel manager';

-- Create scoring_weights table for global category weight configuration
CREATE TABLE IF NOT EXISTS scoring_weights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_weight DECIMAL(5,2) NOT NULL DEFAULT 35.00 COMMENT 'Weight % for Location category',
  pilgrim_suitability_weight DECIMAL(5,2) NOT NULL DEFAULT 25.00 COMMENT 'Weight % for Pilgrim Suitability category',
  hotel_quality_weight DECIMAL(5,2) NOT NULL DEFAULT 20.00 COMMENT 'Weight % for Hotel Quality category',
  experience_friction_weight DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Weight % for Experience Friction category',
  user_reviews_weight DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Weight % for User Reviews category',
  updated_by VARCHAR(36) NULL COMMENT 'Admin user ID who last updated',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default weights row (only one row is used, enforced in application logic)
INSERT INTO scoring_weights (
  location_weight,
  pilgrim_suitability_weight,
  hotel_quality_weight,
  experience_friction_weight,
  user_reviews_weight
) SELECT 35.00, 25.00, 20.00, 10.00, 10.00
WHERE NOT EXISTS (SELECT 1 FROM scoring_weights LIMIT 1);
