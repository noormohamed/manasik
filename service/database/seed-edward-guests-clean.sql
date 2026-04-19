-- Add exactly 2 guests to each of Edward's bookings

-- Get booking IDs and add guests
INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1-555-0101', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Maria', 'Sanchez', 'maria.sanchez@email.com', '+1-555-0102', 'United States', 'US987654321', '1992-08-22', FALSE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1-555-0101', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 1) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'James', 'Wilson', 'james.wilson@email.com', '+1-555-0103', 'United Kingdom', 'GB987654321', '1988-03-10', FALSE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 1) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1-555-0101', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 2) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0104', 'Canada', 'CA555555555', '1995-11-30', FALSE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 2) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1-555-0101', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 3) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Ahmed', 'Hassan', 'ahmed.hassan@email.com', '+966-50-1234567', 'Saudi Arabia', 'SA123456789', '1985-07-20', FALSE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 3) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1-555-0101', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 4) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Fatima', 'Al-Rashid', 'fatima.rashid@email.com', '+966-50-7654321', 'United Arab Emirates', 'AE987654321', '1993-02-14', FALSE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 4) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Edward', 'Sanchez', 'edward.sanchez@email.com', '+1-555-0101', 'United States', 'US123456789', '1990-05-15', TRUE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 5) b;

INSERT INTO guests (id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at)
SELECT UUID(), b.id, 'Yuki', 'Tanaka', 'yuki.tanaka@email.com', '+81-90-1234-5678', 'Japan', 'JP123456789', '1998-09-05', FALSE, NOW(), NOW()
FROM (SELECT id FROM bookings WHERE customer_id = 'edward-001' ORDER BY created_at ASC LIMIT 1 OFFSET 5) b;
