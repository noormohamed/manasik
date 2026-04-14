-- Create bookings for Edward's hotels
-- These are bookings made by other customers at Edward's properties
-- Edward earns credits from these bookings

-- Bookings for Sanchez Makkah Suites (hotel-edward-001)
-- Mix of pending (future check-out) and completed (past check-out) bookings

-- Completed bookings (checked out - available funds)
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-ed-001', 'comp-001', 'agent-001', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'USD', 450.00, 45.00, 495.00, 'PAID', 
   '{"hotelId": "hotel-edward-001", "hotelName": "Sanchez Makkah Suites", "roomType": "Deluxe Suite", "roomTypeId": "room-edward-001-dlx", "checkInDate": "2026-03-01", "checkOutDate": "2026-03-04", "nights": 3, "guests": 2}',
   '2026-02-15 10:00:00'),
  ('booking-ed-002', 'comp-001', 'agent-002', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'USD', 800.00, 80.00, 880.00, 'PAID',
   '{"hotelId": "hotel-edward-001", "hotelName": "Sanchez Makkah Suites", "roomType": "Royal Suite", "roomTypeId": "room-edward-001-roy", "checkInDate": "2026-03-05", "checkOutDate": "2026-03-06", "nights": 1, "guests": 3}',
   '2026-02-20 14:30:00'),
  ('booking-ed-003', 'comp-001', 'agent-003', 'HOTEL', 'AGENT', 'agent-001', 'COMPLETED', 'USD', 1200.00, 120.00, 1320.00, 'PAID',
   '{"hotelId": "hotel-edward-001", "hotelName": "Sanchez Makkah Suites", "roomType": "Family Suite", "roomTypeId": "room-edward-001-fam", "checkInDate": "2026-03-10", "checkOutDate": "2026-03-13", "nights": 3, "guests": 5}',
   '2026-02-25 09:15:00');

-- Pending bookings (future check-out - pending credits)
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-ed-004', 'comp-001', 'agent-004', 'HOTEL', 'DIRECT', NULL, 'CONFIRMED', 'USD', 750.00, 75.00, 825.00, 'PAID',
   '{"hotelId": "hotel-edward-001", "hotelName": "Sanchez Makkah Suites", "roomType": "Deluxe Suite", "roomTypeId": "room-edward-001-dlx", "checkInDate": "2026-04-15", "checkOutDate": "2026-04-18", "nights": 3, "guests": 2}',
   '2026-04-01 11:00:00'),
  ('booking-ed-005', 'comp-001', 'agent-001', 'HOTEL', 'DIRECT', NULL, 'CONFIRMED', 'USD', 1600.00, 160.00, 1760.00, 'PAID',
   '{"hotelId": "hotel-edward-001", "hotelName": "Sanchez Makkah Suites", "roomType": "Royal Suite", "roomTypeId": "room-edward-001-roy", "checkInDate": "2026-04-20", "checkOutDate": "2026-04-22", "nights": 2, "guests": 4}',
   '2026-04-05 16:45:00');

-- Bookings for Al-Sanchez Boutique Hotel (hotel-edward-002)
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-ed-006', 'comp-001', 'agent-002', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'USD', 360.00, 36.00, 396.00, 'PAID',
   '{"hotelId": "hotel-edward-002", "hotelName": "Al-Sanchez Boutique Hotel", "roomType": "Superior Room", "roomTypeId": "room-edward-002-sup", "checkInDate": "2026-03-08", "checkOutDate": "2026-03-10", "nights": 2, "guests": 2}',
   '2026-02-28 08:30:00'),
  ('booking-ed-007', 'comp-001', 'agent-003', 'HOTEL', 'AGENT', 'agent-002', 'COMPLETED', 'USD', 560.00, 56.00, 616.00, 'PAID',
   '{"hotelId": "hotel-edward-002", "hotelName": "Al-Sanchez Boutique Hotel", "roomType": "Boutique Suite", "roomTypeId": "room-edward-002-ste", "checkInDate": "2026-03-15", "checkOutDate": "2026-03-17", "nights": 2, "guests": 3}',
   '2026-03-01 12:00:00'),
  ('booking-ed-008', 'comp-001', 'agent-004', 'HOTEL', 'DIRECT', NULL, 'CONFIRMED', 'USD', 480.00, 48.00, 528.00, 'PAID',
   '{"hotelId": "hotel-edward-002", "hotelName": "Al-Sanchez Boutique Hotel", "roomType": "Classic Room", "roomTypeId": "room-edward-002-std", "checkInDate": "2026-04-25", "checkOutDate": "2026-04-29", "nights": 4, "guests": 2}',
   '2026-04-10 10:30:00');

-- Bookings for Edward's Medina Retreat (hotel-edward-003)
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-ed-009', 'comp-001', 'agent-001', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'USD', 400.00, 40.00, 440.00, 'PAID',
   '{"hotelId": "hotel-edward-003", "hotelName": "Edward''s Medina Retreat", "roomType": "Deluxe Room", "roomTypeId": "room-edward-003-dlx", "checkInDate": "2026-03-20", "checkOutDate": "2026-03-22", "nights": 2, "guests": 3}',
   '2026-03-05 15:00:00'),
  ('booking-ed-010', 'comp-001', 'agent-002', 'HOTEL', 'DIRECT', NULL, 'COMPLETED', 'USD', 700.00, 70.00, 770.00, 'PAID',
   '{"hotelId": "hotel-edward-003", "hotelName": "Edward''s Medina Retreat", "roomType": "Retreat Suite", "roomTypeId": "room-edward-003-ste", "checkInDate": "2026-03-25", "checkOutDate": "2026-03-27", "nights": 2, "guests": 4}',
   '2026-03-10 09:00:00'),
  ('booking-ed-011', 'comp-001', 'agent-003', 'HOTEL', 'AGENT', 'agent-001', 'CONFIRMED', 'USD', 240.00, 24.00, 264.00, 'PAID',
   '{"hotelId": "hotel-edward-003", "hotelName": "Edward''s Medina Retreat", "roomType": "Economy Room", "roomTypeId": "room-edward-003-eco", "checkInDate": "2026-05-01", "checkOutDate": "2026-05-04", "nights": 3, "guests": 2}',
   '2026-04-08 14:00:00'),
  ('booking-ed-012', 'comp-001', 'agent-004', 'HOTEL', 'DIRECT', NULL, 'CONFIRMED', 'USD', 600.00, 60.00, 660.00, 'PAID',
   '{"hotelId": "hotel-edward-003", "hotelName": "Edward''s Medina Retreat", "roomType": "Standard Room", "roomTypeId": "room-edward-003-std", "checkInDate": "2026-05-10", "checkOutDate": "2026-05-15", "nights": 5, "guests": 2}',
   '2026-04-09 11:30:00');

-- One cancelled booking
INSERT INTO bookings (id, company_id, customer_id, service_type, booking_source, agent_id, status, currency, subtotal, tax, total, payment_status, metadata, created_at)
VALUES
  ('booking-ed-013', 'comp-001', 'agent-001', 'HOTEL', 'DIRECT', NULL, 'CANCELLED', 'USD', 300.00, 30.00, 330.00, 'REFUNDED',
   '{"hotelId": "hotel-edward-001", "hotelName": "Sanchez Makkah Suites", "roomType": "Standard Suite", "roomTypeId": "room-edward-001-std", "checkInDate": "2026-04-01", "checkOutDate": "2026-04-03", "nights": 2, "guests": 2}',
   '2026-03-15 10:00:00');
