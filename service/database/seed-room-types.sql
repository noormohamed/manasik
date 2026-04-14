-- Seed room types for all hotels
-- Each hotel gets 3-4 room types

-- Hotel 001 - Grand Plaza
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status) VALUES
('room-001-1', 'hotel-001', 'Standard Room', 'Comfortable room with queen bed, TV, and ensuite bathroom', 2, 20, 18, 120.00, 'GBP', 'ACTIVE'),
('room-001-2', 'hotel-001', 'Deluxe Room', 'Spacious room with king bed, work desk, and city view', 2, 15, 12, 180.00, 'GBP', 'ACTIVE'),
('room-001-3', 'hotel-001', 'Family Suite', 'Large suite with 2 bedrooms, living area, and kitchenette', 4, 8, 6, 280.00, 'GBP', 'ACTIVE'),
('room-001-4', 'hotel-001', 'Executive Suite', 'Premium suite with separate living room and premium amenities', 2, 5, 4, 350.00, 'GBP', 'ACTIVE');

-- Hotel 002 - Riverside Inn
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status) VALUES
('room-002-1', 'hotel-002', 'River View Room', 'Cozy room with beautiful river views', 2, 25, 20, 95.00, 'GBP', 'ACTIVE'),
('room-002-2', 'hotel-002', 'Superior Room', 'Upgraded room with balcony and premium bedding', 2, 15, 12, 135.00, 'GBP', 'ACTIVE'),
('room-002-3', 'hotel-002', 'Family Room', 'Spacious room with 2 double beds', 4, 10, 8, 175.00, 'GBP', 'ACTIVE');

-- Hotel 003 - Ocean View
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status) VALUES
('room-003-1', 'hotel-003', 'Ocean View Standard', 'Room with partial ocean view', 2, 30, 25, 150.00, 'GBP', 'ACTIVE'),
('room-003-2', 'hotel-003', 'Ocean Front Deluxe', 'Premium room with direct ocean view and balcony', 2, 20, 15, 220.00, 'GBP', 'ACTIVE'),
('room-003-3', 'hotel-003', 'Beach Suite', 'Luxury suite with private beach access', 3, 5, 3, 400.00, 'GBP', 'ACTIVE');

-- Hotel 004 - Downtown Suites
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status) VALUES
('room-004-1', 'hotel-004', 'Studio Suite', 'Modern studio with kitchenette', 2, 20, 18, 110.00, 'GBP', 'ACTIVE'),
('room-004-2', 'hotel-004', 'One Bedroom Suite', 'Separate bedroom and living area', 2, 15, 12, 160.00, 'GBP', 'ACTIVE'),
('room-004-3', 'hotel-004', 'Two Bedroom Suite', 'Perfect for families or groups', 5, 8, 6, 250.00, 'GBP', 'ACTIVE');

-- Hotel 005 - Luxury Tower
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status) VALUES
('room-005-1', 'hotel-005', 'Premium Room', 'Elegant room with luxury amenities', 2, 25, 20, 200.00, 'GBP', 'ACTIVE'),
('room-005-2', 'hotel-005', 'Junior Suite', 'Spacious suite with sitting area', 2, 15, 12, 300.00, 'GBP', 'ACTIVE'),
('room-005-3', 'hotel-005', 'Presidential Suite', 'Ultimate luxury with panoramic views', 4, 3, 2, 800.00, 'GBP', 'ACTIVE');

-- Hotel 006-020 (remaining hotels)
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status) VALUES
('room-006-1', 'hotel-006', 'Standard Room', 'Comfortable standard accommodation', 2, 20, 15, 85.00, 'GBP', 'ACTIVE'),
('room-006-2', 'hotel-006', 'Superior Room', 'Upgraded room with extra space', 2, 10, 8, 120.00, 'GBP', 'ACTIVE'),
('room-007-1', 'hotel-007', 'Classic Room', 'Traditional style room', 2, 25, 20, 90.00, 'GBP', 'ACTIVE'),
('room-007-2', 'hotel-007', 'Deluxe Room', 'Modern deluxe accommodation', 2, 15, 12, 140.00, 'GBP', 'ACTIVE'),
('room-008-1', 'hotel-008', 'Garden View', 'Room overlooking gardens', 2, 20, 18, 100.00, 'GBP', 'ACTIVE'),
('room-008-2', 'hotel-008', 'Pool View', 'Room with pool access', 2, 15, 12, 130.00, 'GBP', 'ACTIVE'),
('room-009-1', 'hotel-009', 'Budget Room', 'Affordable comfortable stay', 2, 30, 25, 65.00, 'GBP', 'ACTIVE'),
('room-009-2', 'hotel-009', 'Standard Plus', 'Enhanced standard room', 2, 20, 15, 85.00, 'GBP', 'ACTIVE'),
('room-010-1', 'hotel-010', 'City View Room', 'Room with city skyline view', 2, 25, 20, 110.00, 'GBP', 'ACTIVE'),
('room-010-2', 'hotel-010', 'Corner Suite', 'Spacious corner room', 3, 10, 8, 180.00, 'GBP', 'ACTIVE'),
('room-011-1', 'hotel-011', 'Cozy Single', 'Perfect for solo travelers', 1, 15, 12, 55.00, 'GBP', 'ACTIVE'),
('room-011-2', 'hotel-011', 'Double Room', 'Comfortable double bed room', 2, 20, 18, 80.00, 'GBP', 'ACTIVE'),
('room-012-1', 'hotel-012', 'Business Room', 'Ideal for business travelers', 2, 25, 20, 125.00, 'GBP', 'ACTIVE'),
('room-012-2', 'hotel-012', 'Executive Room', 'Premium business accommodation', 2, 15, 12, 175.00, 'GBP', 'ACTIVE'),
('room-013-1', 'hotel-013', 'Mountain View', 'Room with mountain scenery', 2, 20, 15, 95.00, 'GBP', 'ACTIVE'),
('room-013-2', 'hotel-013', 'Chalet Suite', 'Alpine style suite', 4, 8, 6, 200.00, 'GBP', 'ACTIVE'),
('room-014-1', 'hotel-014', 'Heritage Room', 'Classic heritage style', 2, 18, 15, 105.00, 'GBP', 'ACTIVE'),
('room-014-2', 'hotel-014', 'Royal Suite', 'Luxurious heritage suite', 2, 5, 4, 280.00, 'GBP', 'ACTIVE'),
('room-015-1', 'hotel-015', 'Zen Room', 'Minimalist peaceful room', 2, 20, 18, 90.00, 'GBP', 'ACTIVE'),
('room-015-2', 'hotel-015', 'Spa Suite', 'Suite with private spa', 2, 8, 6, 220.00, 'GBP', 'ACTIVE'),
('room-016-1', 'hotel-016', 'Economy Room', 'Budget-friendly option', 2, 30, 25, 60.00, 'GBP', 'ACTIVE'),
('room-016-2', 'hotel-016', 'Comfort Room', 'Enhanced comfort stay', 2, 20, 15, 85.00, 'GBP', 'ACTIVE'),
('room-017-1', 'hotel-017', 'Boutique Room', 'Unique designer room', 2, 15, 12, 135.00, 'GBP', 'ACTIVE'),
('room-017-2', 'hotel-017', 'Loft Suite', 'Modern loft style suite', 3, 8, 6, 210.00, 'GBP', 'ACTIVE'),
('room-018-1', 'hotel-018', 'Harbor View', 'Room overlooking harbor', 2, 22, 18, 115.00, 'GBP', 'ACTIVE'),
('room-018-2', 'hotel-018', 'Marina Suite', 'Premium harbor suite', 2, 10, 8, 195.00, 'GBP', 'ACTIVE'),
('room-019-1', 'hotel-019', 'Park View Room', 'Room facing the park', 2, 25, 20, 100.00, 'GBP', 'ACTIVE'),
('room-019-2', 'hotel-019', 'Garden Suite', 'Suite with garden access', 3, 10, 8, 165.00, 'GBP', 'ACTIVE'),
('room-020-1', 'hotel-020', 'Modern Room', 'Contemporary design room', 2, 20, 18, 95.00, 'GBP', 'ACTIVE'),
('room-020-2', 'hotel-020', 'Penthouse Suite', 'Top floor luxury suite', 4, 3, 2, 450.00, 'GBP', 'ACTIVE');
