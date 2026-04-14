/**
 * Generate 100 hotels with rooms and availability
 */

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Hotel names and locations
const hotelNames = [
  'Grand Palace', 'Royal Suite', 'Ocean View', 'Mountain Lodge', 'City Center',
  'Sunset Resort', 'Paradise Inn', 'Golden Gate', 'Silver Star', 'Diamond Plaza',
  'Emerald Hotel', 'Sapphire Suites', 'Ruby Resort', 'Pearl Palace', 'Crystal Tower',
  'Majestic Hotel', 'Imperial Palace', 'Regal Inn', 'Crown Plaza', 'Elite Suites',
  'Luxury Lodge', 'Premium Palace', 'Deluxe Hotel', 'Supreme Suites', 'Excellence Inn',
  'Harmony Hotel', 'Serenity Suites', 'Tranquil Resort', 'Peaceful Palace', 'Calm Inn',
  'Horizon Hotel', 'Skyline Suites', 'Summit Resort', 'Peak Palace', 'Vista Inn',
  'Oasis Hotel', 'Mirage Suites', 'Desert Resort', 'Dunes Palace', 'Sahara Inn',
  'Coastal Hotel', 'Beachfront Suites', 'Seaside Resort', 'Marina Palace', 'Harbor Inn',
  'Metropolitan Hotel', 'Urban Suites', 'Downtown Resort', 'Central Palace', 'Plaza Inn'
];

const cities = [
  { name: 'Makkah', country: 'Saudi Arabia', state: 'Makkah Province' },
  { name: 'Madinah', country: 'Saudi Arabia', state: 'Madinah Province' },
  { name: 'Jeddah', country: 'Saudi Arabia', state: 'Makkah Province' },
  { name: 'Riyadh', country: 'Saudi Arabia', state: 'Riyadh Province' },
  { name: 'Dubai', country: 'UAE', state: 'Dubai' },
  { name: 'Abu Dhabi', country: 'UAE', state: 'Abu Dhabi' },
  { name: 'Doha', country: 'Qatar', state: 'Doha' },
  { name: 'Istanbul', country: 'Turkey', state: 'Istanbul' },
  { name: 'Cairo', country: 'Egypt', state: 'Cairo' },
  { name: 'Amman', country: 'Jordan', state: 'Amman' }
];

const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];
const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin'];

// Review data
const reviewTitles = [
  'Amazing stay!', 'Excellent hotel', 'Great experience', 'Highly recommend',
  'Perfect location', 'Outstanding service', 'Wonderful stay', 'Fantastic hotel',
  'Best hotel ever', 'Loved it!', 'Will come back', 'Exceeded expectations',
  'Beautiful property', 'Very comfortable', 'Great value', 'Superb amenities',
  'Clean and modern', 'Friendly staff', 'Good experience', 'Nice hotel',
  'Decent stay', 'Average hotel', 'Could be better', 'Not bad',
  'Disappointing', 'Needs improvement', 'Below expectations', 'Poor service'
];

const reviewComments = [
  'The hotel exceeded all our expectations. The staff was incredibly friendly and helpful. The room was spacious and clean. Would definitely stay here again!',
  'Great location, close to all major attractions. The breakfast was delicious and the pool area was beautiful. Highly recommend this hotel.',
  'We had a wonderful stay. The room was comfortable and well-maintained. The hotel amenities were top-notch. Perfect for families.',
  'Excellent service from check-in to check-out. The concierge was very helpful with recommendations. The room had a beautiful view.',
  'Very clean and modern hotel. The bed was extremely comfortable. Great value for money. Will definitely return on our next visit.',
  'The staff went above and beyond to make our stay comfortable. The location is perfect for exploring the city. Loved the rooftop restaurant.',
  'Beautiful hotel with great facilities. The gym was well-equipped and the spa was relaxing. Room service was prompt and delicious.',
  'Stayed here for a business trip and was very impressed. Fast WiFi, comfortable workspace in the room, and excellent business center.',
  'Perfect for a romantic getaway. The room was beautifully decorated and the ambiance was lovely. The restaurant had amazing food.',
  'Family-friendly hotel with lots of activities for kids. The pool was great and the staff was very accommodating. Highly recommend for families.',
  'Good hotel overall. The room was clean and comfortable. Location was convenient. A few minor issues but nothing major.',
  'Decent stay. The hotel met our basic needs. Room was a bit small but clean. Staff was friendly. Good value for the price.',
  'Average experience. The hotel was okay but nothing special. Room was clean but dated. Service was acceptable.',
  'The hotel needs some updates. Room was clean but furniture was old. Staff was friendly but service was slow at times.',
  'Disappointing stay. The room was not as advertised. Several maintenance issues. Staff tried to help but couldn\'t resolve all problems.',
  'Below our expectations. The hotel photos online looked much better than reality. Room was smaller than expected. Noise from the street was an issue.'
];

const customerNames = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Jessica Martinez', 'James Anderson', 'Jennifer Taylor', 'Robert Thomas', 'Mary Jackson',
  'William White', 'Linda Harris', 'Richard Martin', 'Patricia Thompson', 'Charles Garcia',
  'Barbara Rodriguez', 'Joseph Martinez', 'Susan Robinson', 'Thomas Clark', 'Karen Lewis',
  'Christopher Lee', 'Nancy Walker', 'Daniel Hall', 'Lisa Allen', 'Matthew Young',
  'Betty King', 'Anthony Wright', 'Sandra Lopez', 'Mark Hill', 'Ashley Scott',
  'Donald Green', 'Donna Adams', 'Paul Baker', 'Carol Nelson', 'Steven Carter',
  'Michelle Mitchell', 'Andrew Perez', 'Kimberly Roberts', 'Joshua Turner', 'Elizabeth Phillips',
  'Kevin Campbell', 'Helen Parker', 'Brian Evans', 'Deborah Edwards', 'George Collins',
  'Laura Stewart', 'Edward Sanchez', 'Rebecca Morris', 'Ronald Rogers', 'Sharon Reed'
];

// Generate SQL
let sql = '-- Seed 100 Hotels with Rooms and Availability\n\n';

// First, create companies and agents
sql += '-- Create companies\n';
const companyIds = [];
for (let i = 1; i <= 10; i++) {
  const companyId = uuidv4();
  companyIds.push(companyId);
  sql += `INSERT INTO companies (id, name, service_type, email, phone, is_active, created_at, updated_at) VALUES ('${companyId}', 'Hotel Group ${i}', 'HOTEL', 'contact@hotelgroup${i}.com', '+966-555-000${i.toString().padStart(3, '0')}', 1, NOW(), NOW());\n`;
}

sql += '\n-- Create agents\n';
const agentIds = [];
for (let i = 1; i <= 20; i++) {
  const userId = uuidv4();
  const agentId = uuidv4();
  const companyId = companyIds[i % companyIds.length];
  agentIds.push({ id: agentId, companyId });
  
  // Create user first
  sql += `INSERT INTO users (id, email, password_hash, first_name, last_name, role, company_id, service_type, is_active, created_at, updated_at) VALUES ('${userId}', 'agent${i}@hotels.com', '$2a$10$wSoqCt85d1SOgnsFusz8FudJtYMndBO6LdYoBP3ccYnyKzLAhnJxW', 'Agent', '${i}', 'AGENT', '${companyId}', 'HOTEL', 1, NOW(), NOW());\n`;
  
  // Create agent record
  sql += `INSERT INTO agents (id, user_id, company_id, service_type, name, email, phone, status, commission_rate, created_at, updated_at) VALUES ('${agentId}', '${userId}', '${companyId}', 'HOTEL', 'Agent ${i}', 'agent${i}@hotels.com', '+966-555-${i.toString().padStart(6, '0')}', 'ACTIVE', 10.00, NOW(), NOW());\n`;
}

sql += '\n-- Create 100 hotels\n';
const hotelIds = [];

for (let i = 0; i < 100; i++) {
  const hotelId = uuidv4();
  hotelIds.push(hotelId);
  
  const agent = agentIds[i % agentIds.length];
  const city = cities[i % cities.length];
  const hotelName = `${hotelNames[i % hotelNames.length]} ${city.name}`;
  const starRating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
  const totalRooms = Math.floor(Math.random() * 100) + 50; // 50-150 rooms
  const avgRating = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0
  const totalReviews = Math.floor(Math.random() * 500) + 50;
  
  sql += `INSERT INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, star_rating, total_rooms, average_rating, total_reviews, created_at, updated_at) VALUES ('${hotelId}', '${agent.companyId}', '${agent.id}', '${hotelName}', 'Experience luxury and comfort at ${hotelName}. Located in the heart of ${city.name}, we offer world-class amenities and exceptional service.', 'ACTIVE', '${Math.floor(Math.random() * 999) + 1} Main Street', '${city.name}', '${city.state}', '${city.country}', '${Math.floor(Math.random() * 90000) + 10000}', ${starRating}, ${totalRooms}, ${avgRating}, ${totalReviews}, NOW(), NOW());\n`;
}

sql += '\n-- Create room types for each hotel\n';
const roomTypeIds = [];

hotelIds.forEach((hotelId, hotelIndex) => {
  const numRoomTypes = Math.floor(Math.random() * 3) + 3; // 3-5 room types per hotel
  
  for (let i = 0; i < numRoomTypes; i++) {
    const roomTypeId = uuidv4();
    roomTypeIds.push({ id: roomTypeId, hotelId });
    
    const type = roomTypes[i % roomTypes.length];
    const capacity = Math.floor(Math.random() * 3) + 2; // 2-4 people
    const basePrice = (Math.random() * 300 + 100).toFixed(2); // $100-$400
    const totalRooms = Math.floor(Math.random() * 20) + 5; // 5-25 rooms per type
    const availableRooms = Math.floor(totalRooms * 0.7); // 70% available
    
    sql += `INSERT INTO room_types (id, hotel_id, name, description, capacity, base_price, total_rooms, available_rooms, status, created_at, updated_at) VALUES ('${roomTypeId}', '${hotelId}', '${type} Room', 'Comfortable ${type.toLowerCase()} room with modern amenities and beautiful views.', ${capacity}, ${basePrice}, ${totalRooms}, ${availableRooms}, 'ACTIVE', NOW(), NOW());\n`;
  }
});

sql += '\n-- Add hotel amenities\n';
const amenities = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Room Service', 'Concierge', 'Business Center'];

hotelIds.forEach(hotelId => {
  const numAmenities = Math.floor(Math.random() * 5) + 5; // 5-10 amenities per hotel
  const selectedAmenities = amenities.sort(() => 0.5 - Math.random()).slice(0, numAmenities);
  
  selectedAmenities.forEach(amenity => {
    sql += `INSERT INTO hotel_amenities (hotel_id, amenity_name, is_available) VALUES ('${hotelId}', '${amenity}', 1);\n`;
  });
});

sql += '\n-- Add hotel images\n';
hotelIds.forEach((hotelId, index) => {
  const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images per hotel
  
  for (let i = 0; i < numImages; i++) {
    sql += `INSERT INTO hotel_images (hotel_id, image_url, display_order) VALUES ('${hotelId}', '/images/hotels/hotel-${(index % 20) + 1}-${i + 1}.jpg', ${i});\n`;
  }
});

sql += '\n-- Create customer users for reviews\n';
const customerIds = [];
for (let i = 0; i < 50; i++) {
  const customerId = uuidv4();
  customerIds.push(customerId);
  const name = customerNames[i];
  const [firstName, lastName] = name.split(' ');
  
  sql += `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at) VALUES ('${customerId}', '${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com', '$2a$10$wSoqCt85d1SOgnsFusz8FudJtYMndBO6LdYoBP3ccYnyKzLAhnJxW', '${firstName}', '${lastName}', 'CUSTOMER', 1, NOW(), NOW());\n`;
}

sql += '\n-- Create reviews for hotels (10-50 reviews each)\n';
let totalReviews = 0;

hotelIds.forEach((hotelId, hotelIndex) => {
  const agent = agentIds[hotelIndex % agentIds.length];
  const numReviews = Math.floor(Math.random() * 41) + 10; // 10-50 reviews per hotel
  
  for (let i = 0; i < numReviews; i++) {
    const reviewId = uuidv4();
    const bookingId = uuidv4(); // Fake booking ID
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    
    // Rating distribution: more 4-5 stars, fewer 1-2 stars
    const rand = Math.random();
    let rating;
    if (rand < 0.5) rating = 5;
    else if (rand < 0.75) rating = 4;
    else if (rand < 0.9) rating = 3;
    else if (rand < 0.97) rating = 2;
    else rating = 1;
    
    // Select appropriate title and comment based on rating
    let titleIndex, commentIndex;
    if (rating >= 4) {
      titleIndex = Math.floor(Math.random() * 12); // Positive titles
      commentIndex = Math.floor(Math.random() * 10); // Positive comments
    } else if (rating === 3) {
      titleIndex = Math.floor(Math.random() * 8) + 12; // Neutral titles
      commentIndex = Math.floor(Math.random() * 3) + 10; // Neutral comments
    } else {
      titleIndex = Math.floor(Math.random() * 8) + 20; // Negative titles
      commentIndex = Math.floor(Math.random() * 3) + 13; // Negative comments
    }
    
    const title = reviewTitles[titleIndex];
    const comment = reviewComments[commentIndex];
    
    // Random date in the past 6 months
    const daysAgo = Math.floor(Math.random() * 180);
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - daysAgo);
    const reviewDateStr = reviewDate.toISOString().slice(0, 19).replace('T', ' ');
    
    // Review criteria (ratings for different aspects)
    const cleanliness = Math.max(1, Math.min(5, rating + (Math.random() - 0.5)));
    const comfort = Math.max(1, Math.min(5, rating + (Math.random() - 0.5)));
    const service = Math.max(1, Math.min(5, rating + (Math.random() - 0.5)));
    const amenities = Math.max(1, Math.min(5, rating + (Math.random() - 0.5)));
    const valueForMoney = Math.max(1, Math.min(5, rating + (Math.random() - 0.5)));
    const location = Math.max(1, Math.min(5, rating + (Math.random() - 0.5)));
    
    const criteriaJson = JSON.stringify({
      cleanliness: Math.round(cleanliness),
      comfort: Math.round(comfort),
      service: Math.round(service),
      amenities: Math.round(amenities),
      valueForMoney: Math.round(valueForMoney),
      location: Math.round(location)
    }).replace(/"/g, '\\"');
    
    const status = Math.random() > 0.1 ? 'APPROVED' : 'PENDING'; // 90% approved
    const isVerified = Math.random() > 0.2 ? 1 : 0; // 80% verified
    const helpfulCount = Math.floor(Math.random() * 50); // 0-50 helpful votes
    
    sql += `INSERT INTO reviews (id, booking_id, company_id, customer_id, service_type, rating, title, comment, criteria, status, is_verified, helpful_count, created_at, updated_at) VALUES ('${reviewId}', '${bookingId}', '${agent.companyId}', '${customerId}', 'HOTEL', ${rating}, '${title}', '${comment}', '${criteriaJson}', '${status}', ${isVerified}, ${helpfulCount}, '${reviewDateStr}', '${reviewDateStr}');\n`;
    
    totalReviews++;
  }
});

console.log('✅ Generated SQL for 100 hotels with rooms and availability');
console.log(`📊 Stats:`);
console.log(`   - Companies: ${companyIds.length}`);
console.log(`   - Agents: ${agentIds.length}`);
console.log(`   - Customers: ${customerIds.length}`);
console.log(`   - Hotels: ${hotelIds.length}`);
console.log(`   - Room Types: ${roomTypeIds.length}`);
console.log(`   - Hotel Amenities: ~${hotelIds.length * 7}`);
console.log(`   - Hotel Images: ~${hotelIds.length * 4}`);
console.log(`   - Reviews: ${totalReviews}`);

// Write to file
fs.writeFileSync(__dirname + '/seed-hotels-complete.sql', sql);
console.log('\n💾 Saved to: service/database/seed-hotels-complete.sql');
