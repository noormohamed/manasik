# Database Setup Guide

## Overview

The booking platform uses MySQL 8.0 with Docker for easy setup and development.

## Quick Start

### 1. Start MySQL with Docker

```bash
docker-compose up -d
```

This will:
- Start MySQL server on port 3306
- Create the `booking_platform` database
- Create user `booking_user` with password `booking_password`
- Initialize all tables from `database/init.sql`
- Start phpMyAdmin on port 8080

### 2. Verify Connection

```bash
# Check if MySQL is running
docker ps | grep booking_mysql

# Connect to MySQL
mysql -h localhost -u booking_user -p booking_password booking_platform
```

### 3. Access phpMyAdmin

Open browser and go to: `http://localhost:8080`

- Username: `booking_user`
- Password: `booking_password`

## Database Schema

### Core Tables

#### users
- Stores all users (customers, agents, admins)
- Fields: id, first_name, last_name, email, password_hash, role, company_id, service_type, is_active
- Indexes: email, role, company_id

#### companies
- Service provider organizations
- Fields: id, name, service_type, description, logo, website, email, phone, address, city, country, is_verified, is_active
- Indexes: service_type, is_active

#### agents
- Individual service providers
- Fields: id, user_id, company_id, service_type, name, email, phone, status, commission_rate, total_bookings, total_revenue, average_rating, total_reviews
- Indexes: company_id, status, service_type

#### company_admins
- Company administrators
- Fields: id, user_id, company_id, admin_role, name, email, phone, is_active
- Indexes: company_id, admin_role

#### permissions
- Admin permissions
- Fields: id, admin_id, permission_name
- Unique: admin_id + permission_name

### Hotel Tables

#### hotels
- Hotel properties
- Fields: id, company_id, agent_id, name, description, status, address, city, state, country, zip_code, latitude, longitude, star_rating, total_rooms, check_in_time, check_out_time, cancellation_policy, average_rating, total_reviews
- Indexes: company_id, agent_id, status, city, country

#### hotel_amenities
- Hotel amenities
- Fields: id, hotel_id, amenity_name, is_available
- Unique: hotel_id + amenity_name

#### hotel_images
- Hotel images
- Fields: id, hotel_id, image_url, display_order

#### room_types
- Room categories
- Fields: id, hotel_id, name, description, capacity, total_rooms, available_rooms, base_price, currency, status
- Indexes: hotel_id, status

#### room_amenities
- Room amenities
- Fields: id, room_type_id, amenity_name, is_available
- Unique: room_type_id + amenity_name

#### room_images
- Room images
- Fields: id, room_type_id, image_url, display_order

### Booking & Review Tables

#### bookings
- All bookings across services
- Fields: id, company_id, customer_id, service_type, status, currency, subtotal, tax, total, metadata (JSON)
- Indexes: company_id, customer_id, status, service_type, created_at

#### reviews
- All reviews across services
- Fields: id, booking_id, company_id, customer_id, service_type, rating, title, comment, criteria (JSON), status, is_verified, helpful_count
- Indexes: company_id, customer_id, status, service_type, rating

### Agent Tables

#### bank_details
- Agent bank information
- Fields: id, agent_id, account_holder, account_number, routing_number

#### agent_documents
- Agent verification documents
- Fields: id, agent_id, document_type, document_url, is_verified

## Environment Variables

Create a `.env` file in the service directory:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_platform

# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h

# Other services
ELASTICSEARCH_HOST=localhost:9200
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Repository Pattern

### Base Repository

All repositories extend `BaseRepository<T>` which provides:

```typescript
// CRUD operations
create(data: T): Promise<T>
findById(id: string): Promise<T | null>
findAll(limit?: number, offset?: number): Promise<T[]>
update(id: string, data: Partial<T>): Promise<T | null>
delete(id: string): Promise<boolean>

// Utility methods
count(whereClause?: string, params?: any[]): Promise<number>
query<R>(sql: string, params?: any[]): Promise<R[]>
queryOne<R>(sql: string, params?: any[]): Promise<R | null>
```

### Using Repositories

```typescript
import { getUserRepository, getCompanyRepository } from '@/database/repositories';

// Get user by email
const userRepo = getUserRepository();
const user = await userRepo.findByEmail('user@example.com');

// Find companies by service type
const companyRepo = getCompanyRepository();
const hotels = await companyRepo.findByServiceType('HOTEL', 10, 0);

// Find agents by company
const agentRepo = getAgentRepository();
const agents = await agentRepo.findByCompany('comp-123', 10, 0);
```

### Hotel Repositories

```typescript
import { getHotelRepository, getRoomTypeRepository } from '@/features/hotel/repositories';

// Find hotels by city
const hotelRepo = getHotelRepository();
const hotels = await hotelRepo.findByCity('New York', 10, 0);

// Find available room types
const roomRepo = getRoomTypeRepository();
const rooms = await roomRepo.findAvailableByHotel('hotel-123', 10, 0);

// Reserve rooms
const reserved = await roomRepo.decreaseAvailableRooms('room-type-123', 2);
```

## Database Migrations

Currently, migrations are handled by the `database/init.sql` file which is run on container startup.

For future migrations:

1. Create a new SQL file in `database/migrations/`
2. Add it to the docker-compose volume
3. Or run manually:

```bash
mysql -h localhost -u booking_user -p booking_password booking_platform < database/migrations/001_add_new_table.sql
```

## Backup & Restore

### Backup Database

```bash
docker exec booking_mysql mysqldump -u booking_user -p booking_password booking_platform > backup.sql
```

### Restore Database

```bash
docker exec -i booking_mysql mysql -u booking_user -p booking_password booking_platform < backup.sql
```

## Troubleshooting

### Connection Refused

```bash
# Check if MySQL is running
docker ps | grep booking_mysql

# Check logs
docker logs booking_mysql

# Restart MySQL
docker-compose restart mysql
```

### Database Not Created

```bash
# Check if init.sql was executed
docker exec booking_mysql mysql -u booking_user -p booking_password -e "SHOW DATABASES;"

# Manually run init script
docker exec -i booking_mysql mysql -u booking_user -p booking_password < database/init.sql
```

### Permission Denied

```bash
# Check user permissions
docker exec booking_mysql mysql -u root -p root_password -e "SHOW GRANTS FOR 'booking_user'@'%';"

# Grant permissions
docker exec booking_mysql mysql -u root -p root_password -e "GRANT ALL PRIVILEGES ON booking_platform.* TO 'booking_user'@'%';"
```

## Performance Tips

1. **Indexes**: All frequently queried columns have indexes
2. **JSON**: Use JSON columns for flexible metadata
3. **Connection Pooling**: Pool size is set to 10 connections
4. **Timestamps**: All tables have created_at and updated_at for auditing

## Next Steps

1. Start MySQL: `docker-compose up -d`
2. Verify connection in code
3. Implement handlers with repository usage
4. Create API routes
5. Add tests

## Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker MySQL Image](https://hub.docker.com/_/mysql)
- [phpMyAdmin](https://www.phpmyadmin.net/)
