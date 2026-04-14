/**
 * Comprehensive Seed Data Script
 * Populates all tables with realistic data for testing
 */

const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'booking_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const generateId = (prefix, index) => `${prefix}-${String(index).padStart(4, '0')}`;

async function seedData() {
  const connection = await pool.getConnection();

  try {
    console.log('🌱 Starting comprehensive data seeding...\n');

    // 1. Get existing data counts
    const [roomTypes] = await connection.query('SELECT COUNT(*) as count FROM room_types');
    const [hotels] = await connection.query('SELECT COUNT(*) as count FROM hotels');
    const [bookings] = await connection.query('SELECT COUNT(*) as count FROM bookings');
    const [agents] = await connection.query('SELECT COUNT(*) as count FROM agents');
    const [companies] = await connection.query('SELECT COUNT(*) as count FROM companies');

    const hotelTotal = hotels[0].count;
    const bookingTotal = bookings[0].count;
    const agentTotal = agents[0].count;
    const companyTotal = companies[0].count;

    // 2. Seed Room Amenities (linked to room types)
    console.log('📝 Seeding room amenities...');
    const roomAmenities = [
      'WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Desk', 'Shower', 'Bathtub',
      'Hairdryer', 'Iron', 'Coffee Maker', 'Microwave', 'Refrigerator', 'Balcony', 'City View'
    ];

    let roomAmenityCount = 0;
    const [existingRoomTypes] = await connection.query('SELECT id FROM room_types LIMIT 5');
    
    for (const roomType of existingRoomTypes) {
      for (let i = 0; i < 3; i++) {
        const amenity = roomAmenities[Math.floor(Math.random() * roomAmenities.length)];
        try {
          await connection.query(
            'INSERT IGNORE INTO room_amenities (room_type_id, amenity_name, is_available) VALUES (?, ?, 1)',
            [roomType.id, amenity]
          );
          roomAmenityCount++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`✅ Room amenities: ${roomAmenityCount}`);

    // 3. Seed Hotel Amenities
    console.log('📝 Seeding hotel amenities...');
    const hotelAmenities = [
      'Swimming Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Parking', 'Concierge',
      'Room Service', '24/7 Front Desk', 'Business Center', 'Conference Rooms', 'Laundry Service'
    ];

    let hotelAmenityCount = 0;
    const [existingHotels] = await connection.query('SELECT id FROM hotels LIMIT 20');
    
    for (const hotel of existingHotels) {
      for (let i = 0; i < 4; i++) {
        const amenity = hotelAmenities[Math.floor(Math.random() * hotelAmenities.length)];
        try {
          await connection.query(
            'INSERT IGNORE INTO hotel_amenities (hotel_id, amenity_name, is_available) VALUES (?, ?, 1)',
            [hotel.id, amenity]
          );
          hotelAmenityCount++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`✅ Hotel amenities: ${hotelAmenityCount}`);

    // 4. Seed Hotel Facilities
    console.log('📝 Seeding hotel facilities...');
    const facilities = [
      'Elevator', 'Wheelchair Access', 'Pet Friendly', 'Smoking Area', 'Non-Smoking Rooms',
      'Emergency Exit', 'Fire Extinguisher', 'First Aid Kit'
    ];

    let hotelFacilityCount = 0;
    for (const hotel of existingHotels) {
      for (let i = 0; i < 3; i++) {
        const facility = facilities[Math.floor(Math.random() * facilities.length)];
        try {
          await connection.query(
            'INSERT IGNORE INTO hotel_facilities (hotel_id, facility_name) VALUES (?, ?)',
            [hotel.id, facility]
          );
          hotelFacilityCount++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`✅ Hotel facilities: ${hotelFacilityCount}`);

    // 5. Seed Room Facilities
    console.log('📝 Seeding room facilities...');
    const roomFacilities = [
      'Bathroom', 'Kitchen', 'Living Area', 'Bedroom', 'Balcony', 'Terrace'
    ];

    let roomFacilityCount = 0;
    for (const roomType of existingRoomTypes) {
      for (let i = 0; i < 2; i++) {
        const facility = roomFacilities[Math.floor(Math.random() * roomFacilities.length)];
        try {
          await connection.query(
            'INSERT IGNORE INTO room_facilities (room_type_id, facility_name) VALUES (?, ?)',
            [roomType.id, facility]
          );
          roomFacilityCount++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`✅ Room facilities: ${roomFacilityCount}`);

    // 6. Seed Hotel Images
    console.log('📝 Seeding hotel images...');
    let hotelImageCount = 0;
    for (const hotel of existingHotels) {
      for (let j = 1; j <= 3; j++) {
        try {
          await connection.query(
            'INSERT IGNORE INTO hotel_images (hotel_id, image_url, display_order) VALUES (?, ?, ?)',
            [
              hotel.id,
              `https://images.unsplash.com/photo-${1500000000 + Math.random() * 1000000}?w=800`,
              j
            ]
          );
          hotelImageCount++;
        } catch (e) {
          // Ignore errors
        }
      }
    }
    console.log(`✅ Hotel images: ${hotelImageCount}`);

    // 7. Seed Room Images
    console.log('📝 Seeding room images...');
    let roomImageCount = 0;
    for (const roomType of existingRoomTypes) {
      for (let j = 1; j <= 2; j++) {
        try {
          await connection.query(
            'INSERT IGNORE INTO room_images (room_type_id, image_url, display_order) VALUES (?, ?, ?)',
            [
              roomType.id,
              `https://images.unsplash.com/photo-${1600000000 + Math.random() * 1000000}?w=800`,
              j
            ]
          );
          roomImageCount++;
        } catch (e) {
          // Ignore errors
        }
      }
    }
    console.log(`✅ Room images: ${roomImageCount}`);

    // 8. Seed Hotel Landmarks
    console.log('📝 Seeding hotel landmarks...');
    const landmarks = [
      'Eiffel Tower', 'Big Ben', 'Statue of Liberty', 'Colosseum', 'Great Wall',
      'Taj Mahal', 'Christ the Redeemer', 'Machu Picchu', 'Stonehenge', 'Pyramids'
    ];

    let landmarkCount = 0;
    for (let i = 0; i < Math.min(existingHotels.length, 10); i++) {
      const hotel = existingHotels[i];
      const landmark = landmarks[i % landmarks.length];
      try {
        await connection.query(
          'INSERT IGNORE INTO hotel_landmarks (hotel_id, landmark_name, distance_km, landmark_type) VALUES (?, ?, ?, ?)',
          [hotel.id, landmark, Math.random() * 10, 'attraction']
        );
        landmarkCount++;
      } catch (e) {
        // Ignore errors
      }
    }
    console.log(`✅ Hotel landmarks: ${landmarkCount}`);

    // 9. Seed Hotel Surroundings
    console.log('📝 Seeding hotel surroundings...');
    let surroundingCount = 0;
    for (let i = 0; i < Math.min(existingHotels.length, 15); i++) {
      const hotel = existingHotels[i];
      try {
        await connection.query(
          `INSERT IGNORE INTO hotel_surroundings (hotel_id, restaurants_nearby, cafes_nearby, top_attractions, natural_beauty, public_transport, closest_airport_km)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [hotel.id, 1, 1, 1, Math.random() > 0.5 ? 1 : 0, 1, Math.random() * 50]
        );
        surroundingCount++;
      } catch (e) {
        // Ignore errors
      }
    }
    console.log(`✅ Hotel surroundings: ${surroundingCount}`);

    // 10. Seed Checkout Sessions
    console.log('📝 Seeding checkout sessions...');
    let sessionCount = 0;
    const [existingBookings] = await connection.query('SELECT id, customer_id FROM bookings LIMIT 30');
    
    for (const booking of existingBookings) {
      try {
        const sessionId = uuidv4();
        await connection.query(
          `INSERT IGNORE INTO checkout_sessions (id, sessionId, customerId, bookingItems, subtotal, totalTax, finalTotal, currency, status, expiresAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
          [
            uuidv4(),
            sessionId,
            booking.customer_id,
            JSON.stringify([{ type: 'hotel', quantity: 1, price: 100 }]),
            100,
            10,
            110,
            'GBP',
            'ACTIVE'
          ]
        );
        sessionCount++;
      } catch (e) {
        // Ignore errors
      }
    }
    console.log(`✅ Checkout sessions: ${sessionCount}`);

    // 11. Seed Checkouts
    console.log('📝 Seeding checkouts...');
    let checkoutCount = 0;
    for (let i = 0; i < Math.min(existingBookings.length, 25); i++) {
      const booking = existingBookings[i];
      try {
        await connection.query(
          `INSERT IGNORE INTO checkouts (id, customerId, bookingItems, subtotal, totalTax, finalTotal, currency, status, expiresAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
          [
            uuidv4(),
            booking.customer_id,
            JSON.stringify([{ type: 'hotel', quantity: 1, price: 100 }]),
            100,
            10,
            110,
            'GBP',
            ['COMPLETED', 'ACTIVE', 'ABANDONED'][i % 3]
          ]
        );
        checkoutCount++;
      } catch (e) {
        // Ignore errors
      }
    }
    console.log(`✅ Checkouts: ${checkoutCount}`);

    // 12. Seed Bank Details
    console.log('📝 Seeding bank details...');
    let bankCount = 0;
    const [existingCompanies] = await connection.query('SELECT id FROM companies');
    
    for (let i = 0; i < existingCompanies.length; i++) {
      const company = existingCompanies[i];
      try {
        await connection.query(
          `INSERT IGNORE INTO bank_details (agent_id, account_holder, account_number, routing_number)
           VALUES (?, ?, ?, ?)`,
          [
            company.id,
            `Company ${i + 1} Account`,
            `ACC${String(i + 1).padStart(10, '0')}`,
            `ROUTE${String(i + 1).padStart(6, '0')}`
          ]
        );
        bankCount++;
      } catch (e) {
        // Ignore errors
      }
    }
    console.log(`✅ Bank details: ${bankCount}`);

    // 13. Seed Agent Documents
    console.log('📝 Seeding agent documents...');
    let docCount = 0;
    const [existingAgents] = await connection.query('SELECT id FROM agents');
    
    for (const agent of existingAgents) {
      for (let j = 1; j <= 2; j++) {
        try {
          await connection.query(
            `INSERT IGNORE INTO agent_documents (agent_id, document_type, document_url, is_verified)
             VALUES (?, ?, ?, 1)`,
            [
              agent.id,
              ['BUSINESS_LICENSE', 'TAX_ID', 'IDENTITY_PROOF'][j % 3],
              `https://documents.example.com/agent-${agent.id}-doc-${j}.pdf`
            ]
          );
          docCount++;
        } catch (e) {
          // Ignore errors
        }
      }
    }
    console.log(`✅ Agent documents: ${docCount}`);

    console.log('\n✅ Comprehensive data seeding completed successfully!');
    console.log('\n📊 Final Data Summary:');
    console.log('  • Room Amenities: ' + roomAmenityCount);
    console.log('  • Hotel Amenities: ' + hotelAmenityCount);
    console.log('  • Hotel Facilities: ' + hotelFacilityCount);
    console.log('  • Room Facilities: ' + roomFacilityCount);
    console.log('  • Hotel Images: ' + hotelImageCount);
    console.log('  • Room Images: ' + roomImageCount);
    console.log('  • Hotel Landmarks: ' + landmarkCount);
    console.log('  • Hotel Surroundings: ' + surroundingCount);
    console.log('  • Checkout Sessions: ' + sessionCount);
    console.log('  • Checkouts: ' + checkoutCount);
    console.log('  • Bank Details: ' + bankCount);
    console.log('  • Agent Documents: ' + docCount);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedData();
