-- Create bookings for Edward as a customer
-- These are bookings Edward made at various hotels

-- Booking 1: Beach Club
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-edward-cust-001', 'comp-001', 'edward-001', 'HOTEL', 'DIRECT', NULL, 'CONFIRMED', 'USD', 450.00, 45.00, 495.00, 'PAID', 
   '{"hotelId": "hotel-001", "hotelName": "Beach Club", "roomType": "Deluxe Suite", "roomTypeId": "room-001-dlx", "checkInDate": "2026-04-21", "checkOutDate": "2026-04-24", "nights": 3, "guests": 2, "guestName": "Edward Sanchez", "guestEmail": "edward.sanchez@email.com", "guestPhone": "+1234567890"}',
   '2026-04-01 10:00:00');

-- Add guests for booking 1
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  ('guest-edward-001-001', 'booking-edward-cust-001', 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  ('guest-edward-001-002', 'booking-edward-cust-001', 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW());

-- Booking 2: Mountain Resort
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-edward-cust-002', 'comp-001', 'edward-001', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'USD', 800.00, 80.00, 880.00, 'PAID',
   '{"hotelId": "hotel-002", "hotelName": "Mountain Resort", "roomType": "Royal Suite", "roomTypeId": "room-002-roy", "checkInDate": "2026-03-10", "checkOutDate": "2026-03-12", "nights": 2, "guests": 3, "guestName": "Edward Sanchez", "guestEmail": "edward.sanchez@email.com", "guestPhone": "+1234567890"}',
   '2026-02-20 14:30:00');

-- Add guests for booking 2
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  ('guest-edward-002-001', 'booking-edward-cust-002', 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  ('guest-edward-002-002', 'booking-edward-cust-002', 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW()),
  ('guest-edward-002-003', 'booking-edward-cust-002', 'Sofia', 'Sanchez', 'sofia.sanchez@email.com', '+1234567892', 'United States', 'US555555555', '2015-03-10', FALSE, NOW(), NOW());

-- Booking 3: City Center Hotel
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-edward-cust-003', 'comp-001', 'edward-001', 'HOTEL', 'DIRECT', NULL, 'PENDING', 'USD', 600.00, 60.00, 660.00, 'PENDING',
   '{"hotelId": "hotel-003", "hotelName": "City Center Hotel", "roomType": "Standard Room", "roomTypeId": "room-003-std", "checkInDate": "2026-05-15", "checkOutDate": "2026-05-18", "nights": 3, "guests": 1, "guestName": "Edward Sanchez", "guestEmail": "edward.sanchez@email.com", "guestPhone": "+1234567890"}',
   '2026-04-15 09:00:00');

-- Add guest for booking 3
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  ('guest-edward-003-001', 'booking-edward-cust-003', 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW());
