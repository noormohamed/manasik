-- Create a standard customer user for testing
-- Email: customer@example.com
-- Password: Password123! (hashed with bcrypt)
-- Role: CUSTOMER

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
) VALUES (
  UUID(),
  'John',
  'Doe',
  'customer@example.com',
  '$2b$10$YourHashedPasswordHere',
  'CUSTOMER',
  TRUE,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  updated_at = NOW();

-- Note: The password_hash above is a placeholder
-- You need to generate the actual bcrypt hash for "Password123!"
-- Use this command to generate it:
-- node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('Password123!', 10))"
