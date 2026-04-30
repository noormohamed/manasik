# Development Mode Active! 🔥

## Current Setup

You're now running in **development mode** with hot-reloading enabled!

### What's Running

```
✅ MySQL Database    - localhost:3306 (healthy)
✅ Backend API       - localhost:3001 (nodemon with hot-reload)
✅ Frontend          - localhost:3000 (Vite with HMR)
```

### Commands Used

```bash
# Start development mode
docker-compose -f docker-compose.dev.yml up --build

# Stop development mode
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Hot-Reloading Enabled ⚡

### Backend Changes
When you edit files in `service/src/`:
- **Nodemon** detects the change
- Server automatically restarts
- Changes are live in ~2 seconds

### Frontend Changes
When you edit files in `frontend/src/`:
- **Vite HMR** detects the change
- Browser updates instantly
- No page refresh needed (in most cases)

## Try It Now!

1. **Edit a backend file**:
   ```bash
   # Edit service/src/routes/api.routes.ts
   # Change the health check message
   # Watch the terminal - nodemon will restart
   ```

2. **Edit a frontend file**:
   ```bash
   # Edit frontend/src/pages/DashboardPage.tsx
   # Change some text
   # Watch the browser update instantly
   ```

## Why This Is Better

### Before (Production Mode)
```bash
# Make a change
vim service/src/routes/auth.routes.ts

# Rebuild the container (30-60 seconds)
docker-compose build api

# Restart the container
docker-compose restart api

# Total time: ~1 minute per change 😢
```

### Now (Development Mode)
```bash
# Make a change
vim service/src/routes/auth.routes.ts

# Nodemon automatically restarts (~2 seconds)
# Total time: ~2 seconds per change 🎉
```

## File Watching

Your source code is mounted as volumes:

```yaml
Backend:
  - ./service/src → /app/src (watched by nodemon)
  
Frontend:
  - ./frontend/src → /app/src (watched by Vite)
  - ./frontend/public → /app/public
```

Changes to these directories are immediately visible in the containers.

## Login Issue Fix

The logout-on-refresh issue is still present. This is because:
1. The `/auth/me` endpoint is returning "User not found"
2. The AuthContext tries to load the user on page refresh
3. When it fails, it clears the tokens

Let me check the logs to see what's happening with the user lookup.

## Next Steps

1. **Fix the auth persistence issue** - Need to debug why `/auth/me` can't find the user
2. **Test hot-reloading** - Make a change and watch it update
3. **Continue development** - Build features with instant feedback

## Switching Between Modes

### Development Mode (Current)
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Mode
```bash
docker-compose up
```

## Performance

Development mode is slightly slower than production because:
- Includes dev dependencies
- Runs TypeScript compilation on-the-fly
- Enables source maps and debugging

But the trade-off is worth it for the instant feedback!

## Troubleshooting

### Changes not reflecting?

**Check the logs**:
```bash
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f frontend
```

**Restart a service**:
```bash
docker-compose -f docker-compose.dev.yml restart api
docker-compose -f docker-compose.dev.yml restart frontend
```

### Need to install packages?

```bash
# Backend
docker-compose -f docker-compose.dev.yml exec api npm install <package>

# Frontend
docker-compose -f docker-compose.dev.yml exec frontend npm install <package>
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/api
- **Health**: http://localhost:3001/api/health
- **Database**: localhost:3306

## Login Credentials

- **Email**: `admin@bookingplatform.com`
- **Password**: `password123`

---

**You're all set for rapid development!** 🚀

Make changes, see them instantly, and build faster than ever.
