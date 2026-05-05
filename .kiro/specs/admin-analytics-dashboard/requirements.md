# Requirements Document

## Introduction

The Admin Analytics Dashboard replaces the current placeholder analytics page at `/admin/analytics` with a comprehensive, data-driven dashboard. The dashboard aggregates data from the Manasik hotel booking platform's MySQL database (bookings, hotels, users, agents, reviews, payments) and presents it through interactive charts and summary cards. The goal is to give super admins a single view of platform health across revenue, bookings, hotel performance, user activity, and operational metrics.

## Glossary

- **Dashboard**: The analytics page rendered at `/admin/analytics` in the management panel (Next.js, port 3002).
- **Analytics_API**: The set of backend endpoints under `/api/admin/analytics` on the Koa service (port 3001) that aggregate and return analytics data.
- **KPI_Card**: A summary card displaying a single key performance indicator with its current value and a trend indicator.
- **Revenue**: The sum of the `total` column from bookings with status CONFIRMED or COMPLETED.
- **Booking_Source**: The `booking_source` column on the bookings table; one of DIRECT, BROKER, STAFF_CREATED.
- **Broker_Fee**: The `broker_fee` column on the bookings table, representing the fee charged by a broker.
- **Trend_Indicator**: A visual element showing the percentage change between the current 30-day period and the previous 30-day period.
- **Chart_Component**: A recharts-based React component that renders a specific visualization (bar, line, pie, or area chart).
- **Date_Range_Selector**: A UI control that allows the admin to choose a time window (7 days, 30 days, 90 days) for filtering dashboard data.
- **Active_Booking**: A booking with status CONFIRMED or COMPLETED.
- **Expired_Booking**: A booking with status EXPIRED.
- **Cancelled_Booking**: A booking with status CANCELLED.
- **Stay_Duration**: The number of nights between check-in and check-out dates, extracted from booking metadata.
- **WebSocket_Server**: A WebSocket server instance running alongside the Koa HTTP server on the backend (port 3001), using the `ws` or `socket.io` library to push real-time events to connected clients.
- **WebSocket_Connection**: A persistent, bidirectional communication channel between the Dashboard and the WebSocket_Server, authenticated via the admin JWT token.
- **Analytics_Event**: A JSON message pushed from the WebSocket_Server to connected Dashboard clients when a booking, payment, or review change occurs on the platform.
- **Incremental_Delta**: A partial data update contained in an Analytics_Event that describes the change (e.g., new booking count, revenue adjustment) so the Dashboard can merge it into existing state without a full data re-fetch.
- **Connection_Status_Indicator**: A visual element on the Dashboard that shows the current state of the WebSocket_Connection (connected, disconnected, reconnecting).
- **Exponential_Backoff**: A reconnection strategy where the delay between reconnection attempts doubles after each failure, starting from 1 second up to a maximum of 30 seconds.

## Requirements

### Requirement 1: Revenue Summary KPI Cards

**User Story:** As a super admin, I want to see key revenue metrics at a glance, so that I can quickly assess the financial health of the platform.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return total Revenue for bookings with status CONFIRMED or COMPLETED.
2. WHEN the Dashboard loads, THE Analytics_API SHALL return the average booking value calculated as total Revenue divided by the count of Active_Bookings.
3. WHEN the Dashboard loads, THE Dashboard SHALL display a KPI_Card for total Revenue formatted in GBP (£) with two decimal places.
4. WHEN the Dashboard loads, THE Dashboard SHALL display a KPI_Card for average booking value formatted in GBP (£) with two decimal places.
5. WHEN the Dashboard loads, THE Dashboard SHALL display a Trend_Indicator on each KPI_Card showing the percentage change compared to the previous 30-day period.
6. IF the Analytics_API returns zero Active_Bookings, THEN THE Dashboard SHALL display £0.00 for total Revenue and £0.00 for average booking value.

### Requirement 2: Revenue Trend Chart

**User Story:** As a super admin, I want to see revenue trends over time, so that I can identify growth patterns and seasonal variations.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return daily revenue totals for the selected date range, aggregated from Active_Bookings.
2. THE Dashboard SHALL render a line Chart_Component showing revenue over time with the date on the x-axis and revenue amount on the y-axis.
3. WHEN the admin selects a different time window via the Date_Range_Selector, THE Dashboard SHALL re-fetch and display revenue data for the selected period.
4. THE Date_Range_Selector SHALL offer options for 7 days, 30 days, and 90 days.

### Requirement 3: Revenue by Hotel

**User Story:** As a super admin, I want to see which hotels generate the most revenue, so that I can identify top-performing properties.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return revenue totals grouped by hotel, sorted in descending order by revenue, limited to the top 10 hotels.
2. THE Dashboard SHALL render a horizontal bar Chart_Component showing hotel names on the y-axis and revenue on the x-axis.
3. WHEN a hotel has zero Active_Bookings, THE Analytics_API SHALL exclude that hotel from the top 10 results.

### Requirement 4: Revenue by Booking Source

**User Story:** As a super admin, I want to understand how revenue is distributed across booking channels, so that I can evaluate channel effectiveness.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return revenue totals grouped by Booking_Source (DIRECT, BROKER, STAFF_CREATED).
2. THE Dashboard SHALL render a pie or donut Chart_Component showing the revenue share for each Booking_Source.
3. WHEN the Dashboard loads, THE Analytics_API SHALL return total Broker_Fee collected across all broker bookings with status CONFIRMED or COMPLETED.
4. THE Dashboard SHALL display the total Broker_Fee as a separate KPI_Card formatted in GBP (£).

### Requirement 5: Booking Status Breakdown

**User Story:** As a super admin, I want to see the distribution of booking statuses, so that I can monitor platform conversion and health.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return the count of bookings grouped by status (CONFIRMED, COMPLETED, EXPIRED, CANCELLED, PENDING).
2. THE Dashboard SHALL render a pie Chart_Component showing the count for each booking status.
3. WHEN the Dashboard loads, THE Dashboard SHALL display a KPI_Card for total booking count.
4. WHEN the Dashboard loads, THE Dashboard SHALL display a KPI_Card for booking conversion rate, calculated as the count of Active_Bookings divided by the total count of all bookings, expressed as a percentage.

### Requirement 6: Booking Volume Over Time

**User Story:** As a super admin, I want to see booking volume trends, so that I can understand demand patterns.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return daily booking counts for the selected date range, grouped by booking status.
2. THE Dashboard SHALL render a stacked area Chart_Component showing booking counts over time, with separate series for CONFIRMED, COMPLETED, and EXPIRED statuses.
3. WHEN the admin selects a different time window via the Date_Range_Selector, THE Dashboard SHALL re-fetch and display booking volume data for the selected period.

### Requirement 7: Bookings by Source

**User Story:** As a super admin, I want to see how bookings are distributed across channels, so that I can assess channel contribution.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return booking counts grouped by Booking_Source.
2. THE Dashboard SHALL render a bar Chart_Component showing booking counts for each Booking_Source.
3. THE Dashboard SHALL display the average Stay_Duration in nights as a KPI_Card.
4. WHEN a booking has no check-in or check-out date in its metadata, THE Analytics_API SHALL exclude that booking from the Stay_Duration calculation.

### Requirement 8: Hotel Performance Overview

**User Story:** As a super admin, I want to compare hotel performance across bookings and ratings, so that I can identify underperforming properties.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return for each hotel: total bookings, total revenue, average rating, and total reviews.
2. THE Dashboard SHALL render a bar Chart_Component comparing the top 10 hotels by booking count alongside their average rating.
3. WHEN the Dashboard loads, THE Analytics_API SHALL return the count of hotels with zero bookings.
4. THE Dashboard SHALL display the count of hotels with zero bookings as a KPI_Card.

### Requirement 9: Rating Distribution

**User Story:** As a super admin, I want to see how reviews are distributed across rating values, so that I can gauge overall guest satisfaction.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return the count of reviews grouped by rating value (1 through 5).
2. THE Dashboard SHALL render a bar Chart_Component showing the count of reviews for each rating value.
3. THE Dashboard SHALL display the platform-wide average rating as a KPI_Card with one decimal place.

### Requirement 10: Users and Agents Summary

**User Story:** As a super admin, I want to see user and agent activity metrics, so that I can understand platform engagement.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return the count of users grouped by role (CUSTOMER, AGENT, SUPER_ADMIN, COMPANY_ADMIN).
2. THE Dashboard SHALL display a KPI_Card for total user count.
3. WHEN the Dashboard loads, THE Analytics_API SHALL return the top 10 agents ranked by total revenue generated from their bookings (status CONFIRMED or COMPLETED).
4. THE Dashboard SHALL render a horizontal bar Chart_Component showing agent names and their generated revenue.

### Requirement 11: Operational Metrics

**User Story:** As a super admin, I want to see operational health indicators, so that I can identify process issues.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Analytics_API SHALL return the expired booking rate, calculated as the count of Expired_Bookings divided by the total booking count, expressed as a percentage.
2. THE Dashboard SHALL display the expired booking rate as a KPI_Card.
3. WHEN the Dashboard loads, THE Analytics_API SHALL return the count of bookings grouped by payment status (PAID, UNPAID, PENDING, FAILED, REFUNDED).
4. THE Dashboard SHALL render a pie Chart_Component showing the payment status distribution.
5. WHEN the Dashboard loads, THE Analytics_API SHALL return the average number of days between booking creation date and check-in date for Active_Bookings.
6. THE Dashboard SHALL display the average lead time in days as a KPI_Card.

### Requirement 12: Dashboard Layout and Loading

**User Story:** As a super admin, I want the dashboard to load efficiently and display a clear layout, so that I can navigate the data without confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL organize charts and KPI_Cards into logical sections: Revenue, Bookings, Hotel Performance, Users & Agents, and Operational.
2. WHILE the Analytics_API request is in progress, THE Dashboard SHALL display a loading skeleton for each section.
3. IF the Analytics_API returns an error, THEN THE Dashboard SHALL display an error message with a retry button.
4. THE Dashboard SHALL use a responsive grid layout that adapts from a single column on mobile to a multi-column layout on desktop screens.
5. THE Analytics_API SHALL return all dashboard data in a single API call to minimize network requests.
6. THE Dashboard SHALL display a Connection_Status_Indicator showing the current state of the WebSocket_Connection (connected, disconnected, or reconnecting).

### Requirement 13: Date Range Filtering

**User Story:** As a super admin, I want to filter dashboard data by time period, so that I can analyze metrics for specific windows.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Date_Range_Selector with options: 7 days, 30 days, and 90 days.
2. WHEN the admin selects a date range, THE Dashboard SHALL pass the selected range to the Analytics_API and re-render all charts and KPI_Cards with the filtered data.
3. THE Dashboard SHALL default to the 30-day date range on initial load.
4. WHILE the Dashboard is re-fetching data after a date range change, THE Dashboard SHALL display a loading indicator without clearing the existing data.

### Requirement 14: Real-Time WebSocket Connection

**User Story:** As a super admin, I want the analytics dashboard to maintain a real-time connection to the server, so that I can see live data without manually refreshing the page.

#### Acceptance Criteria

1. THE WebSocket_Server SHALL run alongside the existing Koa HTTP server on the backend, using the `ws` or `socket.io` library.
2. WHEN the Dashboard mounts, THE Dashboard SHALL establish a WebSocket_Connection to the WebSocket_Server.
3. WHEN the Dashboard unmounts (admin navigates away from the analytics page), THE Dashboard SHALL close the WebSocket_Connection.
4. THE WebSocket_Connection SHALL authenticate using the admin JWT token during the connection handshake.
5. IF the WebSocket_Server receives a connection request without a valid admin JWT token, THEN THE WebSocket_Server SHALL reject the connection with an authentication error.
6. IF the admin JWT token is approaching expiry (within 5 minutes of expiration) while the WebSocket_Connection is active, THEN THE WebSocket_Server SHALL issue a token refresh by sending a `auth:tokenRefreshed` event containing a new JWT token to the connected client, and THE Dashboard SHALL store the refreshed token for subsequent API calls and reconnection attempts.

### Requirement 15: WebSocket Connection Management

**User Story:** As a super admin, I want the WebSocket connection to recover automatically from network interruptions, so that I do not lose real-time updates.

#### Acceptance Criteria

1. IF the WebSocket_Connection is lost, THEN THE Dashboard SHALL attempt to reconnect using Exponential_Backoff starting at 1 second and capping at 30 seconds.
2. WHEN the WebSocket_Connection is re-established after a disconnection, THE Dashboard SHALL perform a full data refresh from the Analytics_API to synchronize state.
3. WHILE the WebSocket_Connection is in a disconnected or reconnecting state, THE Connection_Status_Indicator SHALL display the current connection state to the admin.
4. WHEN the WebSocket_Connection transitions between connected, disconnected, and reconnecting states, THE Connection_Status_Indicator SHALL update within 1 second of the state change.
5. THE Dashboard SHALL limit reconnection attempts to a maximum of 10 consecutive failures before stopping and displaying a persistent error message with a manual reconnect button.

### Requirement 16: Live Data Push

**User Story:** As a super admin, I want the dashboard to update automatically when bookings, payments, or reviews change, so that I always see current data.

#### Acceptance Criteria

1. WHEN a booking is created on the backend, THE WebSocket_Server SHALL push a `booking:created` Analytics_Event to all connected Dashboard clients.
2. WHEN a booking status changes (to CONFIRMED, COMPLETED, CANCELLED, or EXPIRED), THE WebSocket_Server SHALL push a `booking:statusChanged` Analytics_Event to all connected Dashboard clients.
3. WHEN a payment is processed on the backend, THE WebSocket_Server SHALL push a `payment:received` Analytics_Event to all connected Dashboard clients.
4. WHEN a review is submitted on the backend, THE WebSocket_Server SHALL push a `review:submitted` Analytics_Event to all connected Dashboard clients.
5. WHEN the Dashboard receives an Analytics_Event, THE Dashboard SHALL update the affected charts and KPI_Cards without a full page refresh.
6. THE WebSocket_Server SHALL push Analytics_Events within 2 seconds of the triggering backend operation completing.

### Requirement 17: Incremental State Updates

**User Story:** As a super admin, I want the dashboard to apply incremental updates efficiently, so that real-time updates are fast and do not cause unnecessary data re-fetching.

#### Acceptance Criteria

1. THE WebSocket_Server SHALL include an Incremental_Delta in each Analytics_Event containing the specific data change (e.g., new booking count adjustment, revenue delta amount, updated status counts).
2. WHEN the Dashboard receives an Analytics_Event with an Incremental_Delta, THE Dashboard SHALL merge the delta into the existing client-side state rather than re-fetching all data from the Analytics_API.
3. WHEN the Dashboard loads initially or reconnects after a disconnection, THE Dashboard SHALL perform a full data fetch from the Analytics_API to establish baseline state.
4. IF the Dashboard receives an Analytics_Event that it cannot merge into the current state (e.g., missing baseline data), THEN THE Dashboard SHALL fall back to a full data refresh from the Analytics_API.
5. THE Incremental_Delta SHALL include a timestamp and event type so the Dashboard can apply updates in the correct order.

### Requirement 18: WebSocket Event Types

**User Story:** As a super admin, I want structured event types for real-time updates, so that the dashboard can handle each type of change appropriately.

#### Acceptance Criteria

1. THE WebSocket_Server SHALL support the `booking:created` event type, containing the new booking total, revenue impact in GBP, and Booking_Source.
2. THE WebSocket_Server SHALL support the `booking:statusChanged` event type, containing the booking identifier, previous status, new status, and revenue impact in GBP.
3. THE WebSocket_Server SHALL support the `payment:received` event type, containing the payment amount in GBP and associated booking identifier.
4. THE WebSocket_Server SHALL support the `review:submitted` event type, containing the review rating value and associated hotel identifier.
5. THE Analytics_Event payload SHALL conform to a consistent JSON schema with fields: `eventType`, `timestamp`, `data`, and `delta`.
6. IF the WebSocket_Server encounters an error while constructing an Analytics_Event, THEN THE WebSocket_Server SHALL log the error and skip the event rather than pushing malformed data to clients.
