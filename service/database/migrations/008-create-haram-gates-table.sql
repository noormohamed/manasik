-- Haram Gates table for Masjid al-Haram in Makkah
CREATE TABLE IF NOT EXISTS haram_gates (
    id VARCHAR(36) PRIMARY KEY,
    gate_number INT NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Nearby Attractions table
CREATE TABLE IF NOT EXISTS nearby_attractions (
    id VARCHAR(36) PRIMARY KEY,
    name_english VARCHAR(150) NOT NULL,
    name_arabic VARCHAR(150),
    category ENUM('religious', 'historical', 'shopping', 'transport', 'food', 'medical', 'other') NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hotel to Gates distance cache (optional, for performance)
CREATE TABLE IF NOT EXISTS hotel_gate_distances (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    gate_id VARCHAR(36) NOT NULL,
    distance_meters INT NOT NULL,
    walking_time_minutes INT,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_hotel_gate (hotel_id, gate_id),
    INDEX idx_hotel_gate_hotel (hotel_id),
    INDEX idx_hotel_gate_gate (gate_id)
);

-- Hotel to Attractions distance cache
CREATE TABLE IF NOT EXISTS hotel_attraction_distances (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    attraction_id VARCHAR(36) NOT NULL,
    distance_meters INT NOT NULL,
    walking_time_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_hotel_attraction (hotel_id, attraction_id),
    INDEX idx_hotel_attraction_hotel (hotel_id),
    INDEX idx_hotel_attraction_attraction (attraction_id)
);

-- Seed Haram Gates (approximate coordinates for major gates)
INSERT INTO haram_gates (id, gate_number, name_english, name_arabic, latitude, longitude, description) VALUES
('gate-001', 1, 'King Abdul Aziz Gate', 'باب الملك عبدالعزيز', 21.4225, 39.8262, 'Main entrance, also known as Gate 1'),
('gate-002', 5, 'King Fahd Gate', 'باب الملك فهد', 21.4230, 39.8268, 'Northern entrance'),
('gate-003', 11, 'Umrah Gate', 'باب العمرة', 21.4218, 39.8255, 'Western entrance for Umrah pilgrims'),
('gate-004', 17, 'Al-Fatah Gate', 'باب الفتح', 21.4235, 39.8275, 'Eastern entrance'),
('gate-005', 25, 'Al-Salam Gate', 'باب السلام', 21.4212, 39.8260, 'Peace Gate - southern entrance'),
('gate-006', 45, 'King Abdullah Gate', 'باب الملك عبدالله', 21.4240, 39.8280, 'Expansion area entrance'),
('gate-007', 62, 'Al-Marwah Gate', 'باب المروة', 21.4228, 39.8285, 'Near Marwah hill'),
('gate-008', 79, 'Ibrahim Al-Khalil Gate', 'باب إبراهيم الخليل', 21.4205, 39.8250, 'Southwest entrance'),
('gate-009', 84, 'Ajyad Gate', 'باب أجياد', 21.4200, 39.8245, 'Ajyad area entrance'),
('gate-010', 94, 'Al-Safa Gate', 'باب الصفا', 21.4222, 39.8290, 'Near Safa hill');

-- Seed Nearby Attractions
INSERT INTO nearby_attractions (id, name_english, name_arabic, category, latitude, longitude, description) VALUES
('attr-001', 'Kaaba', 'الكعبة المشرفة', 'religious', 21.4225, 39.8262, 'The Holy Kaaba - center of Masjid al-Haram'),
('attr-002', 'Safa Hill', 'جبل الصفا', 'religious', 21.4223, 39.8288, 'Starting point of Sa''i ritual'),
('attr-003', 'Marwah Hill', 'جبل المروة', 'religious', 21.4265, 39.8270, 'End point of Sa''i ritual'),
('attr-004', 'Zamzam Well', 'بئر زمزم', 'religious', 21.4224, 39.8264, 'Sacred well within the mosque'),
('attr-005', 'Maqam Ibrahim', 'مقام إبراهيم', 'religious', 21.4226, 39.8263, 'Station of Ibrahim'),
('attr-006', 'Abraj Al-Bait Mall', 'أبراج البيت مول', 'shopping', 21.4195, 39.8265, 'Large shopping complex near Haram'),
('attr-007', 'Clock Tower', 'برج الساعة', 'historical', 21.4193, 39.8267, 'Makkah Royal Clock Tower'),
('attr-008', 'Jabal al-Nour', 'جبل النور', 'religious', 21.4575, 39.8583, 'Mountain containing Cave of Hira'),
('attr-009', 'Mina', 'منى', 'religious', 21.4133, 39.8933, 'Tent city for Hajj rituals'),
('attr-010', 'Jamarat Bridge', 'جسر الجمرات', 'religious', 21.4200, 39.8917, 'Stoning of the Devil ritual site');
