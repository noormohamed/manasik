# Quick Deployment Reference

## TL;DR - Deploy in 3 Steps

### Step 1: SSH into Production Server
```bash
ssh root@46.101.13.38
# If password auth doesn't work, try:
ssh -i ~/.ssh/id_ed25519 root@46.101.13.38
```

### Step 2: Run Deployment Script
```bash
cd /var/www/manasik
bash production-deploy.sh
```

### Step 3: Verify Fix Works
```bash
# Test hotel creation
curl -X POST http://46.101.13.38:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"pass123","firstName":"Test","lastName":"User"}'

# Copy the accessToken from response, then:
curl -X POST http://46.101.13.38:3001/api/hotels \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"name":"Test","description":"Test","address":"123 St","city":"Makkah","country":"Saudi Arabia","starRating":5,"totalRooms":100,"checkInTime":"14:00","checkOutTime":"11:00","cancellationPolicy":"Free"}'

# Expected: 201 Created (not 500 error)
```

---

## What Was Fixed

| Issue | Solution |
|-------|----------|
| POST /api/hotels returns 500 | Made `company_id` and `agent_id` nullable |
| Foreign key constraint error | Updated migrations to allow NULL values |
| Regular users can't create hotels | Updated endpoint to set both to NULL for individuals |

---

## Files Changed

```
service/src/features/hotel/routes/hotel.routes.ts
  └─ Updated POST /api/hotels endpoint

service/src/database/knex-migrations/
  ├─ 20260429000000_make_company_id_nullable.ts (NEW)
  └─ 20260429000001_make_agent_id_nullable.ts (NEW)
```

---

## Deployment Scripts

| Script | Purpose |
|--------|---------|
| `production-deploy.sh` | Automated deployment (run on server) |
| `PRODUCTION_DEPLOYMENT_MANUAL.md` | Detailed deployment guide |
| `DEPLOYMENT_STATUS.md` | Current status and progress |

---

## Common Issues & Fixes

### SSH Connection Fails
```bash
# Try key-based auth
ssh -i ~/.ssh/id_ed25519 root@46.101.13.38

# Or contact hosting provider to reset password
```

### Migrations Fail
```bash
# Check status
npm run migrate:status

# Rollback
npm run migrate:rollback

# Try again
npm run migrate:latest
```

### Services Won't Start
```bash
# Check logs
pm2 logs backend

# Restart
pm2 restart backend

# Check ports
netstat -tuln | grep -E '3000|3001|3002'
```

### Hotel Creation Still Returns 500
```bash
# Verify migrations applied
npm run migrate:status

# Check database
mysql -u root -p booking_platform -e "DESCRIBE hotels;"

# Should show: company_id NULL, agent_id NULL
```

---

## Verification Checklist

After deployment, verify:
- [ ] SSH access to server works
- [ ] `production-deploy.sh` runs without errors
- [ ] `npm run migrate:latest` completes successfully
- [ ] `pm2 status` shows all services running
- [ ] `curl http://46.101.13.38:3001/api/health` returns 200
- [ ] Can register a new user
- [ ] Can create a hotel (returns 201, not 500)
- [ ] Hotel appears in database

---

## Rollback (If Needed)

```bash
cd /var/www/manasik/service

# Rollback migrations
npm run migrate:rollback

# Restart services
pm2 restart all

# Verify
npm run migrate:status
```

---

## Service URLs

| Service | URL |
|---------|-----|
| API | http://46.101.13.38:3001 |
| Frontend | http://46.101.13.38:3000 |
| Management | http://46.101.13.38:3002 |

---

## Key Commands

```bash
# On production server
cd /var/www/manasik

# Deploy
bash production-deploy.sh

# Check status
pm2 status

# View logs
pm2 logs

# Restart specific service
pm2 restart backend

# Check migrations
npm run migrate:status

# Check database
mysql -u root -p booking_platform -e "SELECT * FROM hotels LIMIT 1;"
```

---

## Success = Hotel Creation Works

**Before Fix**:
```
POST /api/hotels → 500 Internal Server Error
```

**After Fix**:
```
POST /api/hotels → 201 Created
{
  "message": "Hotel created successfully",
  "hotel": { ... }
}
```

---

**Status**: Ready for deployment
**Blocker**: SSH access to production server
**Estimated Time**: 5-10 minutes once SSH access is established
