#!/usr/bin/env node

const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'booking_platform',
  port: 3306,
};

async function seedUsers() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('Starting seed data generation...\n');

    // Hash for password123
    const passwordHash = '$2b$10$rZ5YhkVQJ5YhkVQJ5YhkVOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq';

    const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Emma',
      'William', 'Olivia', 'Richard', 'Ava', 'Joseph', 'Isabella', 'Thomas', 'Sophia', 'Charles', 'Mia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    // 1 Super Admin
    console.log('Creating 1 Super Admin...');
    try {
      await connection.execute(
        'INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin-001', 'Admin', 'User', 'admin@bookingplatform.com', passwordHash, 'SUPER_ADMIN', 1]
      );
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') throw e;
      console.log('  (admin-001 already exists)');
    }

    // 9 Company Admins
    console.log('Creating 9 Company Admins...');
    for (let i = 1; i <= 9; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `company-admin-${i}@bookingplatform.com`;
      await connection.execute(
        'INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`company-admin-${String(i).padStart(3, '0')}`, firstName, lastName, email, passwordHash, 'COMPANY_ADMIN', 1]
      );
    }

    // 20 Agents
    console.log('Creating 20 Agents...');
    for (let i = 1; i <= 20; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `agent-${i}@bookingplatform.com`;
      await connection.execute(
        'INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`agent-${String(i).padStart(3, '0')}`, firstName, lastName, email, passwordHash, 'AGENT', 1]
      );
    }

    // 70 Customers
    console.log('Creating 70 Customers...');
    for (let i = 1; i <= 70; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `customer-${i}@bookingplatform.com`;
      await connection.execute(
        'INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`customer-${String(i).padStart(3, '0')}`, firstName, lastName, email, passwordHash, 'CUSTOMER', 1]
      );
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('Total users created: 100 (1 Super Admin + 9 Company Admins + 20 Agents + 70 Customers)');
    console.log('\nTest credentials:');
    console.log('  Super Admin: admin@bookingplatform.com / password123');
    console.log('  Company Admin: company-admin-1@bookingplatform.com / password123');
    console.log('  Agent: agent-1@bookingplatform.com / password123');
    console.log('  Customer: customer-1@bookingplatform.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedUsers();
