-- Seed: Saudi Arabia hotels outside Makkah (Kaaba area)
-- Cities: Madinah, Jeddah, Riyadh, Taif, Dammam, Al Khobar, Abha, Tabuk

-- Using existing company and agent IDs
-- company: 12c46044-fe37-45c1-a242-4f7950c91e30
-- company: 3a383302-3978-4ed6-adff-4fec1b1fa16b
-- agent: 04a7cca9-3004-469b-ac66-bd73ab7820c7
-- agent: 1b224fbb-5d9e-42a0-92f3-6d207989010f
-- agent: 1c233597-f24d-4cec-8b55-8e991aa378eb
-- agent: 309090e2-2d97-4239-a052-2b091b494baa

-- ============================================
-- MADINAH HOTELS (near Masjid an-Nabawi)
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-med-001', '12c46044-fe37-45c1-a242-4f7950c91e30', '04a7cca9-3004-469b-ac66-bd73ab7820c7', 'Dar Al Taqwa Hotel', 'Premium hotel directly facing Masjid an-Nabawi. Walking distance to the Prophet''s Mosque with panoramic views from upper floors. Ideal for Umrah and Hajj pilgrims visiting Madinah.', 'ACTIVE', 'King Faisal Road, Central Area', 'Madinah', 'Madinah Province', 'Saudi Arabia', '42311', 24.4686, 39.6112, 5, 300, '14:00', '12:00', 4.7, 89, NOW(), NOW()),

('hotel-sa-med-002', '12c46044-fe37-45c1-a242-4f7950c91e30', '04a7cca9-3004-469b-ac66-bd73ab7820c7', 'Anwar Al Madinah Mövenpick', 'Luxury hotel steps from the Prophet''s Mosque. Features elegant rooms, multiple dining options, and a rooftop lounge with views of the Green Dome.', 'ACTIVE', 'Al Masjid an Nabawi Road', 'Madinah', 'Madinah Province', 'Saudi Arabia', '42311', 24.4672, 39.6125, 5, 250, '15:00', '12:00', 4.6, 156, NOW(), NOW()),

('hotel-sa-med-003', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '1b224fbb-5d9e-42a0-92f3-6d207989010f', 'Shaza Al Madina', 'Boutique luxury hotel blending Arabian heritage with modern comfort. Located in the heart of Madinah with easy access to the Prophet''s Mosque and historical sites.', 'ACTIVE', 'Al Haram District', 'Madinah', 'Madinah Province', 'Saudi Arabia', '42311', 24.4695, 39.6098, 5, 150, '14:00', '12:00', 4.8, 72, NOW(), NOW()),

('hotel-sa-med-004', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '1b224fbb-5d9e-42a0-92f3-6d207989010f', 'Al Noor Palace Hotel', 'Comfortable mid-range hotel offering clean rooms and warm hospitality. A 10-minute walk to Masjid an-Nabawi with shuttle service available.', 'ACTIVE', 'Abu Bakr As Siddiq Road', 'Madinah', 'Madinah Province', 'Saudi Arabia', '42351', 24.4710, 39.6050, 3, 120, '14:00', '11:00', 4.2, 45, NOW(), NOW());

-- Room types for Madinah hotels
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-med-001-std', 'hotel-sa-med-001', 'Standard Room', 'Comfortable room with city view', 2, 150, 120, 180.00, 'USD', 'ACTIVE'),
('rt-sa-med-001-dlx', 'hotel-sa-med-001', 'Deluxe Haram View', 'Spacious room with direct Haram view', 2, 80, 60, 350.00, 'USD', 'ACTIVE'),
('rt-sa-med-001-ste', 'hotel-sa-med-001', 'Royal Suite', 'Luxurious suite with living area and Haram view', 4, 20, 15, 650.00, 'USD', 'ACTIVE'),
('rt-sa-med-002-std', 'hotel-sa-med-002', 'Classic Room', 'Well-appointed room with modern amenities', 2, 120, 95, 200.00, 'USD', 'ACTIVE'),
('rt-sa-med-002-sup', 'hotel-sa-med-002', 'Superior Room', 'Upgraded room with mosque view', 2, 80, 65, 320.00, 'USD', 'ACTIVE'),
('rt-sa-med-003-std', 'hotel-sa-med-003', 'Heritage Room', 'Arabian-themed room with luxury finishes', 2, 80, 60, 280.00, 'USD', 'ACTIVE'),
('rt-sa-med-003-ste', 'hotel-sa-med-003', 'Heritage Suite', 'Spacious suite with traditional Arabian decor', 4, 30, 22, 520.00, 'USD', 'ACTIVE'),
('rt-sa-med-004-std', 'hotel-sa-med-004', 'Standard Room', 'Clean and comfortable room', 2, 80, 70, 85.00, 'USD', 'ACTIVE'),
('rt-sa-med-004-fam', 'hotel-sa-med-004', 'Family Room', 'Spacious room for families', 4, 40, 35, 130.00, 'USD', 'ACTIVE');

-- ============================================
-- JEDDAH HOTELS
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-jed-001', '12c46044-fe37-45c1-a242-4f7950c91e30', '1c233597-f24d-4cec-8b55-8e991aa378eb', 'Rosewood Jeddah', 'Ultra-luxury waterfront hotel on the Corniche. Features world-class dining, a private beach, and stunning Red Sea views. Perfect stopover before Umrah.', 'ACTIVE', 'Al Corniche Road, Al Hamra District', 'Jeddah', 'Makkah Province', 'Saudi Arabia', '21452', 21.5433, 39.1728, 5, 200, '15:00', '12:00', 4.9, 210, NOW(), NOW()),

('hotel-sa-jed-002', '12c46044-fe37-45c1-a242-4f7950c91e30', '1c233597-f24d-4cec-8b55-8e991aa378eb', 'Park Hyatt Jeddah', 'Elegant beachfront resort with marina views. Offers luxury spa, infinity pool, and fine dining. Convenient access to King Abdulaziz International Airport.', 'ACTIVE', 'Marina District, North Corniche', 'Jeddah', 'Makkah Province', 'Saudi Arabia', '21452', 21.5890, 39.1065, 5, 180, '15:00', '12:00', 4.7, 178, NOW(), NOW()),

('hotel-sa-jed-003', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '309090e2-2d97-4239-a052-2b091b494baa', 'Jeddah Hilton', 'Modern business hotel in the heart of Jeddah. Close to Al Balad historic district and major shopping centers. Rooftop pool with city views.', 'ACTIVE', 'Al Medinah Road, Al Andalus', 'Jeddah', 'Makkah Province', 'Saudi Arabia', '21422', 21.5169, 39.1884, 4, 280, '14:00', '12:00', 4.4, 320, NOW(), NOW()),

('hotel-sa-jed-004', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '309090e2-2d97-4239-a052-2b091b494baa', 'Al Balad Heritage Inn', 'Charming boutique hotel in Jeddah''s UNESCO World Heritage historic district. Traditional Hejazi architecture with modern comforts. Walking distance to souks and coral houses.', 'ACTIVE', 'Al Balad Historic District', 'Jeddah', 'Makkah Province', 'Saudi Arabia', '21411', 21.4858, 39.1862, 3, 45, '14:00', '11:00', 4.5, 67, NOW(), NOW());

-- Room types for Jeddah hotels
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-jed-001-std', 'hotel-sa-jed-001', 'Sea View Room', 'Elegant room with Red Sea panorama', 2, 100, 80, 420.00, 'USD', 'ACTIVE'),
('rt-sa-jed-001-ste', 'hotel-sa-jed-001', 'Corniche Suite', 'Luxury suite with private balcony', 3, 40, 30, 780.00, 'USD', 'ACTIVE'),
('rt-sa-jed-002-std', 'hotel-sa-jed-002', 'Marina Room', 'Modern room overlooking the marina', 2, 90, 75, 380.00, 'USD', 'ACTIVE'),
('rt-sa-jed-002-dlx', 'hotel-sa-jed-002', 'Beach Villa', 'Private villa with direct beach access', 4, 20, 15, 950.00, 'USD', 'ACTIVE'),
('rt-sa-jed-003-std', 'hotel-sa-jed-003', 'Business Room', 'Well-equipped room for business travelers', 2, 180, 150, 160.00, 'USD', 'ACTIVE'),
('rt-sa-jed-003-exe', 'hotel-sa-jed-003', 'Executive Suite', 'Spacious suite with lounge access', 2, 50, 40, 290.00, 'USD', 'ACTIVE'),
('rt-sa-jed-004-std', 'hotel-sa-jed-004', 'Heritage Room', 'Traditional room with Hejazi touches', 2, 25, 20, 120.00, 'USD', 'ACTIVE'),
('rt-sa-jed-004-ste', 'hotel-sa-jed-004', 'Rooftop Suite', 'Suite with rooftop terrace and old town views', 2, 10, 8, 220.00, 'USD', 'ACTIVE');

-- ============================================
-- RIYADH HOTELS
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-riy-001', '12c46044-fe37-45c1-a242-4f7950c91e30', '04a7cca9-3004-469b-ac66-bd73ab7820c7', 'The Ritz-Carlton Riyadh', 'Iconic palace hotel set in lush gardens. Features opulent rooms, world-class spa, and multiple award-winning restaurants. A landmark of Saudi hospitality.', 'ACTIVE', 'Al Hada Area, Mekkah Road', 'Riyadh', 'Riyadh Province', 'Saudi Arabia', '11493', 24.6901, 46.6850, 5, 490, '15:00', '12:00', 4.8, 445, NOW(), NOW()),

('hotel-sa-riy-002', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '1b224fbb-5d9e-42a0-92f3-6d207989010f', 'Four Seasons Riyadh', 'Contemporary luxury in the Kingdom Tower. Stunning views from every room, exceptional dining, and direct access to Kingdom Centre Mall.', 'ACTIVE', 'Kingdom Centre, King Fahd Road', 'Riyadh', 'Riyadh Province', 'Saudi Arabia', '11321', 24.7114, 46.6744, 5, 260, '15:00', '12:00', 4.7, 312, NOW(), NOW()),

('hotel-sa-riy-003', '12c46044-fe37-45c1-a242-4f7950c91e30', '1c233597-f24d-4cec-8b55-8e991aa378eb', 'Narcissus Hotel Riyadh', 'Modern 4-star hotel in the Olaya business district. Excellent value with spacious rooms, gym, and rooftop dining. Close to major attractions.', 'ACTIVE', 'Olaya Street, Al Olaya District', 'Riyadh', 'Riyadh Province', 'Saudi Arabia', '11433', 24.6936, 46.6853, 4, 200, '14:00', '12:00', 4.3, 198, NOW(), NOW());

-- Room types for Riyadh hotels
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-riy-001-std', 'hotel-sa-riy-001', 'Palace Room', 'Elegantly furnished room with garden view', 2, 250, 200, 450.00, 'USD', 'ACTIVE'),
('rt-sa-riy-001-ste', 'hotel-sa-riy-001', 'Royal Suite', 'Palatial suite with butler service', 4, 40, 30, 1200.00, 'USD', 'ACTIVE'),
('rt-sa-riy-002-std', 'hotel-sa-riy-002', 'Kingdom Room', 'Modern room with city skyline views', 2, 150, 120, 380.00, 'USD', 'ACTIVE'),
('rt-sa-riy-002-ste', 'hotel-sa-riy-002', 'Sky Suite', 'Corner suite with panoramic views', 3, 30, 22, 850.00, 'USD', 'ACTIVE'),
('rt-sa-riy-003-std', 'hotel-sa-riy-003', 'Business Room', 'Comfortable room for business stays', 2, 120, 100, 140.00, 'USD', 'ACTIVE'),
('rt-sa-riy-003-dlx', 'hotel-sa-riy-003', 'Deluxe Room', 'Upgraded room with lounge access', 2, 50, 40, 210.00, 'USD', 'ACTIVE');

-- ============================================
-- TAIF HOTELS (Mountain city, summer capital)
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-taf-001', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '309090e2-2d97-4239-a052-2b091b494baa', 'Awaliv Suites Taif', 'Mountain retreat hotel surrounded by rose gardens. Cool climate year-round with stunning views of the Hejaz Mountains. Popular post-Umrah relaxation destination.', 'ACTIVE', 'Al Hada Mountain Road', 'Taif', 'Makkah Province', 'Saudi Arabia', '26571', 21.3547, 40.3400, 4, 100, '14:00', '12:00', 4.5, 88, NOW(), NOW()),

('hotel-sa-taf-002', '12c46044-fe37-45c1-a242-4f7950c91e30', '04a7cca9-3004-469b-ac66-bd73ab7820c7', 'Rose Garden Resort Taif', 'Charming resort nestled among Taif''s famous rose farms. Features outdoor terraces, traditional Saudi cuisine, and guided tours of local rose distilleries.', 'ACTIVE', 'Al Shafa District', 'Taif', 'Makkah Province', 'Saudi Arabia', '26514', 21.0833, 40.3167, 3, 60, '14:00', '11:00', 4.3, 52, NOW(), NOW());

-- Room types for Taif hotels
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-taf-001-std', 'hotel-sa-taf-001', 'Mountain View Room', 'Room with panoramic mountain views', 2, 60, 50, 150.00, 'USD', 'ACTIVE'),
('rt-sa-taf-001-ste', 'hotel-sa-taf-001', 'Garden Suite', 'Suite overlooking the rose gardens', 3, 20, 16, 280.00, 'USD', 'ACTIVE'),
('rt-sa-taf-002-std', 'hotel-sa-taf-002', 'Rose Room', 'Cozy room with garden access', 2, 35, 30, 95.00, 'USD', 'ACTIVE'),
('rt-sa-taf-002-fam', 'hotel-sa-taf-002', 'Family Chalet', 'Private chalet for families', 5, 15, 12, 180.00, 'USD', 'ACTIVE');

-- ============================================
-- DAMMAM / AL KHOBAR HOTELS (Eastern Province)
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-dam-001', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '1b224fbb-5d9e-42a0-92f3-6d207989010f', 'Sheraton Dammam Hotel', 'Waterfront hotel on the Arabian Gulf coast. Features a private beach, outdoor pool, and proximity to King Fahd Causeway connecting to Bahrain.', 'ACTIVE', 'First Street, Corniche', 'Dammam', 'Eastern Province', 'Saudi Arabia', '31411', 26.4207, 50.0888, 5, 220, '15:00', '12:00', 4.4, 267, NOW(), NOW()),

('hotel-sa-kho-001', '12c46044-fe37-45c1-a242-4f7950c91e30', '1c233597-f24d-4cec-8b55-8e991aa378eb', 'Sofitel Al Khobar Corniche', 'French-inspired luxury on the Al Khobar waterfront. Elegant rooms, gourmet dining, and a stunning infinity pool overlooking the Gulf.', 'ACTIVE', 'Corniche Road, Al Khobar', 'Al Khobar', 'Eastern Province', 'Saudi Arabia', '31952', 26.2794, 50.2083, 5, 160, '15:00', '12:00', 4.6, 189, NOW(), NOW());

-- Room types for Eastern Province hotels
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-dam-001-std', 'hotel-sa-dam-001', 'Gulf View Room', 'Room with Arabian Gulf views', 2, 120, 100, 200.00, 'USD', 'ACTIVE'),
('rt-sa-dam-001-ste', 'hotel-sa-dam-001', 'Beach Suite', 'Suite with private beach access', 3, 30, 25, 420.00, 'USD', 'ACTIVE'),
('rt-sa-kho-001-std', 'hotel-sa-kho-001', 'Corniche Room', 'Stylish room with waterfront view', 2, 90, 75, 250.00, 'USD', 'ACTIVE'),
('rt-sa-kho-001-ste', 'hotel-sa-kho-001', 'Prestige Suite', 'Luxury suite with panoramic Gulf views', 3, 25, 20, 550.00, 'USD', 'ACTIVE');

-- ============================================
-- ABHA HOTELS (Southern highlands)
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-abh-001', '3a383302-3978-4ed6-adff-4fec1b1fa16b', '309090e2-2d97-4239-a052-2b091b494baa', 'Abha Palace Hotel', 'Highland hotel perched in the Asir Mountains. Cool temperatures, misty mornings, and breathtaking views. Features traditional Asiri architecture and local cuisine.', 'ACTIVE', 'Al Manhal District', 'Abha', 'Asir Province', 'Saudi Arabia', '61411', 18.2164, 42.5053, 4, 140, '14:00', '12:00', 4.4, 95, NOW(), NOW());

-- Room types for Abha
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-abh-001-std', 'hotel-sa-abh-001', 'Highland Room', 'Room with mountain and valley views', 2, 80, 65, 120.00, 'USD', 'ACTIVE'),
('rt-sa-abh-001-ste', 'hotel-sa-abh-001', 'Mountain Lodge Suite', 'Spacious suite with fireplace and terrace', 4, 25, 20, 250.00, 'USD', 'ACTIVE');

-- ============================================
-- TABUK HOTELS (Northwestern gateway to NEOM)
-- ============================================

INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, average_rating, total_reviews, created_at, updated_at)
VALUES
('hotel-sa-tab-001', '12c46044-fe37-45c1-a242-4f7950c91e30', '04a7cca9-3004-469b-ac66-bd73ab7820c7', 'Hilton Garden Inn Tabuk', 'Modern hotel in the gateway to NEOM and AlUla. Clean, comfortable rooms with excellent service. Close to Tabuk Castle and local markets.', 'ACTIVE', 'Prince Fahd Bin Sultan Road', 'Tabuk', 'Tabuk Province', 'Saudi Arabia', '71411', 28.3838, 36.5550, 4, 150, '14:00', '12:00', 4.2, 134, NOW(), NOW());

-- Room types for Tabuk
INSERT INTO room_types (id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status)
VALUES
('rt-sa-tab-001-std', 'hotel-sa-tab-001', 'Garden Room', 'Comfortable room with garden view', 2, 90, 80, 110.00, 'USD', 'ACTIVE'),
('rt-sa-tab-001-dlx', 'hotel-sa-tab-001', 'Deluxe Room', 'Upgraded room with workspace', 2, 40, 35, 170.00, 'USD', 'ACTIVE');
