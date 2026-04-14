-- ============================================
-- DUMMY DATA SEED FILE
-- Generates realistic test data for the booking platform
-- ============================================

-- Clear existing data (in reverse order of dependencies)
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
-- USERS (100 users: 10 admins, 20 agents, 70 customers)
-- ============================================
-- Password for all users: "password123" (hashed with bcrypt)
-- Hash: $2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq

-- Super Admin
INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES
('admin-001', 'Sarah', 'Admin', 'admin@bookingplatform.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'SUPER_ADMIN', TRUE);

-- Company Admins (9)
INSERT INTO users (id, first_name, last_name, email, password_hash, role, company_id, is_active) VALUES
('cadmin-001', 'James', 'Wilson', 'james.wilson@luxuryhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-001', TRUE),
('cadmin-002', 'Emma', 'Thompson', 'emma.thompson@grandstay.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-002', TRUE),
('cadmin-003', 'Oliver', 'Brown', 'oliver.brown@cityhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-003', TRUE),
('cadmin-004', 'Sophie', 'Davis', 'sophie.davis@beachresorts.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-004', TRUE),
('cadmin-005', 'William', 'Miller', 'william.miller@mountainlodge.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-005', TRUE),
('cadmin-006', 'Charlotte', 'Garcia', 'charlotte.garcia@boutique.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-006', TRUE),
('cadmin-007', 'Henry', 'Martinez', 'henry.martinez@businesshotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-007', TRUE),
('cadmin-008', 'Amelia', 'Rodriguez', 'amelia.rodriguez@familyresorts.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-008', TRUE),
('cadmin-009', 'George', 'Lee', 'george.lee@budgetinn.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'COMPANY_ADMIN', 'comp-009', TRUE);

-- Agents (20)
INSERT INTO users (id, first_name, last_name, email, password_hash, role, company_id, service_type, is_active) VALUES
('agent-001', 'Michael', 'Johnson', 'michael.j@luxuryhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-001', 'HOTEL', TRUE),
('agent-002', 'Emily', 'Williams', 'emily.w@luxuryhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-001', 'HOTEL', TRUE),
('agent-003', 'Daniel', 'Jones', 'daniel.j@grandstay.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-002', 'HOTEL', TRUE),
('agent-004', 'Isabella', 'Taylor', 'isabella.t@grandstay.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-002', 'HOTEL', TRUE),
('agent-005', 'Matthew', 'Anderson', 'matthew.a@cityhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-003', 'HOTEL', TRUE),
('agent-006', 'Mia', 'Thomas', 'mia.t@cityhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-003', 'HOTEL', TRUE),
('agent-007', 'Alexander', 'Jackson', 'alex.j@beachresorts.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-004', 'HOTEL', TRUE),
('agent-008', 'Ava', 'White', 'ava.w@beachresorts.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-004', 'HOTEL', TRUE),
('agent-009', 'Ethan', 'Harris', 'ethan.h@mountainlodge.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-005', 'HOTEL', TRUE),
('agent-010', 'Sophia', 'Martin', 'sophia.m@mountainlodge.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-005', 'HOTEL', TRUE),
('agent-011', 'Benjamin', 'Thompson', 'ben.t@boutique.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-006', 'HOTEL', TRUE),
('agent-012', 'Harper', 'Garcia', 'harper.g@boutique.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-006', 'HOTEL', TRUE),
('agent-013', 'Lucas', 'Martinez', 'lucas.m@businesshotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-007', 'HOTEL', TRUE),
('agent-014', 'Evelyn', 'Robinson', 'evelyn.r@businesshotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-007', 'HOTEL', TRUE),
('agent-015', 'Jackson', 'Clark', 'jackson.c@familyresorts.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-008', 'HOTEL', TRUE),
('agent-016', 'Abigail', 'Rodriguez', 'abigail.r@familyresorts.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-008', 'HOTEL', TRUE),
('agent-017', 'Sebastian', 'Lewis', 'sebastian.l@budgetinn.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-009', 'HOTEL', TRUE),
('agent-018', 'Ella', 'Walker', 'ella.w@budgetinn.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-009', 'HOTEL', TRUE),
('agent-019', 'David', 'Hall', 'david.h@luxuryhotels.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-001', 'HOTEL', TRUE),
('agent-020', 'Victoria', 'Allen', 'victoria.a@grandstay.com', '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'AGENT', 'comp-002', 'HOTEL', TRUE);
