-- Hotels for Agent-10
INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, country, latitude, longitude, star_rating, total_rooms, walking_time_to_haram, view_type, is_elderly_friendly, has_family_rooms, distance_to_haram_meters, gates_assigned, created_at, updated_at)
VALUES ('hotel-agent10-001', 'company-agent10', 'agent-10-id', 'Al-Noor Hotel', 'Comfortable hotel near Haram', 'ACTIVE', '123 Haram Street', 'Mecca', 'Saudi Arabia', 21.4243, 39.8259, 4, 50, 5, 'kaaba', 1, 1, 500, 0, NOW(), NOW());

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, country, latitude, longitude, star_rating, total_rooms, walking_time_to_haram, view_type, is_elderly_friendly, has_family_rooms, distance_to_haram_meters, gates_assigned, created_at, updated_at)
VALUES ('hotel-agent10-002', 'company-agent10', 'agent-10-id', 'Kaaba View Plaza', 'Premium hotel with Kaaba view', 'ACTIVE', '456 View Road', 'Mecca', 'Saudi Arabia', 21.4250, 39.8270, 5, 100, 8, 'partial_haram', 1, 1, 800, 0, NOW(), NOW());

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, country, latitude, longitude, star_rating, total_rooms, walking_time_to_haram, view_type, is_elderly_friendly, has_family_rooms, distance_to_haram_meters, gates_assigned, created_at, updated_at)
VALUES ('hotel-agent10-003', 'company-agent10', 'agent-10-id', 'Holy City Inn', 'Budget-friendly accommodation', 'ACTIVE', '789 City Lane', 'Mecca', 'Saudi Arabia', 21.4230, 39.8240, 3, 30, 12, 'city', 0, 1, 1200, 0, NOW(), NOW());

-- Room Types
INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h1-standard', 'hotel-agent10-001', 'Standard Room', 'Basic room with one bed', 1, 0, 1, 0, 20, 20, 150.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h1-deluxe', 'hotel-agent10-001', 'Deluxe Room', 'Spacious room with two beds', 2, 1, 2, 1, 20, 20, 250.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h1-family', 'hotel-agent10-001', 'Family Suite', 'Large suite for families', 4, 1, 2, 2, 10, 10, 400.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h2-standard', 'hotel-agent10-002', 'Standard Room', 'Standard room', 1, 0, 1, 0, 50, 50, 200.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h2-premium', 'hotel-agent10-002', 'Premium Suite', 'Premium suite with view', 2, 1, 2, 1, 40, 40, 350.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h2-penthouse', 'hotel-agent10-002', 'Penthouse', 'Luxury penthouse', 4, 1, 2, 2, 10, 10, 600.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h3-basic', 'hotel-agent10-003', 'Basic Room', 'Simple comfortable room', 1, 0, 1, 0, 15, 15, 100.00, 'USD', 'ACTIVE', NOW(), NOW());

INSERT INTO room_types (id, hotel_id, name, description, capacity, is_family_room, max_adults, max_children, total_rooms, available_rooms, base_price, currency, status, created_at, updated_at)
VALUES ('room-h3-double', 'hotel-agent10-003', 'Double Room', 'Room with double bed', 2, 1, 2, 1, 15, 15, 150.00, 'USD', 'ACTIVE', NOW(), NOW());

-- Gate Assignments
INSERT INTO hotel_gate_assignments (id, hotel_id, closest_gate_id, kaaba_gate_id, created_at, updated_at)
VALUES ('hga-001', 'hotel-agent10-001', 'gate-001', 'gate-001', NOW(), NOW());

INSERT INTO hotel_gate_assignments (id, hotel_id, closest_gate_id, kaaba_gate_id, created_at, updated_at)
VALUES ('hga-002', 'hotel-agent10-002', 'gate-002', 'gate-001', NOW(), NOW());

INSERT INTO hotel_gate_assignments (id, hotel_id, closest_gate_id, kaaba_gate_id, created_at, updated_at)
VALUES ('hga-003', 'hotel-agent10-003', 'gate-003', 'gate-002', NOW(), NOW());
