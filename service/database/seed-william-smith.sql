-- Seed data for William Smith (agent-10@bookingplatform.com)
-- William Smith manages the Beach Club hotel

-- First, update William Smith's user record (user ID is agent-010 from seed-platform-data.js)
UPDATE users SET first_name = 'William', last_name = 'Smith', email = 'agent-10@bookingplatform.com' WHERE id = 'agent-010';

-- Create an agent record for William Smith (if not exists)
INSERT INTO agents (id, user_id, company_id, service_type, name, email, phone, status, commission_rate, total_bookings, total_revenue, average_rating, total_reviews)
VALUES ('agent-10', 'agent-010', 'comp-001', 'HOTEL', 'William Smith', 'agent-10@bookingplatform.com', '+1-800-WILLIAM', 'ACTIVE', 10.0, 0, 0.00, 0.0, 0)
ON DUPLICATE KEY UPDATE name = 'William Smith', email = 'agent-10@bookingplatform.com';

-- Update the Beach Club hotel (hotel-010) to be managed by William Smith
UPDATE hotels SET agent_id = 'agent-10' WHERE id = 'hotel-010' AND name = 'Beach Club';

-- Create bookings for Beach Club (these are customer bookings that William Smith should see as hotel manager)
-- Booking 1: Edward Sanchez's booking at Beach Club
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, refund_amount, refund_reason, refunded_at, metadata, created_at, updated_at)
VALUES 
  ('booking-0010', 'comp-001', 'edward-001', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'GBP', 150.00, 30.00, 180.00, 'PAID', 180.00, 'Guest requested refund', '2026-04-24 10:00:00',
   '{"hotelId": "hotel-010", "hotelName": "Beach Club", "roomType": "City View Room", "roomTypeId": "room-beach-club-dlx", "checkInDate": "2026-04-21", "checkOutDate": "2026-04-24", "nights": 3, "guests": 2, "guestName": "Edward Sanchez", "guestEmail": "edward.sanchez@email.com", "guestPhone": "+1234567890"}',
   '2026-04-16 10:00:00', NOW())
ON DUPLICATE KEY UPDATE status = 'COMPLETED';

-- Booking 2: Another customer booking at Beach Club
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at, updated_at)
VALUES 
  ('booking-0030', 'comp-001', 'edward-001', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'GBP', 300.00, 60.00, 360.00, 'PAID',
   '{"hotelId": "hotel-010", "hotelName": "Beach Club", "roomType": "City View Room", "roomTypeId": "room-beach-club-dlx", "checkInDate": "2026-04-21", "checkOutDate": "2026-04-24", "nights": 3, "guests": 2, "guestName": "Edward Sanchez", "guestEmail": "edward.sanchez@email.com", "guestPhone": "+1234567890"}',
   '2026-04-16 10:00:00', NOW())
ON DUPLICATE KEY UPDATE status = 'COMPLETED';

-- Booking 3: Another customer booking at Beach Club
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at, updated_at)
VALUES 
  ('booking-0050', 'comp-001', 'edward-001', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'GBP', 300.00, 60.00, 360.00, 'PAID',
   '{"hotelId": "hotel-010", "hotelName": "Beach Club", "roomType": "City View Room", "roomTypeId": "room-beach-club-dlx", "checkInDate": "2026-04-21", "checkOutDate": "2026-04-24", "nights": 3, "guests": 2, "guestName": "Edward Sanchez", "guestEmail": "edward.sanchez@email.com", "guestPhone": "+1234567890"}',
   '2026-04-16 10:00:00', NOW())
ON DUPLICATE KEY UPDATE status = 'COMPLETED';

-- Add guests for booking 1
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  ('guest-0010-001', 'booking-0010', 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  ('guest-0010-002', 'booking-0010', 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW())
ON DUPLICATE KEY UPDATE first_name = first_name;

-- Add guests for booking 2
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  ('guest-0030-001', 'booking-0030', 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  ('guest-0030-002', 'booking-0030', 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW())
ON DUPLICATE KEY UPDATE first_name = first_name;

-- Add guests for booking 3
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  ('guest-0050-001', 'booking-0050', 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  ('guest-0050-002', 'booking-0050', 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW())
ON DUPLICATE KEY UPDATE first_name = first_name;

-- Add hotel amenities
INSERT INTO hotel_amenities (hotel_id, amenity_name, is_available)
VALUES
  ('hotel-010', 'Free WiFi', 1),
  ('hotel-010', 'Air Conditioning', 1),
  ('hotel-010', 'Room Service', 1),
  ('hotel-010', 'Restaurant', 1),
  ('hotel-010', 'Beach Access', 1),
  ('hotel-010', 'Swimming Pool', 1),
  ('hotel-010', 'Spa', 1),
  ('hotel-010', '24/7 Front Desk', 1)
ON DUPLICATE KEY UPDATE is_available = 1;

-- Add hotel images
INSERT INTO hotel_images (hotel_id, image_url, display_order)
VALUES
  ('hotel-010', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1),
  ('hotel-010', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 2),
  ('hotel-010', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 3)
ON DUPLICATE KEY UPDATE image_url = image_url;
