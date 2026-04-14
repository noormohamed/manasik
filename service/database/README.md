# Database Seed Files

This directory contains SQL scripts for initializing and seeding the booking platform database.

## Files

### `init.sql`
Creates all database tables with proper schema, indexes, and foreign key constraints.

**Tables created:**
- `users` - User accounts (admins, agents, customers)
- `companies` - Service provider companies
- `agents` - Service agents linked to companies
- `company_admins` - Company administrators
- `hotels` - Hotel properties
- `hotel_amenities` - Hotel amenities
- `hotel_images` - Hotel images
- `room_types` - Room type definitions
- `room_amenities` - Room amenities
- `room_images` - Room images
- `bookings` - Customer bookings
- `reviews` - Customer reviews
- `roles` - System roles
- `permissions` - System permissions
- `role_permissions` - Role-permission mappings
- `user_permissions` - User-specific permissions
- `bank_details` - Agent bank information
- `agent_documents` - Agent verification documents
- `checkouts` - Shopping cart sessions
- `checkout_sessions` - Checkout sessions (guest + authenticated)

### `seed.sql`
Seeds basic system data:
- 4 system roles (SUPER_ADMIN, COMPANY_ADMIN, AGENT, CUSTOMER)
- 28 permissions across resources
- Role-permission mappings

### `seed-dummy-data-full.sql`
Comprehensive dummy data for testing and development:
- **1 Super Admin**
- **9 Company Admins** (one per company)
- **20 Agents** (distributed across companies)
- **70 Customers**
- **10 Companies** (hotel chains)
- **50 Hotels** (across 15 global cities)

**Total: 100 users, 10 companies, 50 hotels**

## Usage

### Initialize Database
```bash
mysql -u booking_user -p booking_platform < init.sql
```

### Seed Basic Data
```bash
mysql -u booking_user -p booking_platform < seed.sql
```

### Seed Dummy Data
```bash
mysql -u booking_user -p booking_platform < seed-dummy-data-full.sql
```

### All at Once
```bash
cat init.sql seed.sql seed-dummy-data-full.sql | mysql -u booking_user -p booking_platform
```

## Test Credentials

All users have the same password: `password123`

### Super Admin
- Email: `admin@bookingplatform.com`
- Role: SUPER_ADMIN

### Company Admins (examples)
- Email: `james.wilson@luxuryhotels.com` (Luxury Hotels International)
- Email: `emma.thompson@grandstay.com` (Grand Stay Hotels)

### Agents (examples)
- Email: `michael.j@luxuryhotels.com` (Luxury Hotels International)
- Email: `emily.w@luxuryhotels.com` (Luxury Hotels International)

### Customers (examples)
- Email: `john.smith1@example.com`
- Email: `jane.johnson2@example.com`

## Data Distribution

### Companies by Type
- All 10 companies are HOTEL type
- Distributed across major cities: London, Paris, New York, Tokyo, Dubai, etc.

### Hotels by Location
- 50 hotels across 15 cities
- Cities: London, Paris, New York, Tokyo, Dubai, Singapore, Barcelona, Rome, Sydney, Los Angeles, Amsterdam, Berlin, Bangkok, Istanbul, Hong Kong
- Star ratings: 3-5 stars
- Room capacity: 50-550 rooms per hotel

### Users by Role
- 1 Super Admin (1%)
- 9 Company Admins (9%)
- 20 Agents (20%)
- 70 Customers (70%)

## Regenerating Dummy Data

To regenerate the dummy data with different values:

```bash
node generate-seed-data.js > seed-dummy-data-full.sql
```

You can modify `generate-seed-data.js` to:
- Change the number of users, companies, or hotels
- Add different cities or locations
- Customize hotel names and descriptions
- Add more data types (room types, bookings, reviews)

## Next Steps

To add more dummy data, extend `generate-seed-data.js` with:
- Room types for each hotel (3-5 room types per hotel)
- Bookings (past and upcoming)
- Reviews for completed bookings
- Hotel and room amenities
- Hotel and room images
- Agent documents and bank details

## Database Connection

Default connection details (from `.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_platform
```
