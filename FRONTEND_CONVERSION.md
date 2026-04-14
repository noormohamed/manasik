# Frontend Conversion: Next.js → React + Vite

## What Was Done

### 1. Renamed Original Frontend
- `frontend/` → `frontend-template/`
- Preserved all original Next.js code for cherry-picking later

### 2. Created Clean React + Vite App
Built a minimal, production-ready React application with:

**Core Setup:**
- ✅ React 18 + TypeScript
- ✅ Vite 5 (fast dev server, optimized builds)
- ✅ React Router 6 (client-side routing)
- ✅ Path aliases (`@/` for `src/`)
- ✅ API proxy to backend

**Authentication System:**
- ✅ Login page (`/login`)
- ✅ Register page (`/register`)
- ✅ Protected home page (`/`)
- ✅ AuthContext with token management
- ✅ API client with automatic token injection
- ✅ Protected route wrapper

**Project Structure:**
```
frontend/
├── src/
│   ├── pages/          # LoginPage, RegisterPage, HomePage
│   ├── context/        # AuthContext
│   ├── hooks/          # useAuth
│   ├── lib/            # API client
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Router setup
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── .env.local          # Environment variables
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## Key Differences

| Aspect | Next.js Template | New React App |
|--------|-----------------|---------------|
| **Framework** | Next.js 14 | React 18 + Vite |
| **Routing** | File-based (app directory) | React Router (code-based) |
| **Rendering** | SSR + Client | Client-only (SPA) |
| **Images** | `next/image` component | Regular `<img>` tags |
| **Env Vars** | `NEXT_PUBLIC_*` | `VITE_*` |
| **Dev Server** | Next.js dev server | Vite dev server |
| **Build** | `.next/` output | `dist/` output |
| **Middleware** | Built-in | React Router loaders |
| **API Routes** | Built-in `/api` | Separate backend |

## What Was Preserved

From the Next.js template, we copied and converted:

1. **API Client** (`src/lib/api.ts`)
   - Changed `process.env.NEXT_PUBLIC_API_URL` → `import.meta.env.VITE_API_URL`
   - Removed `typeof window === 'undefined'` checks (no SSR)
   - Same error handling and token management

2. **AuthContext** (`src/context/AuthContext.tsx`)
   - Removed `'use client'` directive
   - Same login/register/logout logic
   - Same token storage (localStorage + cookies)

3. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Removed `'use client'` directive
   - Same implementation

4. **TypeScript Types** (`src/types/`)
   - Copied auth.ts and api.ts unchanged
   - Ready for hotel/booking types

## How to Use

### Start Development
```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

### Test Authentication
1. Go to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@bookingplatform.com`
   - Password: `password123`
3. Should redirect to home page
4. Click logout to test logout flow

### Cherry-Pick from Template

The original template is in `frontend-template/`. Copy what you need:

**Example: Copy Hotel Components**
```bash
# Copy entire component folder
cp -r frontend-template/src/components/Stay frontend/src/components/

# Copy CSS
cp frontend-template/public/css/globals.css frontend/public/css/

# Copy images
cp -r frontend-template/public/images frontend/public/
```

**Example: Add Bootstrap**
```bash
# Copy Bootstrap CSS
cp frontend-template/public/css/bootstrap.min.css frontend/public/css/

# Import in index.html
<link rel="stylesheet" href="/css/bootstrap.min.css">
```

## Next Steps

### Immediate
1. ✅ Test login/register flows
2. ✅ Verify API connection
3. ✅ Test protected routes

### Short Term
1. **Add Styling**
   - Copy Bootstrap CSS from template
   - Copy custom CSS files
   - Set up global styles

2. **Add Hotel Listing**
   - Create HotelListPage
   - Copy hotel components from template
   - Connect to `/api/hotels` endpoint

3. **Add Hotel Details**
   - Create HotelDetailsPage
   - Copy details components
   - Add booking form

4. **Add Navigation**
   - Create Navbar component
   - Add links to pages
   - Show user info when logged in

### Long Term
1. **Add All Features**
   - Checkout flow
   - User profile
   - Booking history
   - Search and filters

2. **Improve UI**
   - Copy all CSS from template
   - Add animations
   - Responsive design

3. **Add Testing**
   - Convert Playwright tests to work with React Router
   - Add unit tests with Vitest
   - Add component tests

## Benefits of This Approach

### Clean Slate
- No bloated template code
- Only what you need
- Easy to understand

### Modern Stack
- Vite is faster than Next.js dev server
- Simpler build process
- Better HMR (Hot Module Replacement)

### Flexibility
- Cherry-pick components as needed
- No Next.js constraints
- Pure React patterns

### Maintainability
- Clearer code structure
- Explicit routing
- No "magic" from framework

## File Comparison

### Before (Next.js)
```
frontend/
├── src/
│   ├── app/                    # 20+ route folders
│   │   ├── authentication/
│   │   ├── login/
│   │   ├── register/
│   │   ├── stay/
│   │   └── ...
│   ├── components/             # 30+ component folders
│   └── ...
├── public/                     # 500+ files
└── .next/                      # Build output
```

### After (React)
```
frontend/
├── src/
│   ├── pages/                  # 3 pages (for now)
│   ├── context/                # 1 context
│   ├── hooks/                  # 1 hook
│   ├── lib/                    # 1 API client
│   └── types/                  # 2 type files
├── public/                     # Empty (add as needed)
└── dist/                       # Build output
```

## Environment Variables

### Next.js Template
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ENV=development
```

### React App
```bash
VITE_API_URL=http://localhost:3001/api
VITE_ENV=development
```

**Important:** Vite requires `VITE_` prefix, not `NEXT_PUBLIC_`

## Routing Comparison

### Next.js (File-based)
```
app/
├── login/
│   └── page.tsx          → /login
├── register/
│   └── page.tsx          → /register
└── page.tsx              → /
```

### React Router (Code-based)
```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/" element={<HomePage />} />
</Routes>
```

## Build Output

### Development
```bash
npm run dev
# Vite dev server on http://localhost:3000
# Fast HMR, instant updates
```

### Production
```bash
npm run build
# Creates dist/ folder
# Optimized, minified, tree-shaken
# Ready to deploy to any static host
```

## Deployment Options

Since it's now a pure SPA:
- ✅ Vercel
- ✅ Netlify
- ✅ AWS S3 + CloudFront
- ✅ GitHub Pages
- ✅ Any static host

No need for Node.js server in production!

## Summary

✅ **Created clean React + Vite app**
✅ **Preserved original template for reference**
✅ **Converted authentication system**
✅ **Set up routing with React Router**
✅ **Ready to cherry-pick components as needed**
✅ **Faster development experience**
✅ **Simpler deployment**

The new frontend is minimal, fast, and ready to grow. Add features by copying from `frontend-template/` as you need them!
