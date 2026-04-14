#!/usr/bin/env node

const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'booking_platform',
  port: 3306,
};

async function seedData() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('Starting platform data seed...\n');

    // Get all customer IDs
    const [customers] = await connection.execute(
      'SELECT id FROM users WHERE role = ? ORDER BY id LIMIT 50',
      ['CUSTOMER']
    );

    // Get all company admin IDs
    const [companyAdmins] = await connection.execute(
      'SELECT id FROM users WHERE role = ? ORDER BY id LIMIT 5',
      ['COMPANY_ADMIN']
    );

    // Get all agent IDs
    const [agents] = await connection.execute(
      'SELECT id FROM users WHERE role = ? ORDER BY id LIMIT 10',
      ['AGENT']
    );

    console.log(`Found ${customers.length} customers, ${companyAdmins.length} company admins, ${agents.length} agents\n`);

    // Create companies
    console.log('Creating 5 companies...');
    const companies = [];
    const companyNames = ['Luxury Hotels International', 'Grand Stay Hotels', 'City Hotels Group', 'Beach Resorts & Spa', 'Mountain Lodge Collection'];
    
    for (let i = 0; i < 5; i++) {
      const id = `comp-${String(i + 1).padStart(3, '0')}`;
      const name = companyNames[i];
      companies.push(id);
      
      try {
        await connection.execute(
          'INSERT IGNORE INTO companies (id, name, service_type, description, email, phone, city, country, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, name, 'HOTEL', `${name} - Premium hotel chain`, `info@${name.toLowerCase().replace(/\s+/g, '')}.com`, '+1-800-HOTELS', 'New York', 'United States', 1, 1]
        );
      } catch (err) {
        console.log(`  Company ${id} already exists, skipping...`);
      }
    }

    // Create agents
    console.log('Creating 10 agents...');
    const agentIds = [];
    for (let i = 0; i < 10; i++) {
      const id = `agent-${String(i + 1).padStart(3, '0')}`;
      const userId = agents[i % agents.length].id;
      const companyId = companies[i % companies.length];
      agentIds.push(id);
      
      try {
        await connection.execute(
          'INSERT IGNORE INTO agents (id, user_id, company_id, service_type, name, email, phone, status, commission_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, companyId, 'HOTEL', `Agent ${i + 1}`, `agent${i + 1}@bookingplatform.com`, '+1-800-AGENT', 'ACTIVE', 10.0]
        );
      } catch (err) {
        console.log(`  Agent ${id} already exists, skipping...`);
      }
    }

    // Create hotels
    console.log('Creating 20 hotels...');
    const hotels = [];
    const hotelNames = ['Grand Plaza', 'Riverside Inn', 'Ocean View', 'Downtown Suites', 'Luxury Tower', 'Business Hotel', 'Resort Paradise', 'City Center', 'Airport Hotel', 'Beach Club', 'Mountain Retreat', 'Historic Manor', 'Modern Lofts', 'Boutique Inn', 'Premium Suites', 'Executive Plaza', 'Comfort Inn', 'Deluxe Resort', 'Urban Hotel', 'Countryside Lodge'];
    
    for (let i = 0; i < 20; i++) {
      const id = `hotel-${String(i + 1).padStart(3, '0')}`;
      const companyId = companies[i % companies.length];
      const agentId = agentIds[i % agentIds.length];
      const name = hotelNames[i];
      hotels.push(id);
      
      try {
        await connection.execute(
          'INSERT IGNORE INTO hotels (id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, star_rating, total_rooms, average_rating, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, companyId, agentId, name, `${name} - A wonderful hotel experience`, 'ACTIVE', `${i + 1} Main Street`, 'New York', 'NY', 'United States', `1000${i}`, 3 + (i % 3), 50 + (i * 10), 4.0 + (i % 10) / 10, 10 + (i * 5)]
        );
      } catch (err) {
        console.log(`  Hotel ${id} already exists, skipping...`);
      }
    }

    // Create bookings
    console.log('Creating 50 bookings...');
    const bookings = [];
    const statuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'];
    
    for (let i = 0; i < 50; i++) {
      const id = `booking-${String(i + 1).padStart(4, '0')}`;
      const customerId = customers[i % customers.length].id;
      const hotelId = hotels[i % hotels.length];
      const companyId = companies[i % companies.length];
      const status = statuses[i % statuses.length];
      const checkInDate = new Date(2026, 3, 1 + (i % 28));
      const checkOutDate = new Date(checkInDate.getTime() + (2 + (i % 5)) * 24 * 60 * 60 * 1000);
      const subtotal = 100 + (i * 50);
      const tax = Math.round(subtotal * 0.1);
      const total = subtotal + tax;
      
      const metadata = JSON.stringify({
        hotelId,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      });
      
      bookings.push(id);
      
      try {
        await connection.execute(
          'INSERT INTO bookings (id, customer_id, company_id, service_type, status, subtotal, tax, total, currency, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, customerId, companyId, 'HOTEL', status, subtotal, tax, total, 'USD', metadata, new Date()]
        );
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  Booking ${id} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    // Create reviews
    console.log('Creating 40 reviews...');
    const ratings = [5, 5, 4, 4, 4, 3, 5, 4, 5, 3];
    const titles = ['Excellent!', 'Great stay', 'Amazing', 'Good value', 'Comfortable', 'Average', 'Outstanding', 'Highly recommended', 'Perfect', 'Wonderful'];
    const comments = [
      'Excellent service and beautiful rooms!',
      'Great location and friendly staff',
      'Amazing experience, will come back',
      'Good value for money',
      'Comfortable and clean',
      'Average experience',
      'Outstanding hospitality',
      'Highly recommended',
      'Perfect for business travel',
      'Wonderful vacation spot'
    ];
    
    for (let i = 0; i < 40; i++) {
      const id = `review-${String(i + 1).padStart(4, '0')}`;
      const customerId = customers[i % customers.length].id;
      const companyId = companies[i % companies.length];
      const bookingId = bookings[i % bookings.length];
      const rating = ratings[i % ratings.length];
      const title = titles[i % titles.length];
      const comment = comments[i % comments.length];
      
      try {
        await connection.execute(
          'INSERT INTO reviews (id, customer_id, company_id, booking_id, service_type, rating, title, comment, status, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, customerId, companyId, bookingId, 'HOTEL', rating, title, comment, 'APPROVED', 1, new Date()]
        );
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  Review ${id} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('  - 5 Companies');
    console.log('  - 20 Hotels');
    console.log('  - 50 Bookings');
    console.log('  - 40 Reviews');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
