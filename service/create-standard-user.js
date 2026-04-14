#!/usr/bin/env node

/**
 * Create a standard customer user for testing
 * Usage: node create-standard-user.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const credentials = {
  email: 'customer@example.com',
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe'
};

async function createUser() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'booking_user',
      password: process.env.DB_PASSWORD || 'booking_password',
      database: process.env.DB_NAME || 'booking_platform',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log('✓ Connected to database');

    // Hash password
    const passwordHash = await bcrypt.hash(credentials.password, 10);
    console.log('✓ Password hashed');

    // Create user
    const userId = uuidv4();
    const query = `
      INSERT INTO users (
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await connection.execute(query, [
      userId,
      credentials.firstName,
      credentials.lastName,
      credentials.email,
      passwordHash,
      'CUSTOMER',
      true
    ]);

    if (result.affectedRows > 0) {
      console.log('\n✓ Standard user created successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    ' + credentials.email);
      console.log('🔐 Password: ' + credentials.password);
      console.log('👤 Name:     ' + credentials.firstName + ' ' + credentials.lastName);
      console.log('🎯 Role:     CUSTOMER');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('✗ Failed to create user');
    }

    await connection.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

createUser();
