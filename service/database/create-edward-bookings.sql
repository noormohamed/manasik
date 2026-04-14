-- Create bookings for Edward Sanchez's hotels
-- This will create bookings and update available_rooms accordingly

-- Get some customer IDs for bookings
SET @customer1 = (SELECT id FROM users WHERE role = 'CUSTOMER' AND email LIKE '%customer%' LIMIT 1 OFFSET 0);
SET @customer2 = (SELECT id FROM users WHERE role = 'CUSTOMER' AND email LIKE '%customer%' LIMIT 1 OFFSET 1);
SET @customer3 = (SELECT id FROM users WHERE role = 'CUSTOMER' AND email LIKE '%customer%' LIMIT 1 OFFSET 2);
SET @customer4 = (SELECT id FROM users WHERE role = 'CUSTOMER' AND email LIKE '%customer%' LIMIT 1 OFFSET 3);
SET @customer5 = (SELECT id FROM users WHERE role = 'CUSTOMER' AND email LIKE '%customer%' LIMIT 1 OFFSET 4);

-- Harbor Inn Dubai (3a32cf03-a8dd-4b2b-8517-0dcc8fc68047)
-- Deluxe Room (9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e): 22 total, currently 15 available
-- Book 7 rooms (making it fully booked)
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer1, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', '2026-02-10', '2026-02-15', 2, 'John Smith', 'john.smith@email.com', 1153.45, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer2, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', '2026-02-12', '2026-02-14', 3, 'Sarah Johnson', 'sarah.j@email.com', 461.38, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer3, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', '2026-02-20', '2026-02-25', 2, 'Mike Brown', 'mike.b@email.com', 1153.45, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer4, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', '2026-03-01', '2026-03-03', 3, 'Emily Davis', 'emily.d@email.com', 461.38, 'USD', 'PENDING', NOW(), NOW()),
(UUID(), @customer5, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', '2026-03-10', '2026-03-12', 2, 'David Wilson', 'david.w@email.com', 461.38, 'USD', 'CONFIRMED', NOW(), NOW());

-- Update available rooms for Deluxe Room (booked 5 more rooms, 7 were already booked)
UPDATE room_types SET available_rooms = 10 WHERE id = '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e';

-- Standard Room (c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f): 11 total, currently 7 available
-- Book 3 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer1, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f', '2026-02-15', '2026-02-18', 2, 'Lisa Anderson', 'lisa.a@email.com', 713.34, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer2, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f', '2026-02-20', '2026-02-22', 3, 'Tom Martinez', 'tom.m@email.com', 475.56, 'USD', 'CONFIRMED', NOW(), NOW());

UPDATE room_types SET available_rooms = 5 WHERE id = 'c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f';

-- Suite Room (3f2679da-87be-439c-b92a-8144dd0ddf44): 8 total, currently 5 available
-- Book 2 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer3, '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', '3f2679da-87be-439c-b92a-8144dd0ddf44', '2026-02-25', '2026-03-01', 4, 'Jennifer Lee', 'jennifer.l@email.com', 1364.52, 'USD', 'CONFIRMED', NOW(), NOW());

UPDATE room_types SET available_rooms = 4 WHERE id = '3f2679da-87be-439c-b92a-8144dd0ddf44';

-- Vista Inn Dubai (4cea05bd-9212-49af-9b6f-f7d29aa0a1b6)
-- Deluxe Room (612cf0e9-35a6-40a2-9609-1cb426f72a78): 14 total, currently 9 available
-- Book 4 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer4, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', '612cf0e9-35a6-40a2-9609-1cb426f72a78', '2026-02-10', '2026-02-14', 3, 'Robert Taylor', 'robert.t@email.com', 958.24, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer5, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', '612cf0e9-35a6-40a2-9609-1cb426f72a78', '2026-02-18', '2026-02-20', 2, 'Maria Garcia', 'maria.g@email.com', 479.12, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer1, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', '612cf0e9-35a6-40a2-9609-1cb426f72a78', '2026-03-05', '2026-03-08', 3, 'James White', 'james.w@email.com', 718.68, 'USD', 'PENDING', NOW(), NOW());

UPDATE room_types SET available_rooms = 6 WHERE id = '612cf0e9-35a6-40a2-9609-1cb426f72a78';

-- Standard Room (9dbdf157-78be-46d6-8801-3ff7989c4432): 20 total, currently 14 available
-- Book 5 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer2, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', '9dbdf157-78be-46d6-8801-3ff7989c4432', '2026-02-12', '2026-02-16', 4, 'Patricia Moore', 'patricia.m@email.com', 1196.40, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer3, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', '9dbdf157-78be-46d6-8801-3ff7989c4432', '2026-02-20', '2026-02-23', 2, 'Christopher Hall', 'chris.h@email.com', 897.30, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer4, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', '9dbdf157-78be-46d6-8801-3ff7989c4432', '2026-03-01', '2026-03-04', 4, 'Linda Allen', 'linda.a@email.com', 897.30, 'USD', 'CONFIRMED', NOW(), NOW());

UPDATE room_types SET available_rooms = 11 WHERE id = '9dbdf157-78be-46d6-8801-3ff7989c4432';

-- Suite Room (bf77767f-6a01-4f52-924e-13a579b60655): 7 total, currently 4 available
-- Book 2 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer5, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'bf77767f-6a01-4f52-924e-13a579b60655', '2026-02-15', '2026-02-19', 3, 'Daniel Young', 'daniel.y@email.com', 1265.52, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer1, '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'bf77767f-6a01-4f52-924e-13a579b60655', '2026-03-10', '2026-03-13', 2, 'Nancy King', 'nancy.k@email.com', 949.14, 'USD', 'PENDING', NOW(), NOW());

UPDATE room_types SET available_rooms = 2 WHERE id = 'bf77767f-6a01-4f52-924e-13a579b60655';

-- Harbor Inn Dubai (71df6b23-06c0-42b0-bb55-692afe080e34) - Second location
-- Deluxe Room (d5fb9cc4-f831-4b33-aed9-0fc49e6f5b70): 24 total, currently 16 available
-- Book 6 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer2, '71df6b23-06c0-42b0-bb55-692afe080e34', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', '2026-02-08', '2026-02-12', 4, 'Kevin Wright', 'kevin.w@email.com', 1051.36, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer3, '71df6b23-06c0-42b0-bb55-692afe080e34', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', '2026-02-14', '2026-02-17', 3, 'Betty Lopez', 'betty.l@email.com', 788.52, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer4, '71df6b23-06c0-42b0-bb55-692afe080e34', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', '2026-02-22', '2026-02-26', 4, 'George Hill', 'george.h@email.com', 1051.36, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer5, '71df6b23-06c0-42b0-bb55-692afe080e34', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', '2026-03-05', '2026-03-07', 2, 'Sandra Scott', 'sandra.s@email.com', 525.68, 'USD', 'PENDING', NOW(), NOW());

UPDATE room_types SET available_rooms = 12 WHERE id = 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70';

-- Executive Room (2685aba2-53d3-4a15-8351-bdf65c6e0626): 22 total, currently 15 available
-- Book 4 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer1, '71df6b23-06c0-42b0-bb55-692afe080e34', '2685aba2-53d3-4a15-8351-bdf65c6e0626', '2026-02-10', '2026-02-13', 3, 'Donald Green', 'donald.g@email.com', 757.62, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer2, '71df6b23-06c0-42b0-bb55-692afe080e34', '2685aba2-53d3-4a15-8351-bdf65c6e0626', '2026-02-18', '2026-02-21', 2, 'Carol Adams', 'carol.a@email.com', 757.62, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer3, '71df6b23-06c0-42b0-bb55-692afe080e34', '2685aba2-53d3-4a15-8351-bdf65c6e0626', '2026-03-01', '2026-03-05', 3, 'Steven Baker', 'steven.b@email.com', 1010.16, 'USD', 'CONFIRMED', NOW(), NOW());

UPDATE room_types SET available_rooms = 12 WHERE id = '2685aba2-53d3-4a15-8351-bdf65c6e0626';

-- Standard Room (17b6ba6b-7ea8-4e35-b034-90b0b7c92360): 22 total, currently 15 available
-- Book 5 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer4, '71df6b23-06c0-42b0-bb55-692afe080e34', '17b6ba6b-7ea8-4e35-b034-90b0b7c92360', '2026-02-12', '2026-02-15', 3, 'Michelle Nelson', 'michelle.n@email.com', 448.82, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer5, '71df6b23-06c0-42b0-bb55-692afe080e34', '17b6ba6b-7ea8-4e35-b034-90b0b7c92360', '2026-02-20', '2026-02-24', 2, 'Paul Carter', 'paul.c@email.com', 598.76, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer1, '71df6b23-06c0-42b0-bb55-692afe080e34', '17b6ba6b-7ea8-4e35-b034-90b0b7c92360', '2026-03-08', '2026-03-11', 3, 'Laura Mitchell', 'laura.m@email.com', 448.82, 'USD', 'PENDING', NOW(), NOW());

UPDATE room_types SET available_rooms = 12 WHERE id = '17b6ba6b-7ea8-4e35-b034-90b0b7c92360';

-- Suite Room (46837f1f-ab1f-45d9-9010-0df57b7bcf08): 19 total, currently 13 available
-- Book 4 more rooms
INSERT INTO bookings (id, user_id, hotel_id, room_type_id, check_in_date, check_out_date, guest_count, guest_name, guest_email, total_price, currency, status, created_at, updated_at)
VALUES 
(UUID(), @customer2, '71df6b23-06c0-42b0-bb55-692afe080e34', '46837f1f-ab1f-45d9-9010-0df57b7bcf08', '2026-02-15', '2026-02-19', 4, 'Brian Perez', 'brian.p@email.com', 921.12, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer3, '71df6b23-06c0-42b0-bb55-692afe080e34', '46837f1f-ab1f-45d9-9010-0df57b7bcf08', '2026-02-25', '2026-02-28', 3, 'Dorothy Roberts', 'dorothy.r@email.com', 690.84, 'USD', 'CONFIRMED', NOW(), NOW()),
(UUID(), @customer4, '71df6b23-06c0-42b0-bb55-692afe080e34', '46837f1f-ab1f-45d9-9010-0df57b7bcf08', '2026-03-10', '2026-03-14', 4, 'Jason Turner', 'jason.t@email.com', 921.12, 'USD', 'CONFIRMED', NOW(), NOW());

UPDATE room_types SET available_rooms = 10 WHERE id = '46837f1f-ab1f-45d9-9010-0df57b7bcf08';

-- Summary of bookings created
SELECT 'Bookings Summary' as info;
SELECT 
    h.name as hotel_name,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_bookings,
    SUM(CASE WHEN b.status = 'PENDING' THEN 1 ELSE 0 END) as pending_bookings,
    SUM(b.total_price) as total_revenue
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
WHERE h.company_id = 'f6bd6cc3-ffca-11f0-af2e-32828caaaedb'
GROUP BY h.id, h.name
ORDER BY h.name;

-- Room availability summary
SELECT 'Room Availability Summary' as info;
SELECT 
    h.name as hotel_name,
    rt.name as room_type,
    rt.total_rooms,
    rt.available_rooms,
    (rt.total_rooms - rt.available_rooms) as booked_rooms,
    ROUND((rt.total_rooms - rt.available_rooms) / rt.total_rooms * 100, 2) as occupancy_rate
FROM room_types rt
JOIN hotels h ON rt.hotel_id = h.id
WHERE h.company_id = 'f6bd6cc3-ffca-11f0-af2e-32828caaaedb'
ORDER BY h.name, rt.name;
