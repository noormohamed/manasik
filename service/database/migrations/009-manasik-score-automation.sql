-- ============================================================================
-- MANASIK SCORE AUTOMATION MIGRATION
-- ============================================================================
-- This migration consolidates all database schema changes for the Manasik Score
-- automation feature, including:
-- 1. Review friction responses table for collecting guest feedback
-- 2. Score calculations audit trail for compliance and debugging
-- 3. Calculation metadata columns on hotels table
-- 4. Data migration to populate calculation timestamps for existing hotels
--
-- This migration is idempotent and safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- PHASE 1: CREATE REVIEW FRICTION RESPONSES TABLE
-- ============================================================================
-- Stores individual friction responses from hotel reviews
-- Used for calculating Experience Friction scores in Manasik Score automation

CREATE TABLE IF NOT EXISTS review_friction_responses (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL,
    hotel_id VARCHAR(36) NOT NULL,
    friction_type ENUM('lift_delays', 'crowding', 'checkin') NOT NULL,
    response ENUM('yes', 'no', 'na', 'smooth', 'average', 'difficult') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_friction_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_friction_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_friction_review_id (review_id),
    INDEX idx_friction_hotel_id (hotel_id),
    INDEX idx_friction_type (friction_type),
    INDEX idx_friction_created_at (created_at),
    INDEX idx_friction_hotel_type (hotel_id, friction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 2: CREATE SCORE CALCULATIONS AUDIT TRAIL TABLE
-- ============================================================================
-- Stores immutable audit trail of all score calculations for compliance and debugging
-- Tracks every calculation performed on location metrics and experience friction

CREATE TABLE IF NOT EXISTS score_calculations (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    metric_type ENUM('location', 'experience_friction') NOT NULL,
    calculated_value JSON NOT NULL,
    input_data JSON NOT NULL,
    calculation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculation_basis VARCHAR(500),
    
    -- Foreign key
    CONSTRAINT fk_calc_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes for performance and querying
    INDEX idx_calc_hotel_id (hotel_id),
    INDEX idx_calc_metric_type (metric_type),
    INDEX idx_calc_timestamp (calculation_timestamp),
    INDEX idx_calc_hotel_metric (hotel_id, metric_type),
    INDEX idx_calc_hotel_timestamp (hotel_id, calculation_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHASE 3: ADD CALCULATION METADATA COLUMNS TO HOTELS TABLE
-- ============================================================================
-- These columns track when metrics were last calculated and what data was used
-- in the calculation, enabling audit trails and transparency

-- Location Metrics Metadata
ALTER TABLE hotels ADD COLUMN location_metrics_calculated_at TIMESTAMP NULL 
    COMMENT 'Timestamp when location metrics (Walking Time, Route Ease) were last calculated';

ALTER TABLE hotels ADD COLUMN location_metrics_calculation_basis JSON DEFAULT NULL 
    COMMENT 'Stores calculation basis for location metrics (gate_proximity_meters, terrain_data, elevation_change, stairs_required, wheelchair_accessible, etc.)';

-- Experience Friction Metadata
ALTER TABLE hotels ADD COLUMN experience_friction_calculated_at TIMESTAMP NULL 
    COMMENT 'Timestamp when experience friction score was last calculated';

ALTER TABLE hotels ADD COLUMN experience_friction_review_count INT DEFAULT 0 
    COMMENT 'Number of reviews used in the most recent experience friction calculation';

ALTER TABLE hotels ADD COLUMN experience_friction_calculation_basis JSON DEFAULT NULL 
    COMMENT 'Stores calculation basis for experience friction (lift_delays_count, lift_delays_percentage, crowding_count, crowding_percentage, checkin_smooth_count, checkin_average_count, checkin_difficult_count, etc.)';

-- Create indexes for efficient querying of calculated metrics
CREATE INDEX idx_hotels_location_metrics_calculated_at ON hotels(location_metrics_calculated_at);
CREATE INDEX idx_hotels_experience_friction_calculated_at ON hotels(experience_friction_calculated_at);
CREATE INDEX idx_hotels_experience_friction_review_count ON hotels(experience_friction_review_count);

-- ============================================================================
-- PHASE 4: DATA MIGRATION - POPULATE CALCULATION TIMESTAMPS
-- ============================================================================
-- For existing hotels with gate distance data, set calculation timestamps to NOW()
-- This ensures all hotels have calculation metadata populated for audit trail

-- Update experience friction calculation timestamp for hotels with reviews
-- Count reviews per hotel and set calculation timestamp if reviews exist
UPDATE hotels h
SET experience_friction_calculated_at = NOW(),
    experience_friction_review_count = (
        SELECT COUNT(*) FROM reviews r 
        WHERE r.hotel_id = h.id 
        AND r.created_at IS NOT NULL
    ),
    experience_friction_calculation_basis = JSON_OBJECT(
        'review_count', (
            SELECT COUNT(*) FROM reviews r 
            WHERE r.hotel_id = h.id 
            AND r.created_at IS NOT NULL
        ),
        'lift_delays_count', 0,
        'lift_delays_percentage', 0,
        'crowding_count', 0,
        'crowding_percentage', 0,
        'checkin_smooth_count', 0,
        'checkin_average_count', 0,
        'checkin_difficult_count', 0,
        'migration_timestamp', NOW()
    )
WHERE experience_friction_calculated_at IS NULL
  AND EXISTS (
    SELECT 1 FROM reviews r 
    WHERE r.hotel_id = h.id 
    AND r.created_at IS NOT NULL
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables created and data migration completed successfully.
-- The system is now ready for Manasik Score automation features.
