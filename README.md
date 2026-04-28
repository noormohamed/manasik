# Manasik — Hajj & Umrah Booking Platform

A full-stack hotel booking platform for Hajj and Umrah pilgrims, consisting of a customer-facing frontend, a Node.js/TypeScript REST API, a MySQL database, and a super-admin management panel.

## Architecture

```
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  Frontend           │   │  Backend API        │   │  Management Panel   │
│  Next.js 14         │──▶│  Koa + TypeScript   │◀──│  Next.js 14         │
│  165.232.44.144     │   │  46.101.13.38:3001  │   │  161.35.169.70      │
│  Port 80 (nginx)    │   │  Port 80 (nginx)    │   │  Port 80 (nginx)    │
└─────────────────────┘   └────────┬────────────┘   └─────────────────────┘
                                   │
                          ┌────────▼────────────┐
                          │  MySQL 8.0          │
                          │  localhost:3306     │
                          │  booking_platform   │
                          └─────────────────────┘
```

**Repositories in this monorepo:**
- `frontend/` — Customer-facing Next.js app (hotel search, booking, checkout)
- `service/` — Koa REST API (TypeScript, compiled to `dist/`)
- `management/` — Super-admin Next.js panel (bookings, hotels, users, analytics)

## Production Infrastructure (DigitalOcean)

| Role | Public IP | Private IP | RAM | Disk |
|------|-----------|------------|-----|------|
| Frontend | 165.232.44.144 | 10.106.0.2 | 1 GB | 33 GB |
| Backend + MySQL | 46.101.13.38 | 10.106.0.3 | 2 GB | 67 GB |
| Management | 161.35.169.70 | 10.106.0.4 | 1 GB | 33 GB |

All servers run **Ubuntu 24.04**, **Node 20**, and **PM2** as the process manager. Each has **nginx** on port 80 as a reverse proxy to the Node process.

## Local Development

Docker is used **only for local development**. The production servers use git + PM2 directly.

```bash
# Start all services locally
docker compose up

# Or individual services
cd service && npm run dev     # API on :3001
cd frontend && npm run dev    # Frontend on :3000
cd management && npm run dev  # Admin panel on :3000
```

**Local environment files:**
- `service/.env` — copy from `service/.env.example`
- `frontend/.env.local` — set `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- `management/.env.local` — set `NEXT_PUBLIC_API_URL=http://localhost:3001`

## Production Deployment

Deployment is **git-based**: push to `main`, then pull on each server and rebuild.

### Backend (46.101.13.38)

```bash
ssh root@46.101.13.38
cd /var/www/manasik
git fetch origin main && git reset --hard origin/main
cd service
npm ci
npm run build
pm2 restart backend
```

### Frontend (165.232.44.144)

```bash
ssh root@165.232.44.144
cd /var/www/manasik
git fetch origin main && git reset --hard origin/main
cd frontend
npm ci
npm run build
pm2 restart frontend
```

### Management (161.35.169.70)

```bash
ssh root@161.35.169.70
cd /var/www/manasik
git fetch origin main && git reset --hard origin/main
cd management
npm ci
npm run build
pm2 restart management
```

> **Note:** The repo tracks compiled `dist/` and `.next/` build artefacts. Always use
> `git reset --hard origin/main` (not `git pull`) on servers to avoid merge conflicts
> with locally-built files.

### Checking deployment status

```bash
pm2 list          # all processes
pm2 show 0        # detailed view
pm2 logs 0 --lines 50  # recent logs
```

## Database

MySQL 8.0 runs on the **backend server** at `localhost:3306`.

| Detail | Value |
|--------|-------|
| Database | `booking_platform` |
| User | `booking_user` |
| Tables | 52 |

### Running migrations with Knex

Database migrations are managed with **Knex.js**, which tracks applied migrations in a
`knex_migrations` table and only ever runs what is pending.

```bash
cd service

# See what has and hasn't been applied
npm run migrate:status

# Apply all pending migrations (safe to run multiple times)
npm run migrate:latest

# Roll back the most recent batch
npm run migrate:rollback

# Create a new migration file (replace <name> with a descriptive slug)
npm run migrate:make -- <name>
# e.g. npm run migrate:make -- add_stripe_customer_id_to_users
```

Migration files live in `service/src/database/knex-migrations/` and are TypeScript.
They are named with a timestamp prefix so they always run in the correct order.

**Current migrations:**
- `20260428000000_baseline.ts` — Complete schema as of v0.2.1 (all 52 tables + columns)

### Production deployment with migrations

Add `npm run migrate:latest` before `pm2 restart` in every backend deploy:

```bash
cd /var/www/manasik
git fetch origin main && git reset --hard origin/main
cd service
npm ci
npm run build
npm run migrate:latest   # ← apply any pending schema changes
pm2 restart backend
```

The migration runs while the old code is still serving traffic (additive changes only).
Only the PM2 restart causes a brief interruption (~2 seconds).

### Writing a new migration

```bash
npm run migrate:make -- add_stripe_customer_id
```

This creates `service/src/database/knex-migrations/<timestamp>_add_stripe_customer_id.ts`:

```typescript
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.string('stripe_customer_id', 255).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('stripe_customer_id');
  });
}
```

**Rules:**
- Always write a `down()` that exactly reverses `up()`
- Never edit an already-applied migration — create a new one instead
- Keep migrations additive where possible (add columns, don't rename or drop until
  all servers are running code that no longer references the old column)

### Legacy SQL files

`service/database/migrations/` contains the original numbered SQL files (`001`–`019`).
These are kept for historical reference only. **Do not run them** — everything they
contained is covered by the Knex baseline migration.

## Environment Variables

### Backend (`service/.env`)

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=<password>
DB_NAME=booking_platform
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
SIGNING_SECRET=<strong-secret>
CORS_ORIGIN=http://165.232.44.144,http://161.35.169.70
FRONTEND_URL=http://165.232.44.144
STRIPE_SECRET_KEY=<stripe-key>
STRIPE_PUBLISHABLE_KEY=<stripe-key>
SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
SMTP_FROM=noreply@manasik.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://46.101.13.38:3001/api
NEXT_PUBLIC_ENV=production
CONTENTFUL_SPACE_ID=<space-id>
CONTENTFUL_ACCESS_TOKEN=<access-token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<preview-token>
```

### Management (`management/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://46.101.13.38/api
NEXT_PUBLIC_ENV=production
```

## Resolved Issues & Root Causes

### 1. API returning 500 on all DB endpoints

**Symptom:** `GET /api/hotels`, `POST /api/auth/login`, and all other database-touching
endpoints returned HTTP 500 with `"Cannot send secure cookie over unencrypted connection"`.
The health endpoint (`/api/health`) returned 200 because it does not touch cookies or the DB.

**Root cause (A) — Proxy trust not configured:**
The Koa app did not have `app.proxy = true`. Without this, `ctx.secure` always evaluates
to `false` on an HTTP connection even behind nginx.

**Root cause (B) — Hardcoded secure cookie flag:**
The session middleware set `secure: process.env.NODE_ENV === 'production'`, which forced
`secure: true` in production. Koa then rejected the cookie write because the TCP
connection from its perspective was plain HTTP.

**Fix** (`service/src/server.ts` and `service/src/middleware/session.ts`):
```typescript
// server.ts — added after const app = new Koa()
app.proxy = true; // Trust X-Forwarded-Proto from nginx

// session.ts — changed in sessionMiddleware and clearGuestUserCookie
// Before:
secure: process.env.NODE_ENV === 'production',
// After:
secure: ctx.secure, // Respects X-Forwarded-Proto via app.proxy = true
```

With `app.proxy = true` and nginx sending `X-Forwarded-Proto: http`, `ctx.secure` is
`false` for HTTP traffic, so the cookie is set without the `Secure` flag. If HTTPS is
added in future, nginx should send `X-Forwarded-Proto: https` and `ctx.secure` will
automatically become `true` with no further code changes needed.

---

### 2. Backend failing to connect to MySQL on startup

**Symptom:** On PM2 restarts, the backend error log showed
`AggregateError [ECONNREFUSED] ::1:3306 / 127.0.0.1:3306` at process startup.

**Root cause:** The server was started before MySQL finished initialising (race condition
at boot). The Node.js database pool failed to connect, leaving the app in a degraded
state where the health endpoint still responded but all DB queries failed.

**Fix:** Restart the backend after confirming MySQL is active:
```bash
systemctl status mysql   # confirm active
pm2 restart backend
```

To prevent this at boot, ensure MySQL starts before the Node process. You can enforce
ordering in PM2's ecosystem config or a systemd service dependency.

---

### 3. Database missing tables and columns

**Symptom:** 13 tables and ~30 columns were missing from the production database compared
to what the current codebase expected. The live server had not had migrations 010–019
applied.

**Fix:** Run `service/database/production-migration.sql` (see [Database](#database) section
above). This script was created by auditing the live schema against all migration files
and compiling only the missing deltas.

---

### 4. `Failed to find Server Action "x"` in frontend/management logs

**Symptom:** Error appears in Next.js stderr after a new build is deployed.

**Root cause:** Browser clients that cached an older JavaScript bundle from a previous
build attempt to invoke Server Actions by hash. The new build has different hashes,
so the server cannot find the action.

**This is not a bug.** It resolves automatically as users hard-refresh or their
browser cache expires (typically within a few hours of deployment).

## Monitoring

```bash
# Live PM2 dashboard (all servers)
pm2 monit

# Follow logs in real time
pm2 logs 0

# Check nginx access log (frontend or management server)
tail -f /var/log/nginx/access.log

# Check MySQL connection pool
mysql -u booking_user -pbooking_password booking_platform -e "SHOW STATUS LIKE 'Threads_connected';"
```
