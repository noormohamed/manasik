# Persistent Database Setup

## Overview
The MySQL database is now configured with persistent storage. Your data will be preserved even when you stop and restart the Docker containers.

## Configuration

### Volume Setup
- **Volume Name**: `mysql_data_persistent`
- **Type**: Docker Named Volume (local driver)
- **Location**: `/var/lib/docker/volumes/mysql_data_persistent/_data`
- **Status**: ✅ Active and persistent

### Docker Compose Configuration
The `docker-compose.yml` has been updated to use the persistent volume:

```yaml
services:
  mysql:
    volumes:
      - mysql_data_persistent:/var/lib/mysql
      # ... other volumes ...

volumes:
  mysql_data_persistent:
    external: true
```

## How It Works

1. **Data Persistence**: All MySQL data is stored in the named volume `mysql_data_persistent`
2. **Automatic Backup**: Docker manages the volume, so data persists across container restarts
3. **No Data Loss**: When you run `docker-compose down`, the volume is NOT deleted
4. **Clean Restart**: You can safely restart containers without losing any data

## Usage

### Start Containers (Data Persists)
```bash
docker-compose up
```

### Stop Containers (Data Preserved)
```bash
docker-compose down
```

### Remove Everything (Including Data)
```bash
docker-compose down -v
```
⚠️ **Warning**: The `-v` flag removes volumes and will delete all data!

## Verification

### Check Volume Status
```bash
docker volume inspect mysql_data_persistent
```

### Check Database Tables
```bash
docker exec booking_mysql mysql -u booking_user -pbooking_password booking_platform -e "SHOW TABLES;"
```

### Check Data Persistence
1. Start containers: `docker-compose up`
2. Add some data (create a user, add a hotel, etc.)
3. Stop containers: `docker-compose down`
4. Start containers again: `docker-compose up`
5. Verify your data is still there

## Current Database State

### Tables Created
- ✅ All original tables (users, hotels, bookings, etc.)
- ✅ Haram gates tables (haram_gates, nearby_attractions, hotel_gate_distances, hotel_attraction_distances)
- ✅ Manasik score automation tables (review_friction_responses, score_calculations)
- ✅ Hotel metadata columns (location_metrics_*, experience_friction_*)

### Total Tables: 30+

## Troubleshooting

### Volume Not Found
If you get an error about the volume not existing:
```bash
docker volume create mysql_data_persistent
```

### Data Seems Lost
Check if the volume still exists:
```bash
docker volume ls | grep mysql_data_persistent
```

### Reset Everything
To start fresh with a clean database:
```bash
docker-compose down -v
docker volume rm mysql_data_persistent
docker volume create mysql_data_persistent
docker-compose up
```

## Notes

- The volume is managed by Docker, not stored in your project directory
- This is the recommended approach for production-like setups
- Data is safe even if you restart your computer (as long as Docker is running)
- For local development, this provides a good balance between persistence and simplicity

