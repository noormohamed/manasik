# Manasik Platform — Handover Document

**Date:** 18 May 2026  
**Repository:** https://github.com/noormohamed/manasik  
**Branch:** `main`  
**Last Commit:** `24cda7c` — fix: resolve build errors (missing import, incorrect FC type)

---

## 1. Architecture Overview

Manasik is a multi-service hotel booking platform for Hajj/Umrah pilgrims. It consists of three applications:

| Service | Tech Stack | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | 3000 | Customer-facing booking app |
| **Backend API** | Koa.js, TypeScript, MySQL 8 | 3001 | REST API, business logic, payments |
| **Management Panel** | Next.js 14, Redux Toolkit, Tailwind | 3002 | Super admin dashboard |

---

## 2. Infrastructure

### Production Servers

| Role | IP Address | Internal IP | Document Root |
|------|-----------|-------------|---------------|
| **Frontend** | 165.232.44.144 | 10.106.0.2 | `/var/www/manasik/frontend` |
| **Backend + DB** | 46.101.13.38 | 10.106.0.3 | `/var/www/manasik/service` |

### Process Management

Both servers use **PM2** for process management:

- Frontend server: `pm2 restart frontend`
- Backend server: `pm2 restart backend`

### Database

- **Engine:** MySQL 8.0 (running on backend server)
- **Database:** `booking_platform`
- **User:** `booking_user`
- **Schema:** 31+ tables defined in `service/database/init.sql` + migrations

### Current Data (Production)

| Entity | Count |
|--------|-------|
| Users | 149 |
| Hotels | 122 |
| Bookings | 53 |
| Reviews | 49 |
| Admin Users | 0 (not seeded) |

---

## 3. Deployment Process

### Manual Deployment

**Backend:**
```bash
# From local machine
export SSHPASS='=qA94zeJ(u5UKp'
sshpass -e rsync -avz --exclude=node_modules --exclude=.git --exclude=dist --exclude=.next \
  service/ root@46.101.13.38:/var/www/manasik/service/

# On server
ssh root@46.101.13.38
cd /var/www/manasik/service
npm install
npx tsc
pm2 restart backend
```

**Frontend:**
```bash
# From local machine
export SSHPASS='=qA94zeJ(u5UKp'
sshpass -e rsync -avz --exclude=node_modules --exclude=.git --exclude=.next \
  frontend/ root@165.232.44.144:/var/www/manasik/frontend/

# On server
ssh root@165.232.44.144
cd /var/www/manasik/frontend
npm install
npm run build
pm2 restart frontend
```

### Local Development

```bash
docker-compose up -d          # Start MySQL + all services
# OR run individually:
cd service && npm run dev     # API on :3001
cd frontend && npm run dev    # Frontend on :3000
cd management && npm run dev  # Admin panel on :3002
```

---

## 4. Feature Status (Production)

### Working

| Feature | Status | Notes |
|---------|--------|-------|
| API Health Check | ✅ | All feature flags enabled |
| User Registration | ✅ | POST /api/auth/register |
| User Login (JWT) | ✅ | Returns access + refresh tokens |
| Token Refresh | ✅ | POST /api/auth/refresh |
| Hotel Listing | ✅ | 122 hotels, paginated |
| Hotel Search & Filters | ✅ | City, star rating, amenities, facilities |
| Hotel Details | ✅ | Full hotel data with rooms |
| Advanced Filters | ✅ | Proximity, surroundings, pilgrim suitability |
| Manasik Score Weights | ✅ | Configurable via API |
| Territory Tax Rates | ✅ | 12 territories, admin-configurable |
| Platform Rebate (Commission) | ✅ | Configurable percentage |
| Booking Creation | ✅ | Multi-step checkout flow |
| Payment Method Tracking | ✅ | STRIPE vs MANUAL distinction |
| Haram Gates | ✅ | Gate proximity data |
| Reviews System | ✅ | 49 reviews in production |
| User Dashboard | ✅ | Bookings, listings, messages |
| Messaging System | ✅ | Conversation threads |
| Frontend Pages | ✅ | All routes return 200 |

### Partially Working (Needs Configuration)

| Feature | Issue | Fix |
|---------|-------|-----|
| Stripe Payments | No production Stripe keys | Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to backend `.env` |
| Email Notifications | No SMTP configured | Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` to backend `.env` |
| Hotel Image Upload | No S3 credentials | Add Wasabi/AWS credentials to backend `.env` |
| Contentful CMS | No API keys | Add `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` to frontend `.env` |

### Not Deployed

| Feature | Issue | Fix |
|---------|-------|-----|
| Management Panel | Not deployed to any server | Deploy to frontend server on port 3002, add PM2 process |
| Admin Authentication | `admin_users` table is empty | Run `service/database/seed-admin-users.js` on production |
| Admin Analytics Dashboard | Depends on management panel | Deploy management panel first |
| Admin Audit Log | Depends on management panel | Deploy management panel first |
| Real-time WebSocket | No admin clients can connect | Deploy management panel first |

---

## 5. Tech Stack Details

### Backend Dependencies
- **Framework:** Koa.js 2.14 + koa-router
- **Database:** MySQL 8 via Knex.js (migrations) + raw queries
- **Auth:** JWT (jsonwebtoken), bcryptjs, OTP (otplib)
- **Payments:** Stripe API (axios-based)
- **Email:** Nodemailer
- **Validation:** Zod
- **WebSocket:** ws library
- **Testing:** Jest + supertest + fast-check (property-based)

### Frontend Dependencies
- **Framework:** Next.js 14 (App Router)
- **Auth:** Custom JWT context + Logto integration
- **CMS:** Contentful
- **Styling:** Bootstrap + custom SCSS
- **Testing:** Jest + Playwright (e2e)

### Management Panel Dependencies
- **Framework:** Next.js 14 (App Router)
- **State:** Redux Toolkit + React Query
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Tables:** TanStack React Table
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + Playwright

---

## 6. Database Schema (Key Tables)

### Core
- `users` — All platform users (SUPER_ADMIN, COMPANY_ADMIN, AGENT, CUSTOMER)
- `companies` — Hotel companies
- `agents` — Booking agents linked to companies
- `hotels` — Hotel listings (122 in production)
- `room_types` — Room configurations per hotel
- `bookings` — Reservations (PENDING → CONFIRMED → COMPLETED/CANCELLED/EXPIRED)
- `reviews` — Guest reviews with ratings

### Payments
- `checkouts` / `checkout_sessions` — Stripe checkout flow
- `payments` / `transactions` — Payment records
- `payment_method` column on bookings: `STRIPE` | `MANUAL` | NULL

### Admin
- `admin_users` — Separate admin auth (currently empty in prod)
- `admin_sessions` — Admin JWT sessions
- `audit_logs` — All admin actions logged
- `admin_alerts` / `alert_history` — Alert system
- `platform_settings` — Rebate %, tax rates, scoring weights

### Domain-Specific
- `haram_gates` — Gate proximity data for Hajj/Umrah
- `hotel_amenities` / `hotel_images` — Hotel features
- `hotel_gate_assignments` — Hotel-to-gate mapping

---

## 7. API Routes Summary

| Prefix | File | Purpose |
|--------|------|---------|
| `/api/auth` | `auth.routes.ts` | Register, login, refresh, password reset |
| `/api/users` | `user.routes.ts` | Profile, earnings, bookings |
| `/api/hotels` | `hotel.routes.ts` | CRUD, search, filters, rooms, bookings, reviews |
| `/api/checkout` | `checkout.routes.ts` | Stripe sessions, payment verification |
| `/api/admin` | `admin.routes.ts` | Admin auth, users, bookings, reviews, transactions, analytics, settings |
| `/api/credits` | `credits.routes.ts` | Credits system |

---

## 8. Environment Variables Required

### Backend (`service/.env`)
```
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=booking_user
DB_PASSWORD=booking_password
DB_NAME=booking_platform
JWT_SECRET=<change-me>
JWT_REFRESH_SECRET=<change-me>
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-pub-key>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>
SMTP_FROM=noreply@manasik.co.uk
FRONTEND_URL=http://165.232.44.144:3000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://46.101.13.38:3001/api
CONTENTFUL_SPACE_ID=<optional>
CONTENTFUL_ACCESS_TOKEN=<optional>
```

### Management (`management/.env.local`)
```
NEXT_PUBLIC_API_URL=http://46.101.13.38:3001
NEXT_PUBLIC_APP_NAME=Super Admin Panel
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOG=true
```

---

## 9. Outstanding Tasks

### Priority 1 — Required for Full Operation
1. **Seed admin users** in production (`node service/database/seed-admin-users.js`)
2. **Deploy management panel** to frontend server on port 3002
3. **Configure Stripe keys** for payment processing
4. **Configure SMTP** for email notifications

### Priority 2 — Nice to Have
5. Set up SSL/HTTPS (currently HTTP only)
6. Configure Wasabi S3 for hotel image uploads
7. Set up Contentful for CMS content
8. Add monitoring/alerting (PM2 logs only currently)
9. Persist tax rates on startup (currently loads from defaults, admin changes are in-memory + platform_settings table)

### Priority 3 — Technical Debt
10. Two hardcoded `taxRate = 0.10` in `broker-booking.service.ts` and `hotel.routes.ts` should use the tax service
11. `frontend-template/` directory is a dead copy — can be removed
12. 117 markdown docs in `/docs` — most are implementation notes, could be consolidated

---

## 10. Test Accounts (Production)

| Email | Role | Password | Notes |
|-------|------|----------|-------|
| steven.carter@email.com | CUSTOMER | password123 | Verified working |
| agent6@hotels.com | AGENT | password123 | Hotel agent |
| daniel@brank.io | CUSTOMER | password123 | Developer test account |

Admin accounts need to be seeded (see Priority 1 above).

---

## 11. Useful Commands

```bash
# Check API health
curl http://46.101.13.38:3001/api/health

# Check PM2 status (backend)
ssh root@46.101.13.38 "pm2 list"

# Check PM2 status (frontend)
ssh root@165.232.44.144 "pm2 list"

# View backend logs
ssh root@46.101.13.38 "pm2 logs backend --lines 50"

# View frontend logs
ssh root@165.232.44.144 "pm2 logs frontend --lines 50"

# Run backend tests locally
cd service && npm test

# Run frontend tests locally
cd frontend && npm test

# Database access
ssh root@46.101.13.38
mysql -u booking_user -pbooking_password booking_platform
```

---

## 12. Repository Structure

```
manasik/
├── frontend/          # Customer-facing Next.js app
├── service/           # Koa.js backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic
│   │   ├── features/      # Feature modules (hotel, checkout)
│   │   ├── __tests__/     # Unit tests
│   │   └── websocket/     # Real-time analytics
│   └── database/
│       ├── init.sql       # Core schema
│       ├── migrations/    # Schema changes
│       └── seed-*.sql/js  # Test/production data
├── management/        # Admin panel Next.js app
├── .kiro/specs/       # Feature specifications (9 specs)
├── docker-compose.yml # Local development setup
└── deploy.sh          # Deployment script (needs updating)
```
