/**
 * Generate Dummy Data SQL Script
 * Run with: node generate-seed-data.js > seed-dummy-data-full.sql
 */

const fs = require('fs');

const passwordHash = '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq';

// Customer names
const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Emma', 
  'William', 'Olivia', 'Richard', 'Ava', 'Joseph', 'Isabella', 'Thomas', 'Sophia', 'Charles', 'Mia',
  'Christopher', 'Charlotte', 'Daniel', 'Amelia', 'Matthew', 'Harper', 'Anthony', 'Evelyn', 'Mark', 'Abigail',
  'Donald', 'Emily', 'Steven', 'Elizabeth', 'Paul', 'Sofia', 'Andrew', 'Avery', 'Joshua', 'Ella',
  'Kenneth', 'Scarlett', 'Kevin', 'Grace', 'Brian', 'Chloe', 'George', 'Victoria', 'Timothy', 'Riley',
  'Ronald', 'Aria', 'Edward', 'Lily', 'Jason', 'Aubrey', 'Jeffrey', 'Zoey', 'Ryan', 'Penelope',
  'Jacob', 'Lillian', 'Gary', 'Addison', 'Nicholas', 'Layla', 'Eric', 'Natalie', 'Jonathan', 'Camila'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

// Cities and countries
const locations = [
  { city: 'London', country: 'United Kingdom', state: 'England' },
  { city: 'Paris', country: 'France', state: 'Île-de-France' },
  { city: 'New York', country: 'United States', state: 'New York' },
  { city: 'Tokyo', country: 'Japan', state: 'Tokyo' },
  { city: 'Dubai', country: 'United Arab Emirates', state: 'Dubai' },
  { city: 'Singapore', country: 'Singapore', state: 'Singapore' },
  { city: 'Barcelona', country: 'Spain', state: 'Catalonia' },
  { city: 'Rome', country: 'Italy', state: 'Lazio' },
  { city: 'Sydney', country: 'Australia', state: 'New South Wales' },
  { city: 'Los Angeles', country: 'United States', state: 'California' },
  { city: 'Amsterdam', country: 'Netherlands', state: 'North Holland' },
  { city: 'Berlin', country: 'Germany', state: 'Berlin' },
  { city: 'Bangkok', country: 'Thailand', state: 'Bangkok' },
  { city: 'Istanbul', country: 'Turkey', state: 'Istanbul' },
  { city: 'Hong Kong', country: 'Hong Kong', state: 'Hong Kong' },
];

// Hotel names
const hotelPrefixes = ['The', 'Grand', 'Royal', 'Imperial', 'Luxury', 'Premium', 'Elite', 'Majestic', 'Regal', 'Supreme'];
const hotelTypes = ['Hotel', 'Resort', 'Inn', 'Suites', 'Palace', 'Lodge', 'Retreat', 'Manor', 'Plaza', 'Tower'];
const hotelAdjectives = ['Riverside', 'Oceanview', 'Downtown', 'Central', 'Boutique', 'Historic', 'Modern', 'Classic', 'Urban', 'Garden'];

console.log(`-- ============================================`);
console.log(`-- COMPREHENSIVE DUMMY DATA SEED FILE`);
console.log(`-- Generated: ${new Date().toISOString()}`);
console.log(`-- ============================================\n`);

console.log(`-- Clear existing data`);
console.log(`SET FOREIGN_KEY_CHECKS = 0;`);
const tables = ['checkout_sessions', 'checkouts', 'agent_documents', 'bank_details', 'user_permissions', 
  'role_permissions', 'reviews', 'bookings', 'room_images', 'room_amenities', 'room_types', 
  'hotel_images', 'hotel_amenities', 'hotels', 'company_admins', 'agents', 'companies', 'users'];
tables.forEach(table => console.log(`TRUNCATE TABLE ${table};`));
console.log(`SET FOREIGN_KEY_CHECKS = 1;\n`);

// Generate Customers (70)
console.log(`-- ============================================`);
console.log(`-- CUSTOMERS (70)`);
console.log(`-- ============================================`);
console.log(`INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES`);
for (let i = 1; i <= 70; i++) {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
  const comma = i < 70 ? ',' : ';';
  console.log(`('customer-${String(i).padStart(3, '0')}', '${firstName}', '${lastName}', '${email}', '${passwordHash}', 'CUSTOMER', TRUE)${comma}`);
}

console.log(`\n-- ============================================`);
console.log(`-- COMPANIES (10)`);
console.log(`-- ============================================`);
const companies = [
  { id: 'comp-001', name: 'Luxury Hotels International', type: 'HOTEL', desc: 'Premium 5-star hotels worldwide' },
  { id: 'comp-002', name: 'Grand Stay Hotels', type: 'HOTEL', desc: '4-star business and leisure hotels' },
  { id: 'comp-003', name: 'City Hotels Group', type: 'HOTEL', desc: 'Urban hotels in major cities' },
  { id: 'comp-004', name: 'Beach Resorts & Spa', type: 'HOTEL', desc: 'Luxury beach resorts' },
  { id: 'comp-005', name: 'Mountain Lodge Collection', type: 'HOTEL', desc: 'Mountain retreats and lodges' },
  { id: 'comp-006', name: 'Boutique Hotels Ltd', type: 'HOTEL', desc: 'Unique boutique experiences' },
  { id: 'comp-007', name: 'Business Hotels Corp', type: 'HOTEL', desc: 'Hotels for business travelers' },
  { id: 'comp-008', name: 'Family Resorts International', type: 'HOTEL', desc: 'Family-friendly resorts' },
  { id: 'comp-009', name: 'Budget Inn Chain', type: 'HOTEL', desc: 'Affordable accommodation' },
  { id: 'comp-010', name: 'Heritage Hotels', type: 'HOTEL', desc: 'Historic and heritage properties' },
];

console.log(`INSERT INTO companies (id, name, service_type, description, email, phone, city, country, is_verified, is_active) VALUES`);
companies.forEach((comp, idx) => {
  const loc = locations[idx % locations.length];
  const comma = idx < companies.length - 1 ? ',' : ';';
  console.log(`('${comp.id}', '${comp.name}', '${comp.type}', '${comp.desc}', 'info@${comp.name.toLowerCase().replace(/\s+/g, '')}.com', '+44-20-1234-${5000 + idx}', '${loc.city}', '${loc.country}', TRUE, TRUE)${comma}`);
});

// Generate Hotels (50 hotels across companies)
console.log(`\n-- ============================================`);
console.log(`-- HOTELS (50)`);
console.log(`-- ============================================`);
console.log(`INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, star_rating, total_rooms, average_rating, total_reviews) VALUES`);
for (let i = 1; i <= 50; i++) {
  const companyIdx = (i - 1) % 10;
  const agentIdx = (i - 1) % 20 + 1;
  const locIdx = i % locations.length;
  const loc = locations[locIdx];
  
  const prefix = hotelPrefixes[i % hotelPrefixes.length];
  const adj = hotelAdjectives[i % hotelAdjectives.length];
  const type = hotelTypes[i % hotelTypes.length];
  const name = `${prefix} ${adj} ${type}`;
  
  const starRating = 3 + (i % 3);
  const totalRooms = 50 + (i * 10);
  const avgRating = (3.5 + (i % 15) / 10).toFixed(2);
  const totalReviews = 10 + (i * 5);
  
  const comma = i < 50 ? ',' : ';';
  console.log(`('hotel-${String(i).padStart(3, '0')}', 'comp-${String(companyIdx + 1).padStart(3, '0')}', 'agent-${String(agentIdx).padStart(3, '0')}', '${name}', 'A wonderful ${starRating}-star hotel in ${loc.city}', 'ACTIVE', '${i} Main Street', '${loc.city}', '${loc.state}', '${loc.country}', 'ZIP${i}', ${starRating}, ${totalRooms}, ${avgRating}, ${totalReviews})${comma}`);
}

console.log(`\n-- Script generation complete!`);
