# Super Admin Panel

A comprehensive administrative dashboard for managing all platform entities (users, bookings, reviews, transactions) with analytics and reporting capabilities.

## Project Structure

```
management/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin routes
│   │   │   ├── login/         # Login page
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── users/         # Users management
│   │   │   ├── bookings/      # Bookings management
│   │   │   ├── reviews/       # Reviews management
│   │   │   ├── transactions/  # Transactions management
│   │   │   ├── analytics/     # Analytics page
│   │   │   ├── audit-log/     # Audit log page
│   │   │   └── settings/      # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (redirects to login)
│   │   └── providers.tsx      # Redux and React Query providers
│   ├── components/            # Reusable React components
│   │   ├── Layout/           # Layout components (Sidebar, TopBar, etc.)
│   │   ├── DataTable/        # Data table component
│   │   ├── Forms/            # Form components
│   │   ├── Modals/           # Modal components
│   │   └── Common/           # Common components
│   ├── store/                # Redux store
│   │   ├── index.ts          # Store configuration
│   │   └── slices/           # Redux slices
│   │       ├── authSlice.ts
│   │       ├── usersSlice.ts
│   │       ├── bookingsSlice.ts
│   │       ├── reviewsSlice.ts
│   │       ├── transactionsSlice.ts
│   │       ├── analyticsSlice.ts
│   │       ├── auditLogSlice.ts
│   │       └── uiSlice.ts
│   ├── services/             # API services
│   │   ├── authService.ts
│   │   ├── usersService.ts
│   │   ├── bookingsService.ts
│   │   ├── reviewsService.ts
│   │   ├── transactionsService.ts
│   │   ├── analyticsService.ts
│   │   └── auditLogService.ts
│   ├── hooks/                # Custom React hooks
│   │   ├── useAppDispatch.ts
│   │   └── useAppSelector.ts
│   ├── lib/                  # Utility libraries
│   │   └── api.ts            # API client with interceptors
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── styles/               # Global styles
│       └── globals.css
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── .env.local                # Local environment variables
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup
├── .eslintrc.json            # ESLint configuration
└── package.json              # Dependencies and scripts
```

## Technology Stack

- **Frontend Framework**: Next.js 14+
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind
- **Charts**: Recharts
- **Data Tables**: React Table
- **Form Validation**: Zod + React Hook Form
- **Testing**: Jest, React Testing Library, fast-check (PBT)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd management
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Type Checking

```bash
npm run type-check
```

## Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_JWT_EXPIRY=86400
NEXT_PUBLIC_SESSION_TIMEOUT=86400
NEXT_PUBLIC_APP_NAME=Super Admin Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOG=true
NEXT_PUBLIC_LOG_LEVEL=info
```

## API Integration

The application connects to the backend API at `http://localhost:3001`. The API client (`src/lib/api.ts`) includes:

- JWT token interceptor for authentication
- Automatic token refresh on 401 responses
- Error handling and logging
- Request/response transformation

## Redux Store

The Redux store is organized into slices:

- **auth**: Authentication state (token, user, MFA)
- **users**: Users list and detail state
- **bookings**: Bookings list and detail state
- **reviews**: Reviews list and detail state
- **transactions**: Transactions list and detail state
- **analytics**: Analytics and dashboard metrics
- **auditLog**: Audit log entries
- **ui**: UI state (sidebar, theme, notifications, modals)

## Features

### Phase 1: Foundation & Authentication (Weeks 1-2)
- [x] Project setup with Next.js 14+
- [x] TypeScript configuration
- [x] Environment variables setup
- [x] Redux store with all slices
- [x] API client with JWT interceptor
- [ ] Database schema and migrations
- [ ] Authentication backend implementation
- [ ] Authentication frontend implementation
- [ ] Admin layout and navigation

### Phase 2: Core Management Features (Weeks 3-5)
- [ ] Shared data table component
- [ ] Users management (list, search, filter, detail, actions)
- [ ] Bookings management (list, search, filter, detail, actions)
- [ ] Reviews management (list, search, filter, detail, actions)
- [ ] Transactions management (list, search, filter, detail, actions)

### Phase 3: Analytics & Reporting (Weeks 6-7)
- [ ] Dashboard with key metrics
- [ ] Analytics charts and visualizations
- [ ] Data export functionality (CSV, JSON, PDF)

### Phase 4: Advanced Features (Weeks 8-9)
- [ ] Audit log viewer
- [ ] Alert system and notifications
- [ ] Admin settings and preferences
- [ ] Help and documentation

### Phase 5: Testing & Optimization (Weeks 10-11)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Property-based tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit

### Phase 6: Deployment & Documentation (Week 12)
- [ ] Documentation
- [ ] Deployment preparation
- [ ] Staging deployment
- [ ] Production deployment

## Performance Targets

- Dashboard load time: < 2 seconds
- List pages load time: < 2 seconds
- Detail pages load time: < 1 second
- Search operations: < 1 second
- Filter operations: < 1 second

## Security

- All data encrypted in transit (HTTPS/TLS)
- JWT token-based authentication
- Role-based access control (RBAC)
- CSRF protection
- Input validation and sanitization
- Comprehensive audit logging
- Session timeout after 24 hours

## Contributing

Follow the existing code style and patterns. All new features should include:

- Unit tests
- Property-based tests (where applicable)
- TypeScript types
- Documentation

## License

Proprietary - All rights reserved
