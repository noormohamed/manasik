# Implementation Plan: Admin Analytics Dashboard

## Overview

Replace the placeholder `/admin/analytics` page with a comprehensive, real-time analytics dashboard. The implementation is split into backend (analytics aggregation service, REST endpoint, WebSocket server, event emitter) and frontend (analytics service, WebSocket hook, dashboard page with recharts visualizations and KPI cards). All new code goes into new files; only minimal integration points touch existing files (mounting routes in `server.ts`, adding `ws` dependency to `package.json`, and adding event emission calls in existing route handlers).

## Tasks

- [x] 1. Backend analytics aggregation service
  - [x] 1.1 Create `service/src/services/admin-analytics.service.ts` with the `AnalyticsService` class
    - Define `AnalyticsQuery` and `AnalyticsResponse` TypeScript interfaces matching the design document
    - Implement `getAnalytics(query)` method that runs parallel SQL queries via `Promise.all` against `bookings`, `payments`, `reviews`, `users`, and `companies` tables
    - Implement revenue aggregation: total, average, trend (current vs previous period), daily totals, top 10 hotels by revenue, revenue by booking source, broker fees
    - Implement booking aggregation: total, conversion rate, average stay duration, average lead time, by status, by source, daily volume by status, by payment status, expired rate
    - Implement hotel performance: top 10 by booking count with revenue/rating/reviews, zero-booking hotel count
    - Implement review metrics: rating distribution (1–5), average rating
    - Implement user metrics: count by role, total count, top 10 agents by revenue
    - Include `meta` section with `generatedAt`, `range`, `periodStart`, `periodEnd`
    - Handle edge cases: zero bookings returns 0/empty, missing check-in/check-out excluded from stay duration, invalid range defaults to 30
    - _Requirements: 1.1, 1.2, 1.6, 2.1, 3.1, 3.3, 4.1, 4.3, 5.1, 5.4, 6.1, 7.1, 7.3, 7.4, 8.1, 8.3, 9.1, 9.3, 10.1, 10.3, 11.1, 11.3, 11.5, 12.5, 13.3_

  - [ ]* 1.2 Write property tests for analytics aggregation logic
    - **Property 1: Revenue aggregation correctness** — for any set of bookings with mixed statuses, `revenue.total` equals sum of `total` for CONFIRMED/COMPLETED bookings, `revenue.average` equals total / count (or 0)
    - **Validates: Requirements 1.1, 1.2, 1.6**
    - **Property 3: Trend percentage calculation** — for any current/previous period values, trend equals `((current - previous) / previous) * 100`, handles zero previous
    - **Validates: Requirements 1.5**
    - **Property 4: Date-range revenue aggregation** — daily revenue array has one entry per day, sum of daily amounts equals total revenue for range
    - **Validates: Requirements 2.1**
    - **Property 5: Top-N hotel revenue ranking** — `revenue.byHotel` sorted descending by revenue, max 10 entries, excludes zero-revenue hotels
    - **Validates: Requirements 3.1, 3.3**
    - **Property 6: Revenue by booking source** — sum of `revenue.bySource` equals `revenue.total`, `brokerFees` equals sum of `broker_fee` for active BROKER bookings
    - **Validates: Requirements 4.1, 4.3**
    - **Property 7: Booking status metrics** — sum of `byStatus` equals `total`, conversion rate and expired rate calculated correctly
    - **Validates: Requirements 5.1, 5.4, 11.1**
    - **Property 9: Booking source counts and stay duration** — sum of `bySource` equals `total`, average stay duration excludes bookings with missing dates
    - **Validates: Requirements 7.1, 7.3, 7.4**
    - **Property 10: Hotel performance aggregation** — each hotel entry has correct booking count, revenue, average rating, review count; `zeroBookingCount` is accurate
    - **Validates: Requirements 8.1, 8.3**
    - **Property 11: Review metrics** — sum of `ratingDistribution` equals total review count, `averageRating` equals mean of all ratings
    - **Validates: Requirements 9.1, 9.3**
    - **Property 12: User counts by role and top agents** — sum of `byRole` equals `totalCount`, `topAgents` sorted descending by revenue, max 10
    - **Validates: Requirements 10.1, 10.3**
    - **Property 13: Payment status distribution and lead time** — sum of `byPaymentStatus` equals total payments, `averageLeadTime` calculated correctly
    - **Validates: Requirements 11.3, 11.5**
    - Use `fast-check` (already in service devDependencies) in `service/src/__tests__/admin-analytics.service.test.ts`

  - [ ]* 1.3 Write unit tests for analytics service
    - Test with known seed data sets verifying specific aggregation results
    - Test edge cases: zero bookings, all same status, missing metadata, large numbers
    - Place in `service/src/__tests__/admin-analytics.service.test.ts`
    - _Requirements: 1.1, 1.2, 1.6, 5.4, 7.4, 11.1_

- [x] 2. Backend analytics REST API route
  - [x] 2.1 Create `service/src/routes/admin-analytics.routes.ts` with `GET /api/admin/analytics` endpoint
    - Accept `range` query parameter (7, 30, or 90); default to 30 if invalid or missing
    - Authenticate using existing `adminAuthService.verifyAccessToken` pattern from `admin.routes.ts`
    - Call `AnalyticsService.getAnalytics({ range })` and return the full `AnalyticsResponse`
    - Return 500 with `{ success: false, error: 'Failed to load analytics data' }` on database errors
    - Export a factory function `createAnalyticsRouter(db: Database)` that returns the configured router
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.5, 13.2_

  - [ ]* 2.2 Write unit tests for analytics route
    - Test authentication enforcement (missing token, invalid token)
    - Test range parameter validation (valid values, invalid defaults to 30)
    - Test error handling (database failure returns 500)
    - Place in `service/src/__tests__/admin-analytics.routes.test.ts`
    - _Requirements: 12.5, 13.2_

- [x] 3. Checkpoint - Backend REST API
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Backend WebSocket server and event emitter
  - [x] 4.1 Create `service/src/websocket/analytics-events.ts` with the `AnalyticsEventEmitter` singleton
    - Define `AnalyticsEvent`, `BookingCreatedData`, `BookingStatusChangedData`, `PaymentReceivedData`, `ReviewSubmittedData`, and `IncrementalDelta` TypeScript interfaces
    - Implement `emitBookingCreated`, `emitBookingStatusChanged`, `emitPaymentReceived`, `emitReviewSubmitted` methods
    - Each method constructs the full `AnalyticsEvent` with computed deltas (e.g., `bookingCountAdjustment`, `revenueAdjustment`, `statusCountAdjustments`)
    - Wrap event construction in try/catch — log errors and skip malformed events
    - Export singleton via `AnalyticsEventEmitter.getInstance()`
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6, 17.1, 17.5, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [ ]* 4.2 Write property tests for event emitter
    - **Property 17: Analytics event schema conformance** — for any generated event data, the constructed event has `eventType`, `timestamp` (ISO 8601), `data` (with type-specific fields), and `delta` (with numeric adjustments)
    - **Validates: Requirements 17.1, 17.5, 18.1, 18.2, 18.3, 18.4, 18.5**
    - Use `fast-check` in `service/src/__tests__/analytics-events.test.ts`

  - [x] 4.3 Create `service/src/websocket/analytics-ws.server.ts` with the `AnalyticsWebSocketServer` class
    - Accept an `http.Server` instance; create `WebSocketServer` with `path: '/ws/analytics'`
    - Authenticate on connection: extract JWT from `?token=` query param, verify via `adminAuthService.verifyAccessToken`
    - Reject invalid/missing tokens with close code 4001 and reason "Authentication failed"
    - Store `adminUserId` and `tokenExp` on each authenticated socket
    - Implement `broadcast(event)` to send JSON to all connected clients
    - Implement token refresh timer: schedule refresh at `(tokenExp - 5 minutes)`, generate new tokens via `adminAuthService.generateTokens`, send `auth:tokenRefreshed` event
    - Clean up on client disconnect (remove from clients set, clear refresh timer)
    - Listen to `AnalyticsEventEmitter` events and broadcast to all clients
    - _Requirements: 14.1, 14.2, 14.4, 14.5, 14.6, 15.1, 16.5, 16.6_

  - [ ]* 4.4 Write property tests for WebSocket auth and backoff
    - **Property 14: WebSocket authentication** — for any JWT token string, connection accepted iff `verifyAccessToken` returns valid payload; invalid/expired/missing tokens rejected with code 4001
    - **Validates: Requirements 14.4, 14.5**
    - **Property 15: Token refresh timing** — for any JWT with expiry timestamp, refresh scheduled when remaining time ≤ 5 minutes
    - **Validates: Requirements 14.6**
    - Use `fast-check` in `service/src/__tests__/analytics-ws.server.test.ts`

- [x] 5. Checkpoint - Backend WebSocket
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Backend integration: mount routes and WebSocket in server.ts, add ws dependency
  - [x] 6.1 Add `ws` and `@types/ws` dependencies to `service/package.json`
    - Run `npm install ws` and `npm install --save-dev @types/ws` in the service directory
    - _Requirements: 14.1_

  - [x] 6.2 Integrate analytics route and WebSocket server into `service/src/server.ts`
    - Import `createAnalyticsRouter` from `admin-analytics.routes.ts` and mount it alongside existing admin routes
    - Import `AnalyticsWebSocketServer` and instantiate it with the `http.Server` instance after `server = http.createServer(app.callback())`
    - This is a minimal change to the existing `server.ts` file — only adding imports and two initialization lines
    - _Requirements: 14.1, 12.5_

  - [x] 6.3 Add event emission calls to existing route handlers
    - In booking creation routes (checkout flow), add `AnalyticsEventEmitter.getInstance().emitBookingCreated(...)` wrapped in try/catch
    - In booking status change routes (`POST /api/admin/bookings/:id/cancel` and similar), add `emitBookingStatusChanged(...)` wrapped in try/catch
    - In payment processing routes (Stripe webhook / checkout), add `emitPaymentReceived(...)` wrapped in try/catch
    - In review submission routes, add `emitReviewSubmitted(...)` wrapped in try/catch
    - Each emission is wrapped in try/catch so failures don't affect the primary operation
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6_

- [x] 7. Checkpoint - Full backend integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Frontend shared types and utilities
  - [x] 8.1 Create `management/src/types/analytics.ts` with shared TypeScript interfaces
    - Define `AnalyticsResponse`, `IncrementalDelta`, `AnalyticsEvent`, `ConnectionStatus`, and all sub-interfaces matching the design document
    - Export all types for use across frontend components
    - _Requirements: 12.1, 17.1_

  - [x] 8.2 Create `management/src/utils/formatCurrency.ts` with GBP formatting utility
    - Implement `formatGBP(value: number): string` that returns `£X.XX` with exactly two decimal places
    - Handle zero, negative, and large values with thousands separators
    - _Requirements: 1.3, 1.4, 4.4_

  - [ ]* 8.3 Write property test for GBP formatting
    - **Property 2: GBP currency formatting** — for any numeric value, output matches `£X.XX` pattern with exactly two decimal places
    - **Validates: Requirements 1.3, 1.4, 4.4**
    - Use `fast-check` in `management/src/utils/__tests__/formatCurrency.test.ts`

  - [x] 8.4 Create `management/src/utils/mergeDelta.ts` with the delta merge function
    - Implement `mergeDelta(current: AnalyticsResponse, delta: IncrementalDelta): AnalyticsResponse | null`
    - Immutably update revenue total, booking counts by status/source/payment, derived metrics (conversion rate, expired rate, average rating)
    - Return `null` if baseline data is missing to signal full refresh needed
    - _Requirements: 17.2, 17.3, 17.4_

  - [ ]* 8.5 Write property test for delta merge
    - **Property 18: Delta merge correctness** — for any valid `AnalyticsResponse` and `IncrementalDelta`, merged state has correct revenue total, status counts, and recalculated derived metrics
    - **Validates: Requirements 17.2**
    - Use `fast-check` in `management/src/utils/__tests__/mergeDelta.test.ts`

- [x] 9. Frontend analytics service and WebSocket hook
  - [x] 9.1 Update `management/src/services/analyticsService.ts` to call the new analytics endpoint
    - Replace existing placeholder methods with `getAnalytics(range: number): Promise<AnalyticsResponse>` calling `GET /api/admin/analytics?range=${range}`
    - Use the existing `api` client from `@/lib/api` which auto-attaches JWT
    - _Requirements: 12.5, 13.2_

  - [x] 9.2 Create `management/src/hooks/useAnalyticsWebSocket.ts` custom hook
    - Implement `useAnalyticsWebSocket(data, setData)` returning `{ connectionStatus, reconnect }`
    - On mount: read JWT from `localStorage('admin_token')`, connect to `ws://host:3001/ws/analytics?token=<JWT>`
    - On message: parse `AnalyticsEvent`, call `mergeDelta` to update state
    - On `auth:tokenRefreshed`: update `localStorage('admin_token')` with new token
    - On close: start exponential backoff reconnection (1s → 2s → 4s → ... → 30s cap)
    - On reconnect: trigger full data refresh via `analyticsService.getAnalytics`
    - After 10 consecutive failures: stop reconnecting, set status to `'disconnected'`
    - On unmount: close connection, clear all timers
    - _Requirements: 14.2, 14.3, 14.4, 14.6, 15.1, 15.2, 15.3, 15.4, 15.5, 16.5, 17.2, 17.3, 17.4_

  - [ ]* 9.3 Write property test for exponential backoff calculation
    - **Property 16: Exponential backoff delay calculation** — for any attempt number `n`, delay equals `min(1000 * 2^n, 30000)` ms
    - **Validates: Requirements 15.1**
    - Use `fast-check` in `management/src/hooks/__tests__/useAnalyticsWebSocket.test.ts`

- [x] 10. Frontend KPI card and shared UI components
  - [x] 10.1 Create `management/src/components/Analytics/KPICard.tsx`
    - Display metric value, label, and optional trend indicator
    - Format GBP values using `formatGBP` utility
    - Trend shows green ↑ for positive, red ↓ for negative percentage change
    - Support loading skeleton state
    - _Requirements: 1.3, 1.4, 1.5, 4.4, 5.3, 5.4, 7.3, 8.4, 9.3, 10.2, 11.2, 11.6_

  - [x] 10.2 Create `management/src/components/Analytics/DateRangeSelector.tsx`
    - Button group with 7d / 30d / 90d options
    - Active option visually highlighted
    - Calls `onChange(range)` callback when selection changes
    - _Requirements: 2.4, 13.1, 13.2_

  - [x] 10.3 Create `management/src/components/Analytics/ConnectionStatusIndicator.tsx`
    - Small badge showing WebSocket state: green dot (connected), yellow pulsing dot (reconnecting), red dot (disconnected)
    - Show manual reconnect button after max reconnection failures
    - Update within 1 second of state change
    - _Requirements: 12.6, 15.3, 15.4, 15.5_

  - [x] 10.4 Create `management/src/components/Analytics/SectionSkeleton.tsx`
    - Loading placeholder matching section layout
    - Used during initial load and date range changes
    - _Requirements: 12.2, 13.4_

- [x] 11. Frontend chart components
  - [x] 11.1 Create `management/src/components/Analytics/RevenueSection.tsx`
    - Line chart: daily revenue over time (date x-axis, revenue y-axis) using recharts
    - Horizontal bar chart: top 10 hotels by revenue
    - Pie/donut chart: revenue by booking source (DIRECT, BROKER, STAFF_CREATED)
    - KPI cards: total revenue, average booking value, broker fees (all formatted in GBP)
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4_

  - [x] 11.2 Create `management/src/components/Analytics/BookingsSection.tsx`
    - Stacked area chart: daily booking volume by status (CONFIRMED, COMPLETED, EXPIRED)
    - Pie chart: booking status breakdown
    - Bar chart: bookings by source
    - KPI cards: total bookings, conversion rate, average stay duration
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 7.1, 7.2, 7.3_

  - [x] 11.3 Create `management/src/components/Analytics/HotelPerformanceSection.tsx`
    - Bar chart: top 10 hotels by booking count with average rating overlay
    - KPI card: hotels with zero bookings
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 11.4 Create `management/src/components/Analytics/UsersAgentsSection.tsx`
    - Horizontal bar chart: top 10 agents by revenue generated
    - KPI card: total user count
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.5 Create `management/src/components/Analytics/OperationalSection.tsx`
    - Pie chart: payment status distribution
    - KPI cards: expired booking rate, average lead time in days
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 11.6 Create `management/src/components/Analytics/RatingDistributionSection.tsx`
    - Bar chart: review count for each rating value (1–5)
    - KPI card: platform-wide average rating (1 decimal place)
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 12. Frontend analytics dashboard page
  - [x] 12.1 Replace `management/src/app/admin/analytics/page.tsx` with the full dashboard
    - Manage date range state (default: 30 days)
    - Fetch data via `analyticsService.getAnalytics(range)` on mount and range change
    - Integrate `useAnalyticsWebSocket` hook for real-time updates
    - Render sections in logical order: Revenue, Bookings, Hotel Performance, Rating Distribution, Users & Agents, Operational
    - Show `SectionSkeleton` during initial load
    - Show loading overlay (without clearing existing data) during date range changes
    - Show error message with retry button on API failure
    - Display `ConnectionStatusIndicator` in page header
    - Display `DateRangeSelector` in page header
    - Use responsive grid layout: single column on mobile, multi-column on desktop
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3, 13.4, 14.2, 14.3_

  - [ ]* 12.2 Write unit tests for dashboard page and components
    - Test loading skeleton renders during fetch
    - Test error state renders with retry button
    - Test date range selector triggers re-fetch
    - Test connection status indicator shows correct states
    - Test KPI cards render formatted values
    - Place in `management/src/components/Analytics/__tests__/`
    - _Requirements: 12.2, 12.3, 13.1_

- [x] 13. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- All new code goes into new files; existing files are only touched for minimal integration (task 6)
- `recharts` is already in management dependencies; `fast-check` is already in both service and management devDependencies
- The `ws` library needs to be added to service dependencies (task 6.1)
- The existing `api` client in `management/src/lib/api.ts` auto-attaches JWT tokens from localStorage
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at backend REST, backend WebSocket, and full integration stages
