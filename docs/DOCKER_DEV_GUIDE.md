# Docker Development Setup 🚀

This guide explains how to run the application in **development mode** with hot-reloading using Docker.

## Why Development Mode?

**Production Mode** (`docker-compose.yml`):
- ❌ Requires rebuilding Docker images for every code change
- ✅ Optimized for production deployment
- ✅ Smaller image sizes
- ✅ Better performance

**Development Mode** (`docker-compose.dev.yml`):
- ✅ Hot-reloading - changes reflect immediately
- ✅ No need to rebuild containers
- ✅ Faster development workflow
- ✅ Source code mounted as volumes
- ❌ Larger containers (includes dev dependencies)

## Quick Start - Development Mode

### Start Development Environment
```bash
docker-compose -f docker-compose.dev.yml up
```

### Start in Background
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Development Environment
```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

## What's Different in Dev Mode?

### Backend (API)
- **Command**: `npm run dev` (uses nodemon)
- **Hot Reload**: ✅ Automatic restart on file changes
- **Source**: Mounted from `./service/src`
- **Port**: 3001

### Frontend
- **Command**: `npm run dev` (uses Vite dev server)
- **Hot Reload**: ✅ Instant HMR (Hot Module Replacement)
- **Source**: Mounted from `./frontend/src`
- **Port**: 3000

### Database
- Same as production (MySQL 8.0)
- Data persists in Docker volume

## Development Workflow

1. **Start the containers**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Make code changes** in your editor:
   - Edit files in `service/src/` for backend
   - Edit files in `frontend/src/` for frontend

3. **See changes immediately**:
   - Backend: Server restarts automatically (nodemon)
   - Frontend: Browser updates instantly (Vite HMR)

4. **No need to rebuild** - changes are reflected immediately!

## File Structure

```
.
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup (use this!)
├── service/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build
│   └── src/                    # Mounted as volume in dev mode
└── frontend/
    ├── Dockerfile              # Production build
    ├── Dockerfile.dev          # Development build
    └── src/                    # Mounted as volume in dev mode
```

## Volumes Explained

Development mode mounts your source code as volumes:

```yaml
volumes:
  - ./service/src:/app/src              # Backend source
  - ./frontend/src:/app/src             # Frontend source
  - /app/node_modules                   # Keep node_modules in container
```

This means:
- Changes to local files are immediately visible in the container
- `node_modules` stays in the container (faster, no conflicts)

## Troubleshooting

### Changes not reflecting?

**Backend**:
- Check if nodemon is running: `docker-compose -f docker-compose.dev.yml logs api`
- Restart the container: `docker-compose -f docker-compose.dev.yml restart api`

**Frontend**:
- Check Vite dev server: `docker-compose -f docker-compose.dev.yml logs frontend`
- Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

### Port conflicts?

If ports 3000 or 3001 are already in use:
```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Container won't start?

```bash
# Clean up and start fresh
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Need to install new npm packages?

**Backend**:
```bash
# Add package to package.json first, then:
docker-compose -f docker-compose.dev.yml exec api npm install
docker-compose -f docker-compose.dev.yml restart api
```

**Frontend**:
```bash
# Add package to package.json first, then:
docker-compose -f docker-compose.dev.yml exec frontend npm install
docker-compose -f docker-compose.dev.yml restart frontend
```

Or rebuild the containers:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Production vs Development

### Use Development Mode When:
- ✅ Actively developing features
- ✅ Testing changes frequently
- ✅ Need hot-reloading
- ✅ Debugging issues

### Use Production Mode When:
- ✅ Testing production build
- ✅ Deploying to server
- ✅ Performance testing
- ✅ Final QA before release

## Commands Cheat Sheet

```bash
# Development
docker-compose -f docker-compose.dev.yml up          # Start dev mode
docker-compose -f docker-compose.dev.yml down        # Stop dev mode
docker-compose -f docker-compose.dev.yml logs -f     # View logs
docker-compose -f docker-compose.dev.yml restart api # Restart backend
docker-compose -f docker-compose.dev.yml ps          # Check status

# Production
docker-compose up                                     # Start prod mode
docker-compose down                                   # Stop prod mode
docker-compose up --build                            # Rebuild and start

# Database
docker exec -it booking_mysql mysql -u booking_user -pbooking_password booking_platform
```

## Performance Tips

### Speed up container startup:
1. Use `.dockerignore` to exclude unnecessary files
2. Keep `node_modules` in the container (already configured)
3. Use Docker BuildKit: `export DOCKER_BUILDKIT=1`

### Speed up hot-reloading:
1. Vite is already optimized for HMR
2. Nodemon watches only `src/` directory
3. Use `usePolling: true` in Vite config (already configured)

## Environment Variables

Development mode uses the same environment variables as production.
Edit `docker-compose.dev.yml` to change them.

## Login Credentials

**Email**: `admin@bookingplatform.com`  
**Password**: `password123`

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health
- **MySQL**: localhost:3306

## Next Steps

1. Start dev mode: `docker-compose -f docker-compose.dev.yml up`
2. Open http://localhost:3000
3. Make changes to code
4. Watch them update automatically!

Happy coding! 🎉
