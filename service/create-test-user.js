const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'booking_user',
    password: 'booking_password',
    database: 'booking_platform'
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
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await connection.end();
  }
}

createTestUser();
