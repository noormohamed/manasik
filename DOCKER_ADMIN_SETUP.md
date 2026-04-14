# Docker Setup for Super Admin Panel

This guide explains how to run the entire platform including the new Super Admin Panel using Docker.

## Architecture

The platform now consists of 4 services running in Docker:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend    │  │  Management  │  │     API      │  │
│  │  (Port 3000) │  │  (Port 3002) │  │  (Port 3001) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │  MySQL 8.0     │                    │
│                    │  (Port 3306)   │                    │
│                    └────────────────┘                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Services

### 1. MySQL Database
- **Image**: mysql:8.0
- **Container**: booking_mysql
- **Port**: 3306
- **Database**: booking_platform
- **User**: booking_user
- **Password**: booking_password

**Initialization Scripts:**
1. `init.sql` - Creates all platform tables
2. `seed.sql` - Seeds roles and permissions
3. `001-add-hotel-filters.sql` - Hotel filter migrations
4. `seed-facilities.sql` - Hotel facilities data

**Tables Used by Admin Panel:**
- `users` - All users (customers, agents, admins)
- `bookings` - All bookings
- `reviews` - All reviews and ratings
- `hotels` - Hotel properties
- `companies` - Service providers
- `agents` - Service agents
- `room_types` - Room types
- `roles` - User roles

### 2. API Service
- **Image**: Node.js/Koa backend
- **Container**: booking_api
- **Port**: 3001
- **Environment**: Development
- **Database**: MySQL (booking_platform)

**Features:**
- Hotel management
- User authentication
- Booking management
- Review management
- Transaction management

### 3. Frontend Service
- **Image**: Next.js customer application
- **Container**: booking_frontend
- **Port**: 3000
- **Environment**: Production (Nginx)

**Features:**
- Hotel search and booking
- User dashboard
- Booking management
- Review submission

### 4. Management Service (NEW)
- **Image**: Next.js admin panel
- **Container**: booking_management
- **Port**: 3002
- **Environment**: Production (Nginx)

**Features:**
- Super admin authentication
- User management
- Booking management
- Review moderation
- Transaction management
- Analytics and reporting
- Audit logging

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### Start All Services

```bash
# From the project root directory
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f management
docker-compose logs -f mysql
```

### Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Customer booking platform |
| Management | http://localhost:3002 | Super admin panel |
| API | http://localhost:3001 | Backend API |
| MySQL | localhost:3306 | Database |

## Database Access

### Connect to MySQL

```bash
# Using docker exec
docker exec -it booking_mysql mysql -u booking_user -p booking_platform

# Password: booking_password

# Or using MySQL client
mysql -h localhost -u booking_user -p booking_platform
```

### View Database Tables

```sql
-- Show all tables
SHOW TABLES;

-- Show admin tables
SHOW TABLES LIKE 'admin%';

-- Show audit logs
SELECT * FROM audit_logs LIMIT 10;

-- Show admin users
SELECT * FROM admin_users;

-- Show admin sessions
SELECT * FROM admin_sessions;
```

## Test Credentials

### Super Admin (for Management Panel)
- **Email**: admin@bookingplatform.com
- **Password**: password123
- **Role**: SUPER_ADMIN

### Company Admin (for Frontend)
- **Email**: james.wilson@luxuryhotels.com
- **Password**: password123
- **Role**: COMPANY_ADMIN

### Customer (for Frontend)
- **Email**: john.smith1@example.com
- **Password**: password123
- **Role**: CUSTOMER

## Common Docker Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api
docker-compose up -d management
docker-compose up -d mysql
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop api

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f management
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100 api

# Follow logs with timestamps
docker-compose logs -f --timestamps api
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build api
docker-compose up -d --build management
```

### Execute Commands in Container
```bash
# Run command in API container
docker exec -it booking_api npm test

# Run command in Management container
docker exec -it booking_management npm test

# Access MySQL shell
docker exec -it booking_mysql mysql -u booking_user -p booking_platform
```

### View Container Status
```bash
# List all containers
docker-compose ps

# View container details
docker inspect booking_api

# View container resource usage
docker stats
```

## Environment Variables

### API Service (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=mysql
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_platform
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### Management Service (docker-compose.yml)
```env
NEXT_PUBLIC_API_URL=http://api:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_JWT_EXPIRY=86400
NEXT_PUBLIC_SESSION_TIMEOUT=86400
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOG=true
```

## Troubleshooting

### MySQL Connection Issues
```bash
# Check MySQL health
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### API Connection Issues
```bash
# Check API health
curl http://localhost:3001/api/health

# View API logs
docker-compose logs api

# Restart API
docker-compose restart api
```

### Management Panel Not Loading
```bash
# Check Management logs
docker-compose logs management

# Verify API is accessible from Management
docker exec booking_management curl http://api:3001/api/health

# Restart Management
docker-compose restart management
```

### Database Initialization Issues
```bash
# Check if tables were created
docker exec booking_mysql mysql -u booking_user -p booking_platform -e "SHOW TABLES;"

# View MySQL initialization logs
docker-compose logs mysql

# Reinitialize database
docker-compose down -v
docker-compose up -d
```

## Performance Optimization

### Database Optimization
```bash
# Connect to MySQL
docker exec -it booking_mysql mysql -u booking_user -p booking_platform

# Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'booking_platform'
ORDER BY size_mb DESC;

# Optimize tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE bookings;
OPTIMIZE TABLE audit_logs;
```

### View Container Resource Usage
```bash
# Real-time resource usage
docker stats

# Specific container
docker stats booking_api booking_management booking_mysql
```

## Production Deployment

For production deployment:

1. Update environment variables in docker-compose.yml
2. Use production-grade database backups
3. Enable SSL/TLS certificates
4. Configure proper logging and monitoring
5. Set up health checks and auto-restart policies
6. Use Docker secrets for sensitive data
7. Configure resource limits for containers
8. Set up log rotation and retention

## Backup and Restore

### Backup Database
```bash
# Backup to file
docker exec booking_mysql mysqldump -u booking_user -p booking_platform > backup.sql

# Backup with password in command
docker exec booking_mysql mysqldump -u booking_user -pbooking_password booking_platform > backup.sql
```

### Restore Database
```bash
# Restore from file
docker exec -i booking_mysql mysql -u booking_user -pbooking_password booking_platform < backup.sql
```

## Next Steps

1. **Phase 1.2**: Implement authentication backend endpoints
2. **Phase 1.3**: Implement authentication frontend
3. **Phase 1.4**: Create admin layout and navigation
4. **Phase 2**: Implement core management features
5. **Phase 3**: Add analytics and reporting
6. **Phase 4**: Add advanced features
7. **Phase 5**: Testing and optimization
8. **Phase 6**: Production deployment

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check database connectivity: `docker exec booking_mysql mysql -u booking_user -p booking_platform -e "SELECT 1;"`
4. Verify API health: `curl http://localhost:3001/api/health`
