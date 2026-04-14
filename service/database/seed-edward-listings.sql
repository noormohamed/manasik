-- Create listings (hotels) owned by Edward Sanchez
-- Edward's user ID: edward-001

-- First, create an agent record for Edward
INSERT INTO agents (id, user_id, company_id, service_type, name, email, phone, status, commission_rate)
VALUES ('agent-edward', 'edward-001', 'comp-001', 'HOTEL', 'Edward Sanchez', 'edward.sanchez@email.com', '+1234567890', 'ACTIVE', 10.00)
ON DUPLICATE KEY UPDATE name = 'Edward Sanchez';

-- Insert 3 hotels for Edward Sanchez
INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews)
VALUES 
  ('hotel-edward-001', 'comp-001', 'agent-edward', 'Sanchez Makkah Suites', 'Luxurious suites with stunning views of the Haram. Perfect for families and groups seeking comfort during their pilgrimage.', 'ACTIVE', '123 Ibrahim Al-Khalil Road', 'Makkah', 'Makkah Province', 'Saudi Arabia', '24231', 21.4225, 39.8262, 5, 50, '14:00', '12:00', 4.8, 125),
  ('hotel-edward-002', 'comp-001', 'agent-edward', 'Al-Sanchez Boutique Hotel', 'A charming boutique hotel just steps from Masjid al-Haram. Experience authentic Arabian hospitality.', 'ACTIVE', '456 Ajyad Street', 'Makkah', 'Makkah Province', 'Saudi Arabia', '24232', 21.4195, 39.8275, 4, 30, '15:00', '11:00', 4.5, 89),
  ('hotel-edward-003', 'comp-001', 'agent-edward', 'Edward''s Medina Retreat', 'Peaceful accommodation near Masjid an-Nabawi. Ideal for spiritual reflection and rest.', 'ACTIVE', '789 King Faisal Road', 'Medina', 'Medina Province', 'Saudi Arabia', '42311', 24.4672, 39.6024, 4, 40, '14:00', '11:00', 4.6, 67);

-- Insert room types for each hotel
-- Hotel 1: Sanchez Makkah Suites
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
  ('room-edward-001-std', 'hotel-edward-001', 'Standard Suite', 'Comfortable suite with city view, king bed, and modern amenities.', 2, 20, 15, 150.00, 'USD', 'ACTIVE'),
  ('room-edward-001-dlx', 'hotel-edward-001', 'Deluxe Suite', 'Spacious suite with Haram view, king bed, living area, and premium amenities.', 3, 15, 10, 250.00, 'USD', 'ACTIVE'),
  ('room-edward-001-fam', 'hotel-edward-001', 'Family Suite', 'Large suite with 2 bedrooms, living room, and kitchenette. Perfect for families.', 5, 10, 8, 400.00, 'USD', 'ACTIVE'),
  ('room-edward-001-roy', 'hotel-edward-001', 'Royal Suite', 'Luxurious penthouse suite with panoramic Haram views, butler service, and exclusive amenities.', 4, 5, 3, 800.00, 'USD', 'ACTIVE');

-- Hotel 2: Al-Sanchez Boutique Hotel
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
  ('room-edward-002-std', 'hotel-edward-002', 'Classic Room', 'Cozy room with traditional Arabian decor and modern comforts.', 2, 15, 12, 120.00, 'USD', 'ACTIVE'),
  ('room-edward-002-sup', 'hotel-edward-002', 'Superior Room', 'Upgraded room with balcony and enhanced amenities.', 2, 10, 7, 180.00, 'USD', 'ACTIVE'),
  ('room-edward-002-ste', 'hotel-edward-002', 'Boutique Suite', 'Elegant suite with separate living area and premium furnishings.', 3, 5, 4, 280.00, 'USD', 'ACTIVE');

-- Hotel 3: Edward's Medina Retreat
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
  ('room-edward-003-eco', 'hotel-edward-003', 'Economy Room', 'Simple, clean room ideal for budget-conscious pilgrims.', 2, 15, 12, 80.00, 'USD', 'ACTIVE'),
  ('room-edward-003-std', 'hotel-edward-003', 'Standard Room', 'Comfortable room with all essential amenities.', 2, 15, 10, 120.00, 'USD', 'ACTIVE'),
  ('room-edward-003-dlx', 'hotel-edward-003', 'Deluxe Room', 'Spacious room with mosque view and upgraded amenities.', 3, 8, 6, 200.00, 'USD', 'ACTIVE'),
  ('room-edward-003-ste', 'hotel-edward-003', 'Retreat Suite', 'Peaceful suite with garden view, perfect for extended stays.', 4, 2, 2, 350.00, 'USD', 'ACTIVE');

-- Add hotel images
INSERT INTO hotel_images (hotel_id, image_url, display_order)
VALUES
  ('hotel-edward-001', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1),
  ('hotel-edward-001', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 2),
  ('hotel-edward-002', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1),
  ('hotel-edward-002', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 2),
  ('hotel-edward-003', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 1),
  ('hotel-edward-003', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2);

-- Add hotel amenities
INSERT INTO hotel_amenities (hotel_id, amenity_name, is_available)
VALUES
  ('hotel-edward-001', 'Free WiFi', 1),
  ('hotel-edward-001', 'Air Conditioning', 1),
  ('hotel-edward-001', 'Room Service', 1),
  ('hotel-edward-001', 'Restaurant', 1),
  ('hotel-edward-001', 'Parking', 1),
  ('hotel-edward-001', 'Laundry Service', 1),
  ('hotel-edward-001', 'Prayer Room', 1),
  ('hotel-edward-001', '24/7 Front Desk', 1),
  ('hotel-edward-002', 'Free WiFi', 1),
  ('hotel-edward-002', 'Air Conditioning', 1),
  ('hotel-edward-002', 'Room Service', 1),
  ('hotel-edward-002', 'Restaurant', 1),
  ('hotel-edward-002', 'Prayer Room', 1),
  ('hotel-edward-002', '24/7 Front Desk', 1),
  ('hotel-edward-003', 'Free WiFi', 1),
  ('hotel-edward-003', 'Air Conditioning', 1),
  ('hotel-edward-003', 'Restaurant', 1),
  ('hotel-edward-003', 'Parking', 1),
  ('hotel-edward-003', 'Prayer Room', 1),
  ('hotel-edward-003', '24/7 Front Desk', 1),
  ('hotel-edward-003', 'Garden', 1);
