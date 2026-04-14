-- Migration: Add hotel filter tables for facilities, room facilities, landmarks, and surroundings

-- Hotel Facilities table (many-to-many)
CREATE TABLE IF NOT EXISTS hotel_facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  UNIQUE KEY unique_hotel_facility (hotel_id, facility_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room Facilities table (many-to-many)
CREATE TABLE IF NOT EXISTS room_facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id VARCHAR(36) NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  INDEX idx_room_type_id (room_type_id),
  UNIQUE KEY unique_room_facility (room_type_id, facility_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel Landmarks table (for proximity filtering)
CREATE TABLE IF NOT EXISTS hotel_landmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL,
  landmark_name VARCHAR(255) NOT NULL,
  distance_km DECIMAL(5, 2) NOT NULL,
  landmark_type VARCHAR(50),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_landmark_type (landmark_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel Surroundings table
CREATE TABLE IF NOT EXISTS hotel_surroundings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(36) NOT NULL UNIQUE,
  restaurants_nearby BOOLEAN DEFAULT FALSE,
  cafes_nearby BOOLEAN DEFAULT FALSE,
  top_attractions BOOLEAN DEFAULT FALSE,
  natural_beauty BOOLEAN DEFAULT FALSE,
  public_transport BOOLEAN DEFAULT FALSE,
  closest_airport_km DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
