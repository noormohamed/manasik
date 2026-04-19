-- Add guests to Edward's existing bookings
-- First, get the booking IDs and add guests to them

-- Get the first booking for Edward and add guests
SET @booking_id = (SELECT id FROM bookings WHERE customer_id = 'edward-001' LIMIT 1);

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  (UUID(), @booking_id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  (UUID(), @booking_id, 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW());

-- Get the second booking for Edward and add guests
SET @booking_id2 = (SELECT id FROM bookings WHERE customer_id = 'edward-001' LIMIT 1 OFFSET 1);

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  (UUID(), @booking_id2, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()),
  (UUID(), @booking_id2, 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1234567891', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW()),
  (UUID(), @booking_id2, 'Sofia', 'Sanchez', 'sofia.sanchez@email.com', '+1234567892', 'United States', 'US555555555', '2015-03-10', FALSE, NOW(), NOW());

-- Get the third booking for Edward and add guests
SET @booking_id3 = (SELECT id FROM bookings WHERE customer_id = 'edward-001' LIMIT 1 OFFSET 2);

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
VALUES
  (UUID(), @booking_id3, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1234567890', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW());
