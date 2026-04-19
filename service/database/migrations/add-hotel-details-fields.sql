-- Migration: Add hotel details fields for conversion-critical information
-- Date: 2026-04-16

-- Add new columns to hotels table (using procedure to handle IF NOT EXISTS)
DELIMITER //

DROP PROCEDURE IF EXISTS add_hotel_columns//

CREATE PROCEDURE add_hotel_columns()
BEGIN
    -- Add manasik_score if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'manasik_score') THEN
        ALTER TABLE hotels ADD COLUMN manasik_score DECIMAL(3,1) DEFAULT NULL COMMENT 'Manasik quality score 0-10';
    END IF;
    
    -- Add walk_description if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'walk_description') THEN
        ALTER TABLE hotels ADD COLUMN walk_description TEXT DEFAULT NULL COMMENT 'Description of the walk to Haram';
    END IF;
    
    -- Add lift_situation if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'lift_situation') THEN
        ALTER TABLE hotels ADD COLUMN lift_situation VARCHAR(255) DEFAULT NULL COMMENT 'Lift/elevator availability info';
    END IF;
    
    -- Add distance_explanation if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'distance_explanation') THEN
        ALTER TABLE hotels ADD COLUMN distance_explanation TEXT DEFAULT NULL COMMENT 'Detailed explanation of distance to Haram';
    END IF;
    
    -- Add video_url if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'video_url') THEN
        ALTER TABLE hotels ADD COLUMN video_url VARCHAR(500) DEFAULT NULL COMMENT 'Hotel video URL';
    END IF;
    
    -- Add video_thumbnail if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'video_thumbnail') THEN
        ALTER TABLE hotels ADD COLUMN video_thumbnail VARCHAR(500) DEFAULT NULL COMMENT 'Video thumbnail URL';
    END IF;
    
    -- Add cancellation_policy to room_types if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'room_types' AND COLUMN_NAME = 'cancellation_policy') THEN
        ALTER TABLE room_types ADD COLUMN cancellation_policy TEXT DEFAULT NULL COMMENT 'Room-specific cancellation policy';
    END IF;
END//

DELIMITER ;

CALL add_hotel_columns();
DROP PROCEDURE IF EXISTS add_hotel_columns;

-- Create hotel_best_for_tags table for "Best for" tags
CREATE TABLE IF NOT EXISTS hotel_best_for_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  tag_name VARCHAR(100) NOT NULL COMMENT 'e.g., elderly, families, wheelchair, budget, luxury',
  tag_icon VARCHAR(50) DEFAULT NULL COMMENT 'Icon class for the tag',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hotel_tag (hotel_id, tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed some "Best for" tags for existing hotels
INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag_name, tag_icon) 
SELECT h.id, 'families', 'ri-parent-line'
FROM hotels h 
WHERE h.star_rating >= 4
LIMIT 5;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag_name, tag_icon) 
SELECT h.id, 'elderly', 'ri-wheelchair-line'
FROM hotels h 
WHERE h.id IN (SELECT DISTINCT hotel_id FROM hotel_gate_distances WHERE distance_meters < 300)
LIMIT 5;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag_name, tag_icon) 
SELECT h.id, 'budget', 'ri-money-dollar-circle-line'
FROM hotels h 
WHERE h.star_rating <= 3
LIMIT 5;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag_name, tag_icon) 
SELECT h.id, 'luxury', 'ri-vip-crown-line'
FROM hotels h 
WHERE h.star_rating >= 5
LIMIT 3;

-- Update hotels with sample data for new fields
UPDATE hotels SET 
  manasik_score = ROUND(4.0 + (RAND() * 1.5), 1),
  walk_description = CASE 
    WHEN star_rating >= 4 THEN 'Easy walk on well-lit, covered pathways. Air-conditioned tunnels available during peak hours.'
    WHEN star_rating = 3 THEN 'Moderate walk through busy streets. Some shaded areas available.'
    ELSE 'Standard walk through local streets. Best to travel during cooler hours.'
  END,
  lift_situation = CASE 
    WHEN star_rating >= 4 THEN 'Multiple high-speed lifts available 24/7. Wheelchair accessible.'
    WHEN star_rating = 3 THEN 'Lifts available. May experience wait times during peak hours.'
    ELSE 'Limited lift access. Stairs may be required for some floors.'
  END,
  distance_explanation = 'Walking distance measured from hotel entrance to the nearest Haram gate. Actual time may vary based on crowd conditions and walking pace.'
WHERE manasik_score IS NULL;
