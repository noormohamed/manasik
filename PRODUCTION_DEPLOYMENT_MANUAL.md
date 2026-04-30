# Production Deployment Manual - Manasik Booking Platform

## Current Status

✅ **API is running** on production server (46.101.13.38:3001)
✅ **Bug fix code is ready** (migrations and endpoint changes)
❌ **Migrations not yet applied** - hotel creation still returns error
⚠️ **SSH password authentication not working** - requires manual intervention or key-based auth

## What Was Fixed

The POST /api/hotels endpoint was returning a 500 error due to foreign key constraint violations:
- `company_id` was NOT NULL but regular users don't have a company
- `agent_id` was NOT NULL but regular users aren't agents

**Solution**: Made both columns nullable via Knex migrations:
- `service/src/database/knex-migrations/20260429000000_make_company_id_nullable.ts`
- `service/src/database/knex-migrations/20260429000001_make_agent_id_nullable.ts`

**Code changes**:
- Updated `service/src/features/hotel/routes/hotel.routes.ts` to set both to `null` for individual users

## Deployment Steps

### Option 1: Manual SSH Access (Recommended)

If you have SSH key-based access to the server:

```bash
# 1. SSH into the server
ssh root@46.101.13.38

# 2. Navigate to the deployment directory
cd /var/www/manasik

# 3. Run the automated deployment script
bash production-deploy.sh
```

### Option 2: Manual Step-by-Step Deployment

If you need to deploy manually:

```bash
# 1. SSH into the server
ssh root@46.101.13.38

# 2. Update the repository
cd /var/www/manasik
git fetch origin main
git reset --hard origin/main

# 3. Deploy backend service
cd service
npm ci
npm run build
npm run migrate:latest  # ← This applies the critical migrations
pm2 restart backend

# 4. Deploy frontend
cd ../frontend
npm ci
npm run build
pm2 restart frontend

# 5. Deploy management panel
cd ../management
npm ci
npm run build
pm2 restart management

# 6. Verify services
pm2 status
curl http://localhost:3001/api/health
```

### Option 3: Using the Provided Script

A production-ready deployment script has been created at `production-deploy.sh`:

```bash
# Copy the script to the server and run it
scp production-deploy.sh root@46.101.13.38:/tmp/
ssh root@46.101.13.38 "bash /tmp/production-deploy.sh"
```

## Verification

After deployment, verify the fix is working:

```bash
# 1. Register a new user
curl -X POST http://46.101.13.38:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "firstName":"Test",
    "lastName":"User"
  }'

# Extract the accessToken from the response

# 2. Create a hotel with the new user
curl -X POST http://46.101.13.38:3001/api/hotels \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
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

# Expected response: 201 Created with hotel details
```

## Troubleshooting

### If migrations fail

```bash
# Check migration status
cd /var/www/manasik/service
npm run migrate:status

# Rollback if needed
npm run migrate:rollback

# Run migrations again
npm run migrate:latest
```

### If services don't start

```bash
# Check PM2 logs
pm2 logs backend
pm2 logs frontend
pm2 logs management

# Restart a specific service
pm2 restart backend

# Check if ports are in use
netstat -tuln | grep -E '3000|3001|3002|3306'
```

### If database connection fails

```bash
# Check MySQL is running
systemctl status mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check migrations table
mysql -u root -p booking_platform -e "SELECT * FROM knex_migrations;"
```

## SSH Authentication Issues

If you're experiencing SSH authentication issues:

1. **Check if password auth is enabled on the server**:
   ```bash
   ssh -v root@46.101.13.38
   # Look for "Authentications that can continue: publickey,password"
   ```

2. **Try key-based authentication**:
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@46.101.13.38
   ```

3. **If neither works, contact your hosting provider** to:
   - Reset the root password
   - Add your SSH public key to authorized_keys
   - Enable password authentication in sshd_config

## Files Involved

### New Migration Files
- `service/src/database/knex-migrations/20260429000000_make_company_id_nullable.ts` - Makes company_id nullable
- `service/src/database/knex-migrations/20260429000001_make_agent_id_nullable.ts` - Makes agent_id nullable

### Modified Files
- `service/src/features/hotel/routes/hotel.routes.ts` - Updated POST /api/hotels endpoint

### Deployment Scripts
- `production-deploy.sh` - Automated production deployment script
- `PRODUCTION_DEPLOYMENT_MANUAL.md` - This file

## Service Endpoints

| Service | URL | Port |
|---------|-----|------|
| API | http://46.101.13.38:3001 | 3001 |
| Frontend | http://46.101.13.38:3000 | 3000 |
| Management | http://46.101.13.38:3002 | 3002 |
| MySQL | localhost | 3306 |

## Database Details

- **Database**: booking_platform
- **User**: root
- **Host**: localhost
- **Port**: 3306

## Next Steps

1. **Establish SSH access** to the production server
2. **Run the deployment script** or follow manual steps
3. **Verify migrations applied** with `npm run migrate:status`
4. **Test hotel creation** with the verification curl commands above
5. **Monitor logs** with `pm2 logs` to ensure services are healthy

## Support

If you encounter issues:
1. Check the PM2 logs: `pm2 logs`
2. Check the database migrations: `npm run migrate:status`
3. Verify the API is responding: `curl http://46.101.13.38:3001/api/health`
4. Check if ports are available: `netstat -tuln`

---

**Deployment Date**: April 29, 2026
**Version**: 1.0.0
**Status**: Ready for deployment
