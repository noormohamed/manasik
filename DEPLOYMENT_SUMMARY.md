# Deployment Summary - Manasik Booking Platform

## 🎯 Objective
Deploy the fixed Manasik booking platform to production server at **46.101.13.38** with the hotel creation bug fix.

## 🔧 What Was Fixed
The POST /api/hotels endpoint was returning a 500 error due to foreign key constraint violations. The fix involved:

1. **Database Schema Changes**:
   - Made `company_id` nullable in the `hotels` table
   - Made `agent_id` nullable in the `hotels` table
   - This allows individual users to create hotels without being part of a company or agent system

2. **Code Changes**:
   - Updated `service/src/features/hotel/routes/hotel.routes.ts` to set both `company_id` and `agent_id` to `null` for individual users

3. **Migrations Created**:
   - `service/src/database/knex-migrations/20260429000000_make_company_id_nullable.ts`
   - `service/src/database/knex-migrations/20260429000001_make_agent_id_nullable.ts`

## 📋 Deployment Checklist

### Prerequisites
- [ ] Server has Docker and Docker Compose installed
- [ ] Server has Node.js 18+ installed
- [ ] Server has Git installed
- [ ] SSH access to root@46.101.13.38

### Deployment Steps
1. [ ] SSH into the server: `ssh root@46.101.13.38`
2. [ ] Download and run the deployment script:
   ```bash
   curl -O https://raw.githubusercontent.com/yourusername/manasik/main/server-deploy.sh
   bash server-deploy.sh
   ```
3. [ ] Or manually follow the steps in DEPLOYMENT_GUIDE.md

### Post-Deployment Verification
- [ ] API is responding: `curl http://46.101.13.38:3001/api/health`
- [ ] Frontend is accessible: `http://46.101.13.38:3000`
- [ ] Management panel is accessible: `http://46.101.13.38:3002`
- [ ] Test hotel creation endpoint with a new user

## 🚀 Quick Start After Deployment

### Test the Fixed Endpoint
```bash
# 1. Register a new user
TOKEN=$(curl -s -X POST http://46.101.13.38:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 2. Create a hotel
curl -X POST http://46.101.13.38:3001/api/hotels \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Test Hotel",
    "description":"A test hotel",
    "address":"123 Main St",
    "city":"Makkah",
    "country":"Saudi Arabia",
    "starRating":5,
    "totalRooms":100,
    "checkInTime":"14:00",
    "checkOutTime":"11:00",
    "cancellationPolicy":"Free cancellation up to 24 hours"
  }'
```

Expected response: 201 Created with hotel details

## 📊 Service Endpoints

| Service | URL | Port |
|---------|-----|------|
| API | http://46.101.13.38:3001 | 3001 |
| Frontend | http://46.101.13.38:3000 | 3000 |
| Management | http://46.101.13.38:3002 | 3002 |
| MySQL | localhost | 3306 |

## 🔐 Server Credentials
- **IP**: 46.101.13.38
- **User**: root
- **Password**: qA94zeJ(u5UKp

## 📝 Files Included in Deployment

### New Migration Files
- `service/src/database/knex-migrations/20260429000000_make_company_id_nullable.ts`
- `service/src/database/knex-migrations/20260429000001_make_agent_id_nullable.ts`

### Modified Files
- `service/src/features/hotel/routes/hotel.routes.ts` - Updated POST /api/hotels endpoint

### Deployment Scripts
- `deploy.sh` - Automated deployment script (for local machine)
- `server-deploy.sh` - Deployment script to run on server
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions

## 🛠️ Troubleshooting

### If services don't start
```bash
# Check logs
docker-compose logs -f

# Restart services
docker-compose restart

# Check specific service
docker logs booking_api
```

### If database migrations fail
```bash
# Check migration status
npm run migrate:status --prefix service

# Rollback if needed
npm run migrate:rollback --prefix service

# Run migrations again
npm run migrate:latest --prefix service
```

### If ports are in use
Edit `docker-compose.yml` and change the port mappings, then restart services.

## ✅ Verification Checklist

After deployment, verify:
- [ ] API responds to health check
- [ ] Database migrations ran successfully
- [ ] Can register a new user
- [ ] Can create a hotel with the new user
- [ ] Hotel creation returns 201 status
- [ ] Hotel data is saved correctly in database

## 📞 Support

If you encounter any issues:
1. Check the logs: `docker-compose logs -f`
2. Verify database connection: `docker logs booking_mysql`
3. Check if ports are available: `netstat -tuln | grep -E '3000|3001|3002|3306'`
4. Ensure Docker is running: `docker ps`

## 🎉 Success Indicators

You'll know the deployment was successful when:
1. ✅ All Docker containers are running
2. ✅ API health check returns 200 OK
3. ✅ Can create a hotel without 500 error
4. ✅ Hotel data appears in database
5. ✅ Frontend loads without errors
6. ✅ Management panel is accessible

---

**Deployment Date**: April 29, 2026
**Version**: 1.0.0
**Status**: Ready for deployment
