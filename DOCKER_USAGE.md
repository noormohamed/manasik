# Docker Setup - Complete Stack

## Services

The application runs three Docker containers:

1. **MySQL Database** (port 3306)
2. **Backend API** (port 3001)
3. **Frontend** (port 3000)

## Quick Start

### Start Everything
```bash
docker-compose up --build
```

### Start in Background
```bash
docker-compose up -d --build
```

### Stop Everything
```bash
docker-compose down
```

### Stop and Remove Volumes (Fresh Start)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f mysql
```

### Rebuild Specific Service
```bash
docker-compose up -d --build frontend
docker-compose up -d --build api
```

## Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **MySQL:** localhost:3306

## Login Credentials

**Application:**
- Email: `admin@bookingplatform.com`
- Password: `password123`

**MySQL:**
- User: `booking_user`
- Password: `booking_password`
- Database: `booking_platform`
- Root Password: `root`

## Database Initialization

The database is automatically initialized with:
1. Schema (`init.sql`) - Creates all tables
2. Seed data (`seed.sql`) - Creates roles and permissions

To add the test user, run:
```bash
docker-compose exec api node dist/scripts/create-test-user.js
```

Or connect to MySQL and run manually:
```bash
docker-compose exec mysql mysql -u booking_user -pbooking_password booking_platform
```

## Development Workflow

### Make Changes to Frontend
1. Edit files in `frontend/src/`
2. Rebuild: `docker-compose up -d --build frontend`
3. Refresh browser

### Make Changes to Backend
1. Edit files in `service/src/`
2. Rebuild: `docker-compose up -d --build api`
3. API restarts automatically

### Database Changes
1. Edit `service/database/init.sql` or `seed.sql`
2. Remove volume and restart:
```bash
docker-compose down -v
docker-compose up --build
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3306 | xargs kill -9  # MySQL
```

### Container Won't Start
```bash
# Check logs
docker-compose logs api
docker-compose logs frontend
docker-compose logs mysql

# Restart specific service
docker-compose restart api
```

### Database Connection Issues
```bash
# Check if MySQL is healthy
docker-compose ps

# Wait for MySQL to be ready
docker-compose logs mysql | grep "ready for connections"
```

### Fresh Start
```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Production Deployment

### Build for Production
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Environment Variables
Update these in `docker-compose.yml` for production:
- `JWT_SECRET` - Change to a secure random string
- `JWT_REFRESH_SECRET` - Change to a different secure random string
- `MYSQL_ROOT_PASSWORD` - Change to a secure password

### Security Checklist
- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (add nginx reverse proxy)
- [ ] Set up firewall rules
- [ ] Regular backups of MySQL volume
- [ ] Update Docker images regularly

## Backup & Restore

### Backup Database
```bash
docker-compose exec mysql mysqldump -u booking_user -pbooking_password booking_platform > backup.sql
```

### Restore Database
```bash
docker-compose exec -T mysql mysql -u booking_user -pbooking_password booking_platform < backup.sql
```

### Backup Volumes
```bash
docker run --rm -v booking_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

## Health Checks

All services have health checks:
- **MySQL:** Checks if database is responding
- **API:** Checks `/api/health` endpoint
- **Frontend:** Nginx serves static files

Check health status:
```bash
docker-compose ps
```

## Resource Usage

Monitor resource usage:
```bash
docker stats
```

Limit resources in `docker-compose.yml`:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Summary

✅ **All services run in Docker**
✅ **Automatic database initialization**
✅ **Health checks for all services**
✅ **Easy development workflow**
✅ **Production-ready setup**

Start with: `docker-compose up --build`
Access at: `http://localhost:3000`
