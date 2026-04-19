-- Migration: Add Hajj/Umrah specific hotel features
-- Walking time to Haram, View types, Elderly friendly, Family rooms, Best for tags, Manasik score

-- Add new columns to hotels table for Hajj/Umrah specific features
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS walking_time_to_haram INT DEFAULT NULL COMMENT 'Walking time to Haram in minutes',
ADD COLUMN IF NOT EXISTS view_type ENUM('kaaba', 'partial_haram', 'city', 'none') DEFAULT 'none' COMMENT 'View type from hotel',
ADD COLUMN IF NOT EXISTS is_elderly_friendly BOOLEAN DEFAULT FALSE COMMENT 'Wheelchair accessible, elevators, etc.',
ADD COLUMN IF NOT EXISTS has_family_rooms BOOLEAN DEFAULT FALSE COMMENT 'Has rooms suitable for families',
ADD COLUMN IF NOT EXISTS manasik_score DECIMAL(3, 1) DEFAULT NULL COMMENT 'Manasik platform score 0-10',
ADD COLUMN IF NOT EXISTS distance_to_haram_meters INT DEFAULT NULL COMMENT 'Distance to Haram in meters',
ADD COLUMN IF NOT EXISTS nearest_gate_id VARCHAR(36) DEFAULT NULL COMMENT 'Nearest Haram gate';

-- Create hotel_best_for_tags table for "Best for" tags
CREATE TABLE IF NOT EXISTS hotel_best_for_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_tag (tag),
  UNIQUE KEY unique_hotel_tag (hotel_id, tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Predefined "Best for" tags
-- 'families', 'couples', 'solo_travelers', 'elderly', 'groups', 'business', 
-- 'budget', 'luxury', 'first_time_pilgrims', 'repeat_pilgrims', 'wheelchair_users'

-- Create room_types additional fields for family rooms
ALTER TABLE room_types
ADD COLUMN IF NOT EXISTS is_family_room BOOLEAN DEFAULT FALSE COMMENT 'Suitable for families with children',
ADD COLUMN IF NOT EXISTS max_adults INT DEFAULT 2,
ADD COLUMN IF NOT EXISTS max_children INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_connecting_rooms BOOLEAN DEFAULT FALSE;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_hotels_walking_time ON hotels(walking_time_to_haram);
CREATE INDEX IF NOT EXISTS idx_hotels_view_type ON hotels(view_type);
CREATE INDEX IF NOT EXISTS idx_hotels_elderly_friendly ON hotels(is_elderly_friendly);
CREATE INDEX IF NOT EXISTS idx_hotels_family_rooms ON hotels(has_family_rooms);
CREATE INDEX IF NOT EXISTS idx_hotels_manasik_score ON hotels(manasik_score);
CREATE INDEX IF NOT EXISTS idx_hotels_distance_haram ON hotels(distance_to_haram_meters);

-- Update existing hotels with sample Hajj/Umrah data (for Makkah hotels)
UPDATE hotels 
SET 
  walking_time_to_haram = FLOOR(5 + RAND() * 20),
  view_type = ELT(FLOOR(1 + RAND() * 4), 'kaaba', 'partial_haram', 'city', 'none'),
  is_elderly_friendly = RAND() > 0.5,
  has_family_rooms = RAND() > 0.4,
  manasik_score = ROUND(7 + RAND() * 3, 1),
  distance_to_haram_meters = FLOOR(100 + RAND() * 2000)
WHERE city IN ('Makkah', 'Mecca', 'مكة المكرمة');

-- Insert sample "Best for" tags for existing hotels
INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag)
SELECT id, 'families' FROM hotels WHERE has_family_rooms = TRUE AND RAND() > 0.5;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag)
SELECT id, 'elderly' FROM hotels WHERE is_elderly_friendly = TRUE;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag)
SELECT id, 'first_time_pilgrims' FROM hotels WHERE walking_time_to_haram <= 10 AND RAND() > 0.5;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag)
SELECT id, 'luxury' FROM hotels WHERE star_rating >= 4;

INSERT IGNORE INTO hotel_best_for_tags (hotel_id, tag)
SELECT id, 'budget' FROM hotels WHERE star_rating <= 3;
