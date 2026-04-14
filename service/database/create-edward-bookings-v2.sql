-- Create bookings for Edward Sanchez's hotels
-- Using the correct bookings table structure

-- Get some customer IDs for bookings
SET @customer1 = (SELECT id FROM users WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 0);
SET @customer2 = (SELECT id FROM users WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 1);
SET @customer3 = (SELECT id FROM users WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 2);
SET @customer4 = (SELECT id FROM users WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 3);
SET @customer5 = (SELECT id FROM users WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 4);

-- Get Edward's company ID
SET @company_id = 'f6bd6cc3-ffca-11f0-af2e-32828caaaedb';

-- Harbor Inn Dubai (3a32cf03-a8dd-4b2b-8517-0dcc8fc68047)
-- Deluxe Room: Book 5 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer1, 'HOTEL', 'CONFIRMED', 'USD', 1153.45, 115.35, 1268.80, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', 'room_name', 'Deluxe Room', 'check_in', '2026-02-10', 'check_out', '2026-02-15', 'guest_count', 2, 'guest_name', 'John Smith', 'guest_email', 'john.smith@email.com', 'nights', 5), NOW(), NOW()),
(UUID(), @company_id, @customer2, 'HOTEL', 'CONFIRMED', 'USD', 461.38, 46.14, 507.52, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', 'room_name', 'Deluxe Room', 'check_in', '2026-02-12', 'check_out', '2026-02-14', 'guest_count', 3, 'guest_name', 'Sarah Johnson', 'guest_email', 'sarah.j@email.com', 'nights', 2), NOW(), NOW()),
(UUID(), @company_id, @customer3, 'HOTEL', 'CONFIRMED', 'USD', 1153.45, 115.35, 1268.80, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', 'room_name', 'Deluxe Room', 'check_in', '2026-02-20', 'check_out', '2026-02-25', 'guest_count', 2, 'guest_name', 'Mike Brown', 'guest_email', 'mike.b@email.com', 'nights', 5), NOW(), NOW()),
(UUID(), @company_id, @customer4, 'HOTEL', 'PENDING', 'USD', 461.38, 46.14, 507.52, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', 'room_name', 'Deluxe Room', 'check_in', '2026-03-01', 'check_out', '2026-03-03', 'guest_count', 3, 'guest_name', 'Emily Davis', 'guest_email', 'emily.d@email.com', 'nights', 2), NOW(), NOW()),
(UUID(), @company_id, @customer5, 'HOTEL', 'CONFIRMED', 'USD', 461.38, 46.14, 507.52, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e', 'room_name', 'Deluxe Room', 'check_in', '2026-03-10', 'check_out', '2026-03-12', 'guest_count', 2, 'guest_name', 'David Wilson', 'guest_email', 'david.w@email.com', 'nights', 2), NOW(), NOW());

-- Update available rooms for Deluxe Room
UPDATE room_types SET available_rooms = 10 WHERE id = '9fcb95ba-7d3d-43dc-8960-dc7f080dbc5e';

-- Standard Room: Book 2 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer1, 'HOTEL', 'CONFIRMED', 'USD', 713.34, 71.33, 784.67, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', 'c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f', 'room_name', 'Standard Room', 'check_in', '2026-02-15', 'check_out', '2026-02-18', 'guest_count', 2, 'guest_name', 'Lisa Anderson', 'guest_email', 'lisa.a@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer2, 'HOTEL', 'CONFIRMED', 'USD', 475.56, 47.56, 523.12, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', 'c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f', 'room_name', 'Standard Room', 'check_in', '2026-02-20', 'check_out', '2026-02-22', 'guest_count', 3, 'guest_name', 'Tom Martinez', 'guest_email', 'tom.m@email.com', 'nights', 2), NOW(), NOW());

UPDATE room_types SET available_rooms = 5 WHERE id = 'c0a3c61a-1d0f-4a2a-aa9b-dd90cb96227f';

-- Suite Room: Book 1 room
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer3, 'HOTEL', 'CONFIRMED', 'USD', 1364.52, 136.45, 1500.97, JSON_OBJECT('hotel_id', '3a32cf03-a8dd-4b2b-8517-0dcc8fc68047', 'room_type_id', '3f2679da-87be-439c-b92a-8144dd0ddf44', 'room_name', 'Suite Room', 'check_in', '2026-02-25', 'check_out', '2026-03-01', 'guest_count', 4, 'guest_name', 'Jennifer Lee', 'guest_email', 'jennifer.l@email.com', 'nights', 6), NOW(), NOW());

UPDATE room_types SET available_rooms = 4 WHERE id = '3f2679da-87be-439c-b92a-8144dd0ddf44';

-- Vista Inn Dubai (4cea05bd-9212-49af-9b6f-f7d29aa0a1b6)
-- Deluxe Room: Book 3 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer4, 'HOTEL', 'CONFIRMED', 'USD', 958.24, 95.82, 1054.06, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', '612cf0e9-35a6-40a2-9609-1cb426f72a78', 'room_name', 'Deluxe Room', 'check_in', '2026-02-10', 'check_out', '2026-02-14', 'guest_count', 3, 'guest_name', 'Robert Taylor', 'guest_email', 'robert.t@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer5, 'HOTEL', 'CONFIRMED', 'USD', 479.12, 47.91, 527.03, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', '612cf0e9-35a6-40a2-9609-1cb426f72a78', 'room_name', 'Deluxe Room', 'check_in', '2026-02-18', 'check_out', '2026-02-20', 'guest_count', 2, 'guest_name', 'Maria Garcia', 'guest_email', 'maria.g@email.com', 'nights', 2), NOW(), NOW()),
(UUID(), @company_id, @customer1, 'HOTEL', 'PENDING', 'USD', 718.68, 71.87, 790.55, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', '612cf0e9-35a6-40a2-9609-1cb426f72a78', 'room_name', 'Deluxe Room', 'check_in', '2026-03-05', 'check_out', '2026-03-08', 'guest_count', 3, 'guest_name', 'James White', 'guest_email', 'james.w@email.com', 'nights', 3), NOW(), NOW());

UPDATE room_types SET available_rooms = 6 WHERE id = '612cf0e9-35a6-40a2-9609-1cb426f72a78';

-- Standard Room: Book 3 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer2, 'HOTEL', 'CONFIRMED', 'USD', 1196.40, 119.64, 1316.04, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', '9dbdf157-78be-46d6-8801-3ff7989c4432', 'room_name', 'Standard Room', 'check_in', '2026-02-12', 'check_out', '2026-02-16', 'guest_count', 4, 'guest_name', 'Patricia Moore', 'guest_email', 'patricia.m@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer3, 'HOTEL', 'CONFIRMED', 'USD', 897.30, 89.73, 987.03, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', '9dbdf157-78be-46d6-8801-3ff7989c4432', 'room_name', 'Standard Room', 'check_in', '2026-02-20', 'check_out', '2026-02-23', 'guest_count', 2, 'guest_name', 'Christopher Hall', 'guest_email', 'chris.h@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer4, 'HOTEL', 'CONFIRMED', 'USD', 897.30, 89.73, 987.03, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', '9dbdf157-78be-46d6-8801-3ff7989c4432', 'room_name', 'Standard Room', 'check_in', '2026-03-01', 'check_out', '2026-03-04', 'guest_count', 4, 'guest_name', 'Linda Allen', 'guest_email', 'linda.a@email.com', 'nights', 3), NOW(), NOW());

UPDATE room_types SET available_rooms = 11 WHERE id = '9dbdf157-78be-46d6-8801-3ff7989c4432';

-- Suite Room: Book 2 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer5, 'HOTEL', 'CONFIRMED', 'USD', 1265.52, 126.55, 1392.07, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', 'bf77767f-6a01-4f52-924e-13a579b60655', 'room_name', 'Suite Room', 'check_in', '2026-02-15', 'check_out', '2026-02-19', 'guest_count', 3, 'guest_name', 'Daniel Young', 'guest_email', 'daniel.y@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer1, 'HOTEL', 'PENDING', 'USD', 949.14, 94.91, 1044.05, JSON_OBJECT('hotel_id', '4cea05bd-9212-49af-9b6f-f7d29aa0a1b6', 'room_type_id', 'bf77767f-6a01-4f52-924e-13a579b60655', 'room_name', 'Suite Room', 'check_in', '2026-03-10', 'check_out', '2026-03-13', 'guest_count', 2, 'guest_name', 'Nancy King', 'guest_email', 'nancy.k@email.com', 'nights', 3), NOW(), NOW());

UPDATE room_types SET available_rooms = 2 WHERE id = 'bf77767f-6a01-4f52-924e-13a579b60655';

-- Harbor Inn Dubai - Second location (71df6b23-06c0-42b0-bb55-692afe080e34)
-- Deluxe Room: Book 4 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer2, 'HOTEL', 'CONFIRMED', 'USD', 1051.36, 105.14, 1156.50, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', 'room_name', 'Deluxe Room', 'check_in', '2026-02-08', 'check_out', '2026-02-12', 'guest_count', 4, 'guest_name', 'Kevin Wright', 'guest_email', 'kevin.w@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer3, 'HOTEL', 'CONFIRMED', 'USD', 788.52, 78.85, 867.37, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', 'room_name', 'Deluxe Room', 'check_in', '2026-02-14', 'check_out', '2026-02-17', 'guest_count', 3, 'guest_name', 'Betty Lopez', 'guest_email', 'betty.l@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer4, 'HOTEL', 'CONFIRMED', 'USD', 1051.36, 105.14, 1156.50, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', 'room_name', 'Deluxe Room', 'check_in', '2026-02-22', 'check_out', '2026-02-26', 'guest_count', 4, 'guest_name', 'George Hill', 'guest_email', 'george.h@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer5, 'HOTEL', 'PENDING', 'USD', 525.68, 52.57, 578.25, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70', 'room_name', 'Deluxe Room', 'check_in', '2026-03-05', 'check_out', '2026-03-07', 'guest_count', 2, 'guest_name', 'Sandra Scott', 'guest_email', 'sandra.s@email.com', 'nights', 2), NOW(), NOW());

UPDATE room_types SET available_rooms = 12 WHERE id = 'd5fb9cc4-f831-4b33-aed9-0fc49e6f5b70';

-- Executive Room: Book 3 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer1, 'HOTEL', 'CONFIRMED', 'USD', 757.62, 75.76, 833.38, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '2685aba2-53d3-4a15-8351-bdf65c6e0626', 'room_name', 'Executive Room', 'check_in', '2026-02-10', 'check_out', '2026-02-13', 'guest_count', 3, 'guest_name', 'Donald Green', 'guest_email', 'donald.g@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer2, 'HOTEL', 'CONFIRMED', 'USD', 757.62, 75.76, 833.38, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '2685aba2-53d3-4a15-8351-bdf65c6e0626', 'room_name', 'Executive Room', 'check_in', '2026-02-18', 'check_out', '2026-02-21', 'guest_count', 2, 'guest_name', 'Carol Adams', 'guest_email', 'carol.a@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer3, 'HOTEL', 'CONFIRMED', 'USD', 1010.16, 101.02, 1111.18, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '2685aba2-53d3-4a15-8351-bdf65c6e0626', 'room_name', 'Executive Room', 'check_in', '2026-03-01', 'check_out', '2026-03-05', 'guest_count', 3, 'guest_name', 'Steven Baker', 'guest_email', 'steven.b@email.com', 'nights', 4), NOW(), NOW());

UPDATE room_types SET available_rooms = 12 WHERE id = '2685aba2-53d3-4a15-8351-bdf65c6e0626';

-- Standard Room: Book 3 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer4, 'HOTEL', 'CONFIRMED', 'USD', 448.82, 44.88, 493.70, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '17b6ba6b-7ea8-4e35-b034-90b0b7c92360', 'room_name', 'Standard Room', 'check_in', '2026-02-12', 'check_out', '2026-02-15', 'guest_count', 3, 'guest_name', 'Michelle Nelson', 'guest_email', 'michelle.n@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer5, 'HOTEL', 'CONFIRMED', 'USD', 598.76, 59.88, 658.64, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '17b6ba6b-7ea8-4e35-b034-90b0b7c92360', 'room_name', 'Standard Room', 'check_in', '2026-02-20', 'check_out', '2026-02-24', 'guest_count', 2, 'guest_name', 'Paul Carter', 'guest_email', 'paul.c@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer1, 'HOTEL', 'PENDING', 'USD', 448.82, 44.88, 493.70, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '17b6ba6b-7ea8-4e35-b034-90b0b7c92360', 'room_name', 'Standard Room', 'check_in', '2026-03-08', 'check_out', '2026-03-11', 'guest_count', 3, 'guest_name', 'Laura Mitchell', 'guest_email', 'laura.m@email.com', 'nights', 3), NOW(), NOW());

UPDATE room_types SET available_rooms = 12 WHERE id = '17b6ba6b-7ea8-4e35-b034-90b0b7c92360';

-- Suite Room: Book 3 rooms
INSERT INTO bookings (id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata, created_at, updated_at)
VALUES 
(UUID(), @company_id, @customer2, 'HOTEL', 'CONFIRMED', 'USD', 921.12, 92.11, 1013.23, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '46837f1f-ab1f-45d9-9010-0df57b7bcf08', 'room_name', 'Suite Room', 'check_in', '2026-02-15', 'check_out', '2026-02-19', 'guest_count', 4, 'guest_name', 'Brian Perez', 'guest_email', 'brian.p@email.com', 'nights', 4), NOW(), NOW()),
(UUID(), @company_id, @customer3, 'HOTEL', 'CONFIRMED', 'USD', 690.84, 69.08, 759.92, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '46837f1f-ab1f-45d9-9010-0df57b7bcf08', 'room_name', 'Suite Room', 'check_in', '2026-02-25', 'check_out', '2026-02-28', 'guest_count', 3, 'guest_name', 'Dorothy Roberts', 'guest_email', 'dorothy.r@email.com', 'nights', 3), NOW(), NOW()),
(UUID(), @company_id, @customer4, 'HOTEL', 'CONFIRMED', 'USD', 921.12, 92.11, 1013.23, JSON_OBJECT('hotel_id', '71df6b23-06c0-42b0-bb55-692afe080e34', 'room_type_id', '46837f1f-ab1f-45d9-9010-0df57b7bcf08', 'room_name', 'Suite Room', 'check_in', '2026-03-10', 'check_out', '2026-03-14', 'guest_count', 4, 'guest_name', 'Jason Turner', 'guest_email', 'jason.t@email.com', 'nights', 4), NOW(), NOW());

UPDATE room_types SET available_rooms = 10 WHERE id = '46837f1f-ab1f-45d9-9010-0df57b7bcf08';

-- Display summary
SELECT '=== BOOKINGS CREATED SUCCESSFULLY ===' as status;

SELECT 
    h.name as hotel_name,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
    SUM(CASE WHEN b.status = 'PENDING' THEN 1 ELSE 0 END) as pending,
    CONCAT('$', FORMAT(SUM(b.total), 2)) as total_revenue
FROM bookings b
JOIN hotels h ON JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotel_id')) = h.id
WHERE b.company_id = @company_id
GROUP BY h.id, h.name
ORDER BY h.name;

SELECT '=== ROOM AVAILABILITY UPDATED ===' as status;

SELECT 
    h.name as hotel_name,
    rt.name as room_type,
    rt.total_rooms,
    rt.available_rooms,
    (rt.total_rooms - rt.available_rooms) as booked,
    CONCAT(ROUND((rt.total_rooms - rt.available_rooms) / rt.total_rooms * 100, 1), '%') as occupancy
FROM room_types rt
JOIN hotels h ON rt.hotel_id = h.id
WHERE h.company_id = @company_id
ORDER BY h.name, rt.name;
