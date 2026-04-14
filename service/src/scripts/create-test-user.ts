import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'booking_user',
    password: process.env.DB_PASSWORD || 'booking_password',
    database: process.env.DB_NAME || 'booking_platform'
  });

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Insert test user
    await connection.execute(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      ['admin-001', 'Admin', 'User', 'admin@bookingplatform.com', passwordHash, 'SUPER_ADMIN', true]
    );

    console.log('✅ Test user created successfully!');
    console.log('Email: admin@bookingplatform.com');
    console.log('Password: password123');
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

createTestUser();
