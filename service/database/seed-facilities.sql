-- Seed file for hotel facilities, room facilities, landmarks, and surroundings
-- This populates the advanced filter tables with sample data

-- Sample Hotel Facilities
-- Common facilities that hotels offer
INSERT INTO hotel_facilities (hotel_id, facility_name) VALUES
-- For first hotel (you'll need to replace with actual hotel IDs)
((SELECT id FROM hotels LIMIT 1), 'WiFi'),
((SELECT id FROM hotels LIMIT 1), 'Parking'),
((SELECT id FROM hotels LIMIT 1), 'Gym'),
((SELECT id FROM hotels LIMIT 1), 'Swimming Pool'),
((SELECT id FROM hotels LIMIT 1), 'Restaurant'),
((SELECT id FROM hotels LIMIT 1), 'Bar'),
((SELECT id FROM hotels LIMIT 1), 'Spa'),
((SELECT id FROM hotels LIMIT 1), 'Conference Rooms'),
((SELECT id FROM hotels LIMIT 1), 'Pet Friendly'),
((SELECT id FROM hotels LIMIT 1), 'Wheelchair Accessible')
ON DUPLICATE KEY UPDATE facility_name = VALUES(facility_name);

-- Sample Room Facilities
-- Common room amenities
INSERT INTO room_facilities (room_type_id, facility_name) VALUES
-- For first room type (you'll need to replace with actual room type IDs)
((SELECT id FROM room_types LIMIT 1), 'Air Conditioning'),
((SELECT id FROM room_types LIMIT 1), 'Television'),
((SELECT id FROM room_types LIMIT 1), 'Minibar'),
((SELECT id FROM room_types LIMIT 1), 'Safe'),
((SELECT id FROM room_types LIMIT 1), 'Balcony'),
((SELECT id FROM room_types LIMIT 1), 'Bathtub'),
((SELECT id FROM room_types LIMIT 1), 'Shower'),
((SELECT id FROM room_types LIMIT 1), 'Work Desk'),
((SELECT id FROM room_types LIMIT 1), 'Hairdryer'),
((SELECT id FROM room_types LIMIT 1), 'Iron & Board')
ON DUPLICATE KEY UPDATE facility_name = VALUES(facility_name);

-- Sample Landmarks
-- Proximity data for hotels
INSERT INTO hotel_landmarks (hotel_id, landmark_name, distance_km, landmark_type) VALUES
-- For first hotel
((SELECT id FROM hotels LIMIT 1), 'City Center', 2.5, 'downtown'),
((SELECT id FROM hotels LIMIT 1), 'Airport', 15.0, 'transportation'),
((SELECT id FROM hotels LIMIT 1), 'Train Station', 1.2, 'transportation'),
((SELECT id FROM hotels LIMIT 1), 'Shopping Mall', 3.0, 'shopping'),
((SELECT id FROM hotels LIMIT 1), 'Beach', 5.5, 'attraction'),
((SELECT id FROM hotels LIMIT 1), 'Museum', 4.0, 'attraction'),
((SELECT id FROM hotels LIMIT 1), 'Hospital', 2.0, 'healthcare'),
((SELECT id FROM hotels LIMIT 1), 'University', 6.0, 'education');

-- Sample Hotel Surroundings
-- Nearby attractions and services
INSERT INTO hotel_surroundings (
  hotel_id, 
  restaurants_nearby, 
  cafes_nearby, 
  top_attractions, 
  natural_beauty, 
  public_transport, 
  closest_airport_km
) VALUES
-- For first hotel
(
  (SELECT id FROM hotels LIMIT 1),
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  15.0
)
ON DUPLICATE KEY UPDATE
  restaurants_nearby = VALUES(restaurants_nearby),
  cafes_nearby = VALUES(cafes_nearby),
  top_attractions = VALUES(top_attractions),
  natural_beauty = VALUES(natural_beauty),
  public_transport = VALUES(public_transport),
  closest_airport_km = VALUES(closest_airport_km);

-- Add more varied sample data for multiple hotels
-- This assumes you have at least 5 hotels in the database

-- Hotel 2 - Budget hotel with basic facilities
INSERT INTO hotel_facilities (hotel_id, facility_name) 
SELECT id, 'WiFi' FROM hotels WHERE id != (SELECT id FROM hotels LIMIT 1) LIMIT 1
UNION ALL
SELECT id, 'Parking' FROM hotels WHERE id != (SELECT id FROM hotels LIMIT 1) LIMIT 1
UNION ALL
SELECT id, 'Restaurant' FROM hotels WHERE id != (SELECT id FROM hotels LIMIT 1) LIMIT 1
ON DUPLICATE KEY UPDATE facility_name = VALUES(facility_name);

-- Hotel 3 - Luxury hotel with all facilities
INSERT INTO hotel_facilities (hotel_id, facility_name)
SELECT h.id, f.facility_name FROM 
  (SELECT id FROM hotels ORDER BY id LIMIT 1 OFFSET 2) h
CROSS JOIN
  (SELECT 'WiFi' as facility_name
   UNION SELECT 'Parking'
   UNION SELECT 'Gym'
   UNION SELECT 'Swimming Pool'
   UNION SELECT 'Restaurant'
   UNION SELECT 'Bar'
   UNION SELECT 'Spa'
   UNION SELECT 'Conference Rooms'
   UNION SELECT 'Pet Friendly'
   UNION SELECT 'Wheelchair Accessible'
   UNION SELECT '24-Hour Front Desk'
   UNION SELECT 'Room Service'
   UNION SELECT 'Concierge Service'
   UNION SELECT 'Airport Shuttle'
   UNION SELECT 'Laundry Service') f
ON DUPLICATE KEY UPDATE facility_name = VALUES(facility_name);

-- Add varied surroundings data for multiple hotels
INSERT INTO hotel_surroundings (
  hotel_id, 
  restaurants_nearby, 
  cafes_nearby, 
  top_attractions, 
  natural_beauty, 
  public_transport, 
  closest_airport_km
)
SELECT 
  h.id,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY h.id) % 3 = 0 THEN TRUE ELSE FALSE END,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY h.id) % 2 = 0 THEN TRUE ELSE FALSE END,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY h.id) % 3 = 1 THEN TRUE ELSE FALSE END,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY h.id) % 4 = 0 THEN TRUE ELSE FALSE END,
  TRUE, -- Most hotels have public transport
  FLOOR(5 + RAND() * 45) -- Random distance between 5-50 km
FROM hotels h
WHERE NOT EXISTS (
  SELECT 1 FROM hotel_surroundings hs WHERE hs.hotel_id = h.id
)
LIMIT 10;

-- Add varied landmarks for multiple hotels
INSERT INTO hotel_landmarks (hotel_id, landmark_name, distance_km, landmark_type)
SELECT 
  h.id,
  CASE 
    WHEN RAND() < 0.3 THEN 'City Center'
    WHEN RAND() < 0.5 THEN 'Airport'
    WHEN RAND() < 0.7 THEN 'Train Station'
    ELSE 'Shopping Mall'
  END as landmark_name,
  FLOOR(1 + RAND() * 20) as distance_km,
  CASE 
    WHEN RAND() < 0.3 THEN 'downtown'
    WHEN RAND() < 0.5 THEN 'transportation'
    WHEN RAND() < 0.7 THEN 'shopping'
    ELSE 'attraction'
  END as landmark_type
FROM hotels h
WHERE NOT EXISTS (
  SELECT 1 FROM hotel_landmarks hl WHERE hl.hotel_id = h.id AND hl.landmark_name = 'City Center'
)
LIMIT 20;

-- Note: This seed file can be run multiple times safely due to ON DUPLICATE KEY UPDATE clauses
-- To populate with actual hotel IDs, you may need to modify the SELECT statements to target specific hotels
