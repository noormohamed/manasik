# Deployment Guide for Manasik Booking Platform

## Server Information
- **IP Address**: 46.101.13.38
- **Root Password**: qA94zeJ(u5UKp
- **Services**: API (3001), Frontend (3000), Management (3002)

## Prerequisites
- Docker and Docker Compose installed on the server
- Node.js 18+ installed
- Git installed

## Deployment Steps

### 1. Connect to the Server
```bash
ssh root@46.101.13.38
# Enter password: qA94zeJ(u5UKp
```

### 2. Clone or Update the Repository
```bash
cd /root
git clone https://github.com/yourusername/manasik.git
cd manasik
git pull origin main
```

### 3. Install Dependencies
```bash
# Install service dependencies
cd service
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install management dependencies
cd management
npm install
cd ..
```

### 4. Build Services
```bash
# Build the API service
cd service
npm run build
cd ..
```

### 5. Run Database Migrations
```bash
# Run the latest migrations (includes the hotel table fixes)
cd service
npm run migrate:latest
cd ..
```

### 6. Build Docker Images
```bash
# Build all Docker images
docker build -t manasik-api service/
docker build -t manasik-frontend frontend/
docker build -t manasik-management management/
```

### 7. Start Services with Docker Compose
```bash
# Stop any existing containers
docker-compose down

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 8. Verify Deployment
```bash
# Check API health
curl http://localhost:3001/api/health

# Check if services are running
docker logs booking_api
docker logs booking_frontend
docker logs booking_management
```

## Services URLs
- **API**: http://46.101.13.38:3001
- **Frontend**: http://46.101.13.38:3000
- **Management Panel**: http://46.101.13.38:3002

## Database Migrations Applied
The following migrations have been applied to fix the hotel creation issue:

1. **20260429000000_make_company_id_nullable.ts**: Makes `company_id` nullable in the hotels table
2. **20260429000001_make_agent_id_nullable.ts**: Makes `agent_id` nullable in the hotels table

These changes allow individual users to create hotels without being part of a company or agent system.

## Troubleshooting

### Services not starting
```bash
# Check Docker logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### Database connection issues
```bash
# Check if MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker logs booking_mysql
```

### Port conflicts
If ports 3000, 3001, or 3002 are already in use:
1. Edit `docker-compose.yml` to use different ports
2. Restart the services

## Rollback
If you need to rollback the migrations:
```bash
cd service
npm run migrate:rollback
```

## Environment Variables
Make sure the following environment variables are set in the `.env` file:
- `DB_HOST`: MySQL host (default: mysql)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: MySQL user (default: booking_user)
- `DB_PASSWORD`: MySQL password (default: booking_password)
- `DB_NAME`: Database name (default: booking_platform)
- `JWT_SECRET`: JWT secret key
- `SIGNING_SECRET`: Signing secret key

## Key Changes in This Deployment
1. Fixed the 500 error when creating hotels via POST /api/hotels
2. Made `company_id` and `agent_id` nullable to support individual hotel owners
3. Applied Knex migrations to manage database schema changes
4. All changes are backward compatible with existing data

## Testing the Fix
After deployment, test the hotel creation endpoint:

```bash
# Register a new user
curl -X POST http://46.101.13.38:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Create a hotel
curl -X POST http://46.101.13.38:3001/api/hotels \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "name":"Test Hotel",
    "description":"A test hotel",
    "address":"123 Main St",
    "city":"Makkah",
    "country":"Saudi Arabia",
    "starRating":5,
    "totalRooms":100
  }'
```

The response should include the created hotel with a 201 status code.
