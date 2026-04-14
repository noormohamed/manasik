-- ============================================
-- COMPREHENSIVE DUMMY DATA SEED FILE
-- Generated: 2026-01-31T22:18:25.885Z
-- ============================================

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE checkout_sessions;
TRUNCATE TABLE checkouts;
TRUNCATE TABLE agent_documents;
TRUNCATE TABLE bank_details;
TRUNCATE TABLE user_permissions;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE reviews;
TRUNCATE TABLE bookings;
TRUNCATE TABLE room_images;
TRUNCATE TABLE room_amenities;
TRUNCATE TABLE room_types;
TRUNCATE TABLE hotel_images;
TRUNCATE TABLE hotel_amenities;
TRUNCATE TABLE hotels;
TRUNCATE TABLE company_admins;
TRUNCATE TABLE agents;
TRUNCATE TABLE companies;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- CUSTOMERS (70)
-- ============================================
INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES
('customer-001', 'Jane', 'Johnson', 'jane.johnson1@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-002', 'Robert', 'Williams', 'robert.williams2@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-003', 'Mary', 'Brown', 'mary.brown3@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-004', 'David', 'Jones', 'david.jones4@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-005', 'Sarah', 'Garcia', 'sarah.garcia5@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-006', 'Michael', 'Miller', 'michael.miller6@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-007', 'Emily', 'Davis', 'emily.davis7@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-008', 'James', 'Rodriguez', 'james.rodriguez8@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-009', 'Emma', 'Martinez', 'emma.martinez9@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-010', 'William', 'Hernandez', 'william.hernandez10@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-011', 'Olivia', 'Lopez', 'olivia.lopez11@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-012', 'Richard', 'Gonzalez', 'richard.gonzalez12@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-013', 'Ava', 'Wilson', 'ava.wilson13@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-014', 'Joseph', 'Anderson', 'joseph.anderson14@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-015', 'Isabella', 'Thomas', 'isabella.thomas15@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-016', 'Thomas', 'Taylor', 'thomas.taylor16@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-017', 'Sophia', 'Moore', 'sophia.moore17@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-018', 'Charles', 'Jackson', 'charles.jackson18@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-019', 'Mia', 'Martin', 'mia.martin19@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-020', 'Christopher', 'Lee', 'christopher.lee20@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-021', 'Charlotte', 'Perez', 'charlotte.perez21@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-022', 'Daniel', 'Thompson', 'daniel.thompson22@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-023', 'Amelia', 'White', 'amelia.white23@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-024', 'Matthew', 'Harris', 'matthew.harris24@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-025', 'Harper', 'Sanchez', 'harper.sanchez25@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-026', 'Anthony', 'Clark', 'anthony.clark26@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-027', 'Evelyn', 'Ramirez', 'evelyn.ramirez27@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-028', 'Mark', 'Lewis', 'mark.lewis28@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-029', 'Abigail', 'Robinson', 'abigail.robinson29@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-030', 'Donald', 'Walker', 'donald.walker30@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-031', 'Emily', 'Young', 'emily.young31@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-032', 'Steven', 'Allen', 'steven.allen32@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-033', 'Elizabeth', 'King', 'elizabeth.king33@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-034', 'Paul', 'Wright', 'paul.wright34@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-035', 'Sofia', 'Scott', 'sofia.scott35@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-036', 'Andrew', 'Torres', 'andrew.torres36@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-037', 'Avery', 'Nguyen', 'avery.nguyen37@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-038', 'Joshua', 'Hill', 'joshua.hill38@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-039', 'Ella', 'Flores', 'ella.flores39@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-040', 'Kenneth', 'Green', 'kenneth.green40@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-041', 'Scarlett', 'Adams', 'scarlett.adams41@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-042', 'Kevin', 'Nelson', 'kevin.nelson42@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-043', 'Grace', 'Baker', 'grace.baker43@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-044', 'Brian', 'Hall', 'brian.hall44@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-045', 'Chloe', 'Rivera', 'chloe.rivera45@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-046', 'George', 'Campbell', 'george.campbell46@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-047', 'Victoria', 'Mitchell', 'victoria.mitchell47@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-048', 'Timothy', 'Carter', 'timothy.carter48@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-049', 'Riley', 'Roberts', 'riley.roberts49@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-050', 'Ronald', 'Smith', 'ronald.smith50@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-051', 'Aria', 'Johnson', 'aria.johnson51@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-052', 'Edward', 'Williams', 'edward.williams52@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-053', 'Lily', 'Brown', 'lily.brown53@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-054', 'Jason', 'Jones', 'jason.jones54@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-055', 'Aubrey', 'Garcia', 'aubrey.garcia55@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-056', 'Jeffrey', 'Miller', 'jeffrey.miller56@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-057', 'Zoey', 'Davis', 'zoey.davis57@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-058', 'Ryan', 'Rodriguez', 'ryan.rodriguez58@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-059', 'Penelope', 'Martinez', 'penelope.martinez59@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-060', 'Jacob', 'Hernandez', 'jacob.hernandez60@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-061', 'Lillian', 'Lopez', 'lillian.lopez61@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-062', 'Gary', 'Gonzalez', 'gary.gonzalez62@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-063', 'Addison', 'Wilson', 'addison.wilson63@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-064', 'Nicholas', 'Anderson', 'nicholas.anderson64@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-065', 'Layla', 'Thomas', 'layla.thomas65@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-066', 'Eric', 'Taylor', 'eric.taylor66@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-067', 'Natalie', 'Moore', 'natalie.moore67@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-068', 'Jonathan', 'Jackson', 'jonathan.jackson68@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-069', 'Camila', 'Martin', 'camila.martin69@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE),
('customer-070', 'John', 'Lee', 'john.lee70@example.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'CUSTOMER', TRUE);

-- ============================================
-- COMPANIES (10)
-- ============================================
INSERT INTO companies (id, name, service_type, description, email, phone, city, country, is_verified, is_active) VALUES
('comp-001', 'Luxury Hotels International', 'HOTEL', 'Premium 5-star hotels worldwide', 'info@luxuryhotelsinternational.com', '+44-20-1234-5000', 'London', 'United Kingdom', TRUE, TRUE),
('comp-002', 'Grand Stay Hotels', 'HOTEL', '4-star business and leisure hotels', 'info@grandstayhotels.com', '+44-20-1234-5001', 'Paris', 'France', TRUE, TRUE),
('comp-003', 'City Hotels Group', 'HOTEL', 'Urban hotels in major cities', 'info@cityhotelsgroup.com', '+44-20-1234-5002', 'New York', 'United States', TRUE, TRUE),
('comp-004', 'Beach Resorts & Spa', 'HOTEL', 'Luxury beach resorts', 'info@beachresorts&spa.com', '+44-20-1234-5003', 'Tokyo', 'Japan', TRUE, TRUE),
('comp-005', 'Mountain Lodge Collection', 'HOTEL', 'Mountain retreats and lodges', 'info@mountainlodgecollection.com', '+44-20-1234-5004', 'Dubai', 'United Arab Emirates', TRUE, TRUE),
('comp-006', 'Boutique Hotels Ltd', 'HOTEL', 'Unique boutique experiences', 'info@boutiquehotelsltd.com', '+44-20-1234-5005', 'Singapore', 'Singapore', TRUE, TRUE),
('comp-007', 'Business Hotels Corp', 'HOTEL', 'Hotels for business travelers', 'info@businesshotelscorp.com', '+44-20-1234-5006', 'Barcelona', 'Spain', TRUE, TRUE),
('comp-008', 'Family Resorts International', 'HOTEL', 'Family-friendly resorts', 'info@familyresortsinternational.com', '+44-20-1234-5007', 'Rome', 'Italy', TRUE, TRUE),
('comp-009', 'Budget Inn Chain', 'HOTEL', 'Affordable accommodation', 'info@budgetinnchain.com', '+44-20-1234-5008', 'Sydney', 'Australia', TRUE, TRUE),
('comp-010', 'Heritage Hotels', 'HOTEL', 'Historic and heritage properties', 'info@heritagehotels.com', '+44-20-1234-5009', 'Los Angeles', 'United States', TRUE, TRUE);

-- ============================================
-- HOTELS (50)
-- ============================================
INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, star_rating, total_rooms, average_rating, total_reviews) VALUES
('hotel-001', 'comp-001', 'agent-001', 'Grand Oceanview Resort', 'A wonderful 4-star hotel in Paris', 'ACTIVE', '1 Main Street', 'Paris', 'Île-de-France', 'France', 'ZIP1', 4, 60, 3.60, 15),
('hotel-002', 'comp-002', 'agent-002', 'Royal Downtown Inn', 'A wonderful 5-star hotel in New York', 'ACTIVE', '2 Main Street', 'New York', 'New York', 'United States', 'ZIP2', 5, 70, 3.70, 20),
('hotel-003', 'comp-003', 'agent-003', 'Imperial Central Suites', 'A wonderful 3-star hotel in Tokyo', 'ACTIVE', '3 Main Street', 'Tokyo', 'Tokyo', 'Japan', 'ZIP3', 3, 80, 3.80, 25),
('hotel-004', 'comp-004', 'agent-004', 'Luxury Boutique Palace', 'A wonderful 4-star hotel in Dubai', 'ACTIVE', '4 Main Street', 'Dubai', 'Dubai', 'United Arab Emirates', 'ZIP4', 4, 90, 3.90, 30),
('hotel-005', 'comp-005', 'agent-005', 'Premium Historic Lodge', 'A wonderful 5-star hotel in Singapore', 'ACTIVE', '5 Main Street', 'Singapore', 'Singapore', 'Singapore', 'ZIP5', 5, 100, 4.00, 35),
('hotel-006', 'comp-006', 'agent-006', 'Elite Modern Retreat', 'A wonderful 3-star hotel in Barcelona', 'ACTIVE', '6 Main Street', 'Barcelona', 'Catalonia', 'Spain', 'ZIP6', 3, 110, 4.10, 40),
('hotel-007', 'comp-007', 'agent-007', 'Majestic Classic Manor', 'A wonderful 4-star hotel in Rome', 'ACTIVE', '7 Main Street', 'Rome', 'Lazio', 'Italy', 'ZIP7', 4, 120, 4.20, 45),
('hotel-008', 'comp-008', 'agent-008', 'Regal Urban Plaza', 'A wonderful 5-star hotel in Sydney', 'ACTIVE', '8 Main Street', 'Sydney', 'New South Wales', 'Australia', 'ZIP8', 5, 130, 4.30, 50),
('hotel-009', 'comp-009', 'agent-009', 'Supreme Garden Tower', 'A wonderful 3-star hotel in Los Angeles', 'ACTIVE', '9 Main Street', 'Los Angeles', 'California', 'United States', 'ZIP9', 3, 140, 4.40, 55),
('hotel-010', 'comp-010', 'agent-010', 'The Riverside Hotel', 'A wonderful 4-star hotel in Amsterdam', 'ACTIVE', '10 Main Street', 'Amsterdam', 'North Holland', 'Netherlands', 'ZIP10', 4, 150, 4.50, 60),
('hotel-011', 'comp-001', 'agent-011', 'Grand Oceanview Resort', 'A wonderful 5-star hotel in Berlin', 'ACTIVE', '11 Main Street', 'Berlin', 'Berlin', 'Germany', 'ZIP11', 5, 160, 4.60, 65),
('hotel-012', 'comp-002', 'agent-012', 'Royal Downtown Inn', 'A wonderful 3-star hotel in Bangkok', 'ACTIVE', '12 Main Street', 'Bangkok', 'Bangkok', 'Thailand', 'ZIP12', 3, 170, 4.70, 70),
('hotel-013', 'comp-003', 'agent-013', 'Imperial Central Suites', 'A wonderful 4-star hotel in Istanbul', 'ACTIVE', '13 Main Street', 'Istanbul', 'Istanbul', 'Turkey', 'ZIP13', 4, 180, 4.80, 75),
('hotel-014', 'comp-004', 'agent-014', 'Luxury Boutique Palace', 'A wonderful 5-star hotel in Hong Kong', 'ACTIVE', '14 Main Street', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'ZIP14', 5, 190, 4.90, 80),
('hotel-015', 'comp-005', 'agent-015', 'Premium Historic Lodge', 'A wonderful 3-star hotel in London', 'ACTIVE', '15 Main Street', 'London', 'England', 'United Kingdom', 'ZIP15', 3, 200, 3.50, 85),
('hotel-016', 'comp-006', 'agent-016', 'Elite Modern Retreat', 'A wonderful 4-star hotel in Paris', 'ACTIVE', '16 Main Street', 'Paris', 'Île-de-France', 'France', 'ZIP16', 4, 210, 3.60, 90),
('hotel-017', 'comp-007', 'agent-017', 'Majestic Classic Manor', 'A wonderful 5-star hotel in New York', 'ACTIVE', '17 Main Street', 'New York', 'New York', 'United States', 'ZIP17', 5, 220, 3.70, 95),
('hotel-018', 'comp-008', 'agent-018', 'Regal Urban Plaza', 'A wonderful 3-star hotel in Tokyo', 'ACTIVE', '18 Main Street', 'Tokyo', 'Tokyo', 'Japan', 'ZIP18', 3, 230, 3.80, 100),
('hotel-019', 'comp-009', 'agent-019', 'Supreme Garden Tower', 'A wonderful 4-star hotel in Dubai', 'ACTIVE', '19 Main Street', 'Dubai', 'Dubai', 'United Arab Emirates', 'ZIP19', 4, 240, 3.90, 105),
('hotel-020', 'comp-010', 'agent-020', 'The Riverside Hotel', 'A wonderful 5-star hotel in Singapore', 'ACTIVE', '20 Main Street', 'Singapore', 'Singapore', 'Singapore', 'ZIP20', 5, 250, 4.00, 110),
('hotel-021', 'comp-001', 'agent-001', 'Grand Oceanview Resort', 'A wonderful 3-star hotel in Barcelona', 'ACTIVE', '21 Main Street', 'Barcelona', 'Catalonia', 'Spain', 'ZIP21', 3, 260, 4.10, 115),
('hotel-022', 'comp-002', 'agent-002', 'Royal Downtown Inn', 'A wonderful 4-star hotel in Rome', 'ACTIVE', '22 Main Street', 'Rome', 'Lazio', 'Italy', 'ZIP22', 4, 270, 4.20, 120),
('hotel-023', 'comp-003', 'agent-003', 'Imperial Central Suites', 'A wonderful 5-star hotel in Sydney', 'ACTIVE', '23 Main Street', 'Sydney', 'New South Wales', 'Australia', 'ZIP23', 5, 280, 4.30, 125),
('hotel-024', 'comp-004', 'agent-004', 'Luxury Boutique Palace', 'A wonderful 3-star hotel in Los Angeles', 'ACTIVE', '24 Main Street', 'Los Angeles', 'California', 'United States', 'ZIP24', 3, 290, 4.40, 130),
('hotel-025', 'comp-005', 'agent-005', 'Premium Historic Lodge', 'A wonderful 4-star hotel in Amsterdam', 'ACTIVE', '25 Main Street', 'Amsterdam', 'North Holland', 'Netherlands', 'ZIP25', 4, 300, 4.50, 135),
('hotel-026', 'comp-006', 'agent-006', 'Elite Modern Retreat', 'A wonderful 5-star hotel in Berlin', 'ACTIVE', '26 Main Street', 'Berlin', 'Berlin', 'Germany', 'ZIP26', 5, 310, 4.60, 140),
('hotel-027', 'comp-007', 'agent-007', 'Majestic Classic Manor', 'A wonderful 3-star hotel in Bangkok', 'ACTIVE', '27 Main Street', 'Bangkok', 'Bangkok', 'Thailand', 'ZIP27', 3, 320, 4.70, 145),
('hotel-028', 'comp-008', 'agent-008', 'Regal Urban Plaza', 'A wonderful 4-star hotel in Istanbul', 'ACTIVE', '28 Main Street', 'Istanbul', 'Istanbul', 'Turkey', 'ZIP28', 4, 330, 4.80, 150),
('hotel-029', 'comp-009', 'agent-009', 'Supreme Garden Tower', 'A wonderful 5-star hotel in Hong Kong', 'ACTIVE', '29 Main Street', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'ZIP29', 5, 340, 4.90, 155),
('hotel-030', 'comp-010', 'agent-010', 'The Riverside Hotel', 'A wonderful 3-star hotel in London', 'ACTIVE', '30 Main Street', 'London', 'England', 'United Kingdom', 'ZIP30', 3, 350, 3.50, 160),
('hotel-031', 'comp-001', 'agent-011', 'Grand Oceanview Resort', 'A wonderful 4-star hotel in Paris', 'ACTIVE', '31 Main Street', 'Paris', 'Île-de-France', 'France', 'ZIP31', 4, 360, 3.60, 165),
('hotel-032', 'comp-002', 'agent-012', 'Royal Downtown Inn', 'A wonderful 5-star hotel in New York', 'ACTIVE', '32 Main Street', 'New York', 'New York', 'United States', 'ZIP32', 5, 370, 3.70, 170),
('hotel-033', 'comp-003', 'agent-013', 'Imperial Central Suites', 'A wonderful 3-star hotel in Tokyo', 'ACTIVE', '33 Main Street', 'Tokyo', 'Tokyo', 'Japan', 'ZIP33', 3, 380, 3.80, 175),
('hotel-034', 'comp-004', 'agent-014', 'Luxury Boutique Palace', 'A wonderful 4-star hotel in Dubai', 'ACTIVE', '34 Main Street', 'Dubai', 'Dubai', 'United Arab Emirates', 'ZIP34', 4, 390, 3.90, 180),
('hotel-035', 'comp-005', 'agent-015', 'Premium Historic Lodge', 'A wonderful 5-star hotel in Singapore', 'ACTIVE', '35 Main Street', 'Singapore', 'Singapore', 'Singapore', 'ZIP35', 5, 400, 4.00, 185),
('hotel-036', 'comp-006', 'agent-016', 'Elite Modern Retreat', 'A wonderful 3-star hotel in Barcelona', 'ACTIVE', '36 Main Street', 'Barcelona', 'Catalonia', 'Spain', 'ZIP36', 3, 410, 4.10, 190),
('hotel-037', 'comp-007', 'agent-017', 'Majestic Classic Manor', 'A wonderful 4-star hotel in Rome', 'ACTIVE', '37 Main Street', 'Rome', 'Lazio', 'Italy', 'ZIP37', 4, 420, 4.20, 195),
('hotel-038', 'comp-008', 'agent-018', 'Regal Urban Plaza', 'A wonderful 5-star hotel in Sydney', 'ACTIVE', '38 Main Street', 'Sydney', 'New South Wales', 'Australia', 'ZIP38', 5, 430, 4.30, 200),
('hotel-039', 'comp-009', 'agent-019', 'Supreme Garden Tower', 'A wonderful 3-star hotel in Los Angeles', 'ACTIVE', '39 Main Street', 'Los Angeles', 'California', 'United States', 'ZIP39', 3, 440, 4.40, 205),
('hotel-040', 'comp-010', 'agent-020', 'The Riverside Hotel', 'A wonderful 4-star hotel in Amsterdam', 'ACTIVE', '40 Main Street', 'Amsterdam', 'North Holland', 'Netherlands', 'ZIP40', 4, 450, 4.50, 210),
('hotel-041', 'comp-001', 'agent-001', 'Grand Oceanview Resort', 'A wonderful 5-star hotel in Berlin', 'ACTIVE', '41 Main Street', 'Berlin', 'Berlin', 'Germany', 'ZIP41', 5, 460, 4.60, 215),
('hotel-042', 'comp-002', 'agent-002', 'Royal Downtown Inn', 'A wonderful 3-star hotel in Bangkok', 'ACTIVE', '42 Main Street', 'Bangkok', 'Bangkok', 'Thailand', 'ZIP42', 3, 470, 4.70, 220),
('hotel-043', 'comp-003', 'agent-003', 'Imperial Central Suites', 'A wonderful 4-star hotel in Istanbul', 'ACTIVE', '43 Main Street', 'Istanbul', 'Istanbul', 'Turkey', 'ZIP43', 4, 480, 4.80, 225),
('hotel-044', 'comp-004', 'agent-004', 'Luxury Boutique Palace', 'A wonderful 5-star hotel in Hong Kong', 'ACTIVE', '44 Main Street', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'ZIP44', 5, 490, 4.90, 230),
('hotel-045', 'comp-005', 'agent-005', 'Premium Historic Lodge', 'A wonderful 3-star hotel in London', 'ACTIVE', '45 Main Street', 'London', 'England', 'United Kingdom', 'ZIP45', 3, 500, 3.50, 235),
('hotel-046', 'comp-006', 'agent-006', 'Elite Modern Retreat', 'A wonderful 4-star hotel in Paris', 'ACTIVE', '46 Main Street', 'Paris', 'Île-de-France', 'France', 'ZIP46', 4, 510, 3.60, 240),
('hotel-047', 'comp-007', 'agent-007', 'Majestic Classic Manor', 'A wonderful 5-star hotel in New York', 'ACTIVE', '47 Main Street', 'New York', 'New York', 'United States', 'ZIP47', 5, 520, 3.70, 245),
('hotel-048', 'comp-008', 'agent-008', 'Regal Urban Plaza', 'A wonderful 3-star hotel in Tokyo', 'ACTIVE', '48 Main Street', 'Tokyo', 'Tokyo', 'Japan', 'ZIP48', 3, 530, 3.80, 250),
('hotel-049', 'comp-009', 'agent-009', 'Supreme Garden Tower', 'A wonderful 4-star hotel in Dubai', 'ACTIVE', '49 Main Street', 'Dubai', 'Dubai', 'United Arab Emirates', 'ZIP49', 4, 540, 3.90, 255),
('hotel-050', 'comp-010', 'agent-010', 'The Riverside Hotel', 'A wonderful 5-star hotel in Singapore', 'ACTIVE', '50 Main Street', 'Singapore', 'Singapore', 'Singapore', 'ZIP50', 5, 550, 4.00, 260);

-- Script generation complete!
