# Hotel Staff Booking Modal - Design Document

## Overview

The Hotel Staff Booking Modal is a comprehensive feature that enables hotel staff members (managers and agents) to create bookings on behalf of guests directly from the hotel dashboard. This feature streamlines the booking process for walk-in guests, phone reservations, and other scenarios where staff need to create bookings without requiring guests to use the public booking interface.

The design integrates with existing systems including the email service, Stripe payment processing, and the hotel booking system. It provides a complete workflow from booking creation through payment confirmation, with email notifications at each stage.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DashboardBookingsContent                                │   │
│  │  ├─ Bookings List View                                   │   │
│  │  └─ CreateBookingModal (NEW)                             │   │
│  │     ├─ Guest Information Form                            │   │
│  │     ├─ Booking Details Form                              │   │
│  │     ├─ Booking Summary                                   │   │
│  │     └─ Payment Link Checkbox                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Koa)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Hotel Routes                                            │   │
│  │  ├─ POST /api/hotels/bookings/create-on-behalf (NEW)    │   │
│  │  ├─ POST /api/payment-links/resend (NEW)                │   │
│  │  └─ POST /api/webhooks/stripe (ENHANCED)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services                                                │   │
│  │  ├─ BookingService (ENHANCED)                            │   │
│  │  ├─ PaymentLinkService (NEW)                             │   │
│  │  ├─ EmailService (ENHANCED)                              │   │
│  │  └─ StripeCheckoutService (EXISTING)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Database (MySQL)                              │
│  ├─ bookings (ENHANCED)                                          │
│  ├─ payment_links (NEW)                                          │
│  ├─ email_audit_log (NEW)                                        │
│  ├─ guests (EXISTING)                                            │
│  └─ room_types (EXISTING)                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ├─ Stripe Checkout (Payment Processing)                         │
│  ├─ SMTP Email Service (Email Delivery)                          │
│  └─ Stripe Webhooks (Payment Confirmation)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. CreateBookingModal Component

**Location:** `frontend/src/components/Dashboard/CreateBookingModal.tsx`

**Props:**
```typescript
interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  onBookingCreated: (booking: Booking) => void;
}
```

**State Management:**
```typescript
interface FormState {
  // Guest Information
  guestEmail: string;
  firstName: string;
  lastName: string;
  guestPhone?: string;
  
  // Booking Details
  checkInDate: string;
  checkOutDate: string;
  roomTypeId: string;
  numberOfGuests: number;
  
  // Payment Options
  sendPaymentLink: boolean;
  
  // UI State
  isLoading: boolean;
  errors: Record<string, string>;
  successMessage?: string;
}
```

**Key Features:**
- Multi-step form with validation at each step
- Real-time calculation of nights and total price
- Room availability checking
- Guest capacity validation
- Email format validation
- Duplicate booking detection warning
- Accessible modal with proper ARIA labels and focus management
- Error handling with user-friendly messages

**Form Sections:**

1. **Guest Information Section**
   - Email input with validation
   - First name input
   - Last name input
   - Phone input (optional)
   - Guest lookup (check if email exists in system)

2. **Booking Details Section**
   - Check-in date picker (future dates only)
   - Check-out date picker (after check-in)
   - Room type dropdown (filtered by availability)
   - Number of guests input (with capacity validation)
   - Real-time nights calculation
   - Base price display

3. **Booking Summary Section**
   - Guest name and email
   - Check-in and check-out dates
   - Number of nights
   - Room type
   - Number of guests
   - Subtotal, tax, and total price
   - Currency display

4. **Payment Options Section**
   - "Send Payment Link to Guest" checkbox
   - Payment link validity period info
   - Create Booking button (enabled only when all required fields are valid)

#### 2. Integration with DashboardBookingsContent

**Changes to existing component:**
- Add "Create Booking" button in the header
- Pass modal state management
- Refresh bookings list after successful creation
- Display success notification

### Backend Services

#### 1. BookingService (Enhanced)

**Location:** `service/src/services/booking.service.ts`

**New Methods:**

```typescript
class BookingService {
  /**
   * Create a booking on behalf of a guest (staff-created)
   * Validates all booking details and creates the booking record
   */
  async createBookingOnBehalf(params: {
    hotelId: string;
    staffUserId: string;
    guestEmail: string;
    firstName: string;
    lastName: string;
    guestPhone?: string;
    checkInDate: string;
    checkOutDate: string;
    roomTypeId: string;
    numberOfGuests: number;
    sendPaymentLink: boolean;
  }): Promise<{
    bookingId: string;
    paymentLinkId?: string;
    paymentLinkUrl?: string;
  }>

  /**
   * Validate booking details
   */
  private async validateBookingDetails(params: any): Promise<ValidationResult>

  /**
   * Check for duplicate bookings
   */
  private async checkDuplicateBooking(params: {
    guestEmail: string;
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
  }): Promise<boolean>

  /**
   * Calculate booking price
   */
  private calculatePrice(params: {
    basePrice: number;
    nights: number;
    taxRate: number;
  }): { subtotal: number; tax: number; total: number }
}
```

#### 2. PaymentLinkService (New)

**Location:** `service/src/services/payment-link.service.ts`

**Responsibilities:**
- Generate secure payment links
- Track payment link status
- Handle payment link expiration
- Resend payment links
- Validate payment link tokens

**Methods:**

```typescript
class PaymentLinkService {
  /**
   * Generate a new payment link for a booking
   */
  async generatePaymentLink(params: {
    bookingId: string;
    guestEmail: string;
    amount: number;
    currency: string;
    expiresInDays?: number;
  }): Promise<{
    paymentLinkId: string;
    token: string;
    url: string;
    expiresAt: Date;
  }>

  /**
   * Resend payment link to guest
   */
  async resendPaymentLink(bookingId: string): Promise<{
    paymentLinkId: string;
    url: string;
    expiresAt: Date;
  }>

  /**
   * Validate payment link token
   */
  async validatePaymentLink(token: string): Promise<{
    isValid: boolean;
    bookingId?: string;
    isExpired?: boolean;
  }>

  /**
   * Mark payment link as clicked
   */
  async markPaymentLinkClicked(paymentLinkId: string): Promise<void>

  /**
   * Mark payment link as completed
   */
  async markPaymentLinkCompleted(paymentLinkId: string): Promise<void>

  /**
   * Get payment link status
   */
  async getPaymentLinkStatus(paymentLinkId: string): Promise<{
    status: 'SENT' | 'CLICKED' | 'EXPIRED' | 'COMPLETED';
    createdAt: Date;
    expiresAt: Date;
    clickedAt?: Date;
    completedAt?: Date;
  }>
}
```

#### 3. EmailService (Enhanced)

**Location:** `service/src/services/email/email.service.ts`

**New Methods:**

```typescript
class EmailService {
  /**
   * Send booking confirmation email (staff-created booking)
   */
  async sendStaffBookingConfirmation(params: {
    guestEmail: string;
    guestName: string;
    bookingId: string;
    hotelName: string;
    hotelAddress: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    total: number;
    currency: string;
    paymentLinkUrl?: string;
  }): Promise<boolean>

  /**
   * Send payment link email
   */
  async sendPaymentLinkEmail(params: {
    guestEmail: string;
    guestName: string;
    bookingId: string;
    hotelName: string;
    paymentLinkUrl: string;
    amount: number;
    currency: string;
    expiresAt: Date;
  }): Promise<boolean>

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(params: {
    guestEmail: string;
    guestName: string;
    bookingId: string;
    hotelName: string;
    hotelAddress: string;
    paymentAmount: number;
    currency: string;
    paymentDate: Date;
    paymentMethod: string;
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
  }): Promise<boolean>

  /**
   * Retry email sending with exponential backoff
   */
  private async retryEmailWithBackoff(
    emailFn: () => Promise<boolean>,
    maxRetries: number = 3
  ): Promise<boolean>
}
```

### API Endpoints

#### 1. Create Booking on Behalf

**Endpoint:** `POST /api/hotels/bookings/create-on-behalf`

**Authentication:** Required (Hotel Manager or Agent role)

**Request Body:**
```typescript
{
  hotelId: string;
  guestEmail: string;
  firstName: string;
  lastName: string;
  guestPhone?: string;
  checkInDate: string;        // YYYY-MM-DD
  checkOutDate: string;       // YYYY-MM-DD
  roomTypeId: string;
  numberOfGuests: number;
  sendPaymentLink: boolean;
}
```

**Response (Success - 201):**
```typescript
{
  success: true;
  booking: {
    id: string;
    status: 'PENDING';
    guestName: string;
    guestEmail: string;
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    total: number;
    currency: string;
    createdAt: string;
  };
  paymentLink?: {
    id: string;
    url: string;
    expiresAt: string;
  };
  message: string;
}
```

**Response (Error - 400/422):**
```typescript
{
  success: false;
  error: string;
  details?: {
    field: string;
    message: string;
  }[];
}
```

**Validation Rules:**
- Email format must be valid
- First name and last name required (non-empty)
- Check-in date must be today or later
- Check-out date must be after check-in date
- Number of guests must be >= 1 and <= room capacity
- Room must be available for selected dates
- Staff user must have HOTEL_MANAGER or AGENT role for the hotel

#### 2. Resend Payment Link

**Endpoint:** `POST /api/payment-links/resend`

**Authentication:** Required (Hotel Manager or Agent role)

**Request Body:**
```typescript
{
  bookingId: string;
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  paymentLink: {
    id: string;
    url: string;
    expiresAt: string;
  };
  message: string;
}
```

#### 3. Stripe Webhook Handler (Enhanced)

**Endpoint:** `POST /api/webhooks/stripe`

**Webhook Events Handled:**
- `checkout.session.completed` - Payment completed
- `charge.refunded` - Refund processed

**Processing Flow:**
1. Verify webhook signature
2. Extract booking ID from metadata
3. Update booking payment status
4. Send payment confirmation email
5. Log email audit trail

## Data Models

### Database Schema

#### 1. Bookings Table (Enhanced)

**New Columns:**
```sql
ALTER TABLE bookings ADD COLUMN (
  booking_source ENUM('DIRECT', 'STAFF_CREATED', 'BROKER') DEFAULT 'DIRECT',
  staff_created_by VARCHAR(36),
  payment_status ENUM('UNPAID', 'PAID', 'PARTIALLY_PAID', 'REFUNDED') DEFAULT 'UNPAID',
  payment_link_id VARCHAR(36),
  FOREIGN KEY (staff_created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_link_id) REFERENCES payment_links(id) ON DELETE SET NULL,
  INDEX idx_booking_source (booking_source),
  INDEX idx_staff_created_by (staff_created_by),
  INDEX idx_payment_link_id (payment_link_id)
);
```

#### 2. Payment Links Table (New)

```sql
CREATE TABLE IF NOT EXISTS payment_links (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  guest_email VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('SENT', 'CLICKED', 'EXPIRED', 'COMPLETED') DEFAULT 'SENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  clicked_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  stripe_session_id VARCHAR(255),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_token (token),
  INDEX idx_guest_email (guest_email),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. Email Audit Log Table (New)

```sql
CREATE TABLE IF NOT EXISTS email_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  email_type ENUM('BOOKING_CONFIRMATION', 'PAYMENT_LINK', 'PAYMENT_CONFIRMATION', 'PAYMENT_REMINDER') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('SENT', 'FAILED', 'BOUNCED', 'OPENED') DEFAULT 'SENT',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP NULL,
  metadata JSON,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_email_type (email_type),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Data Flow

#### Booking Creation Flow

```
1. Staff opens CreateBookingModal
   ↓
2. Staff enters guest information
   ├─ Email validation
   ├─ Guest lookup (check if exists)
   └─ Pre-populate if found
   ↓
3. Staff enters booking details
   ├─ Check-in/check-out dates
   ├─ Room type selection
   ├─ Number of guests
   └─ Real-time price calculation
   ↓
4. Staff reviews booking summary
   ├─ All details displayed
   ├─ Option to send payment link
   └─ Create Booking button enabled
   ↓
5. Staff clicks "Create Booking"
   ↓
6. Frontend validates all fields
   ├─ Email format
   ├─ Required fields
   ├─ Date validation
   └─ Guest count vs capacity
   ↓
7. Frontend sends POST /api/hotels/bookings/create-on-behalf
   ↓
8. Backend validates booking
   ├─ Room availability
   ├─ Duplicate booking check
   ├─ Guest capacity
   └─ Staff authorization
   ↓
9. Backend creates booking record
   ├─ Insert into bookings table
   ├─ Create guest records
   └─ Set booking_source = 'STAFF_CREATED'
   ↓
10. If sendPaymentLink = true:
    ├─ Generate payment link
    ├─ Create payment_links record
    └─ Set expiration (30 days default)
    ↓
11. Send booking confirmation email
    ├─ Include payment link if generated
    ├─ Log to email_audit_log
    └─ Retry on failure (3 attempts)
    ↓
12. Return success response to frontend
    ├─ Booking ID
    ├─ Payment link URL (if generated)
    └─ Success message
    ↓
13. Frontend closes modal
    ├─ Refresh bookings list
    ├─ Display success notification
    └─ Return to bookings view
```

#### Payment Link Flow

```
1. Guest receives booking confirmation email
   ├─ Contains payment link (if enabled)
   └─ Link expires in 30 days
   ↓
2. Guest clicks payment link
   ├─ Frontend validates token
   ├─ Marks link as CLICKED
   └─ Redirects to payment page
   ↓
3. Payment page loads
   ├─ Pre-populated with booking details
   ├─ Amount due displayed
   └─ Stripe checkout form
   ↓
4. Guest completes payment
   ├─ Stripe processes payment
   └─ Webhook triggered
   ↓
5. Stripe webhook received
   ├─ Verify webhook signature
   ├─ Extract booking ID
   ├─ Update booking status to PAID
   ├─ Mark payment link as COMPLETED
   └─ Send payment confirmation email
   ↓
6. Payment confirmation email sent
   ├─ Include booking details
   ├─ Include payment receipt
   ├─ Include check-in instructions
   └─ Log to email_audit_log
```

#### Payment Link Resend Flow

```
1. Staff views booking in dashboard
   ├─ Booking has unpaid payment link
   └─ "Resend Payment Link" option visible
   ↓
2. Staff clicks "Resend Payment Link"
   ↓
3. Frontend sends POST /api/payment-links/resend
   ├─ Booking ID
   └─ Staff authorization verified
   ↓
4. Backend generates new payment link
   ├─ Create new payment_links record
   ├─ Invalidate previous link (optional)
   └─ Set new expiration
   ↓
5. Send payment link email
   ├─ New link URL
   ├─ Expiration date
   └─ Log to email_audit_log
   ↓
6. Return success response
   ├─ New payment link URL
   └─ Expiration date
```

## Email Templates

### 1. Booking Confirmation Email (Staff-Created)

**Template:** `service/src/services/email/templates/staff-booking-confirmation.html`

**Variables:**
- Guest name
- Booking reference number
- Hotel name and address
- Room type
- Check-in date and time
- Check-out date and time
- Number of nights
- Number of guests
- Total price and currency
- Hotel contact information
- Payment link (if applicable)
- Check-in instructions link

**Key Sections:**
- Header with booking confirmation badge
- Guest greeting
- Booking details box
- Hotel information
- Payment link button (if applicable)
- Check-in instructions
- Hotel contact information
- Footer with company info

### 2. Payment Link Email

**Template:** `service/src/services/email/templates/payment-link.html`

**Variables:**
- Guest name
- Booking reference number
- Hotel name
- Amount due
- Currency
- Payment link URL
- Link expiration date
- Hotel contact information

**Key Sections:**
- Header with payment request badge
- Guest greeting
- Booking summary
- Prominent "Pay Now" button
- Link expiration warning
- Hotel contact information
- Footer

### 3. Payment Confirmation Email

**Template:** `service/src/services/email/templates/payment-confirmation.html`

**Variables:**
- Guest name
- Booking reference number
- Payment amount and currency
- Payment date and time
- Payment method
- Hotel name and address
- Room type
- Check-in and check-out dates
- Number of nights
- Check-in instructions
- Hotel contact information

**Key Sections:**
- Header with payment confirmation badge
- Guest greeting
- Payment receipt details
- Booking confirmation details
- Check-in instructions
- Hotel contact information
- Footer

## Error Handling

### Frontend Error Handling

**Validation Errors:**
- Email format invalid → Display inline error message
- Required field empty → Disable submit button, show error
- Check-out before check-in → Display date validation error
- Guest count exceeds capacity → Display capacity error
- Room not available → Display availability error

**API Errors:**
- 400 Bad Request → Display validation error details
- 403 Forbidden → Display authorization error
- 404 Not Found → Display resource not found error
- 500 Server Error → Display generic error with retry option
- Network error → Display connection error with retry option

**User Feedback:**
- Error messages displayed in red banner
- Field-level error indicators
- Helpful suggestions for resolution
- Retry button for transient errors

### Backend Error Handling

**Validation Errors:**
- Invalid email format
- Missing required fields
- Invalid date range
- Guest count out of bounds
- Room capacity exceeded

**Business Logic Errors:**
- Room not available for dates
- Duplicate booking detected
- Hotel not found
- Room type not found
- Staff not authorized for hotel

**System Errors:**
- Database connection failure
- Email service failure (non-blocking)
- Payment link generation failure
- Stripe API failure

**Error Response Format:**
```typescript
{
  success: false;
  error: string;
  errorCode?: string;
  details?: {
    field?: string;
    message: string;
  }[];
  retryable?: boolean;
}
```

## Testing Strategy

### Unit Tests

**BookingService Tests:**
- Test booking creation with valid data
- Test validation of required fields
- Test email format validation
- Test date range validation
- Test guest count validation
- Test duplicate booking detection
- Test price calculation
- Test error handling

**PaymentLinkService Tests:**
- Test payment link generation
- Test token generation and validation
- Test expiration logic
- Test payment link status tracking
- Test resend functionality
- Test error handling

**EmailService Tests:**
- Test email template rendering
- Test email sending
- Test retry logic with exponential backoff
- Test error handling
- Test email audit logging

### Integration Tests

**Booking Creation Flow:**
- Create booking with valid data
- Verify booking record created
- Verify guest records created
- Verify payment link created (if enabled)
- Verify confirmation email sent
- Verify email audit log entry created

**Payment Link Flow:**
- Generate payment link
- Verify link is valid
- Verify link expiration
- Verify link status tracking
- Verify resend functionality

**Stripe Webhook Flow:**
- Simulate checkout.session.completed event
- Verify booking status updated
- Verify payment link marked as completed
- Verify payment confirmation email sent
- Verify email audit log entry created

### E2E Tests

**Complete Booking Creation:**
- Staff opens modal
- Staff enters guest information
- Staff enters booking details
- Staff reviews summary
- Staff creates booking
- Verify booking appears in dashboard
- Verify confirmation email sent

**Payment Link Flow:**
- Guest receives email with payment link
- Guest clicks payment link
- Guest completes payment
- Verify payment confirmation email sent
- Verify booking status updated to PAID

## Security Considerations

### Authentication & Authorization

- All endpoints require authentication
- Staff must have HOTEL_MANAGER or AGENT role
- Staff can only create bookings for hotels they manage
- Payment link tokens are cryptographically secure
- Payment link tokens expire after configured period

### Data Protection

- Email addresses validated and sanitized
- Guest information encrypted in transit (HTTPS)
- Payment information handled by Stripe (PCI compliant)
- Database queries use parameterized statements
- Sensitive data not logged

### Email Security

- Email addresses validated before sending
- Email templates sanitized to prevent injection
- Email audit log tracks all sends
- Failed emails logged for investigation
- Retry logic prevents email storms

### Payment Security

- Stripe webhook signatures verified
- Payment link tokens cryptographically secure
- Payment status verified before marking as paid
- Idempotent payment processing (prevent double-charging)

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns
- Payment link token indexed for fast lookup
- Email audit log indexed by booking and status
- Booking source indexed for filtering

### Email Optimization

- Async email sending (non-blocking)
- Email retry logic with exponential backoff
- Email templates pre-compiled
- Batch email sending for multiple recipients

### API Optimization

- Request validation before database queries
- Caching of room availability data
- Pagination for large result sets
- Rate limiting on payment link resend

## Accessibility

### Frontend Accessibility

- Modal has proper ARIA role and labels
- Form fields have associated labels
- Error messages announced to screen readers
- Focus management within modal
- Keyboard navigation support (Tab, Shift+Tab, Escape)
- Color contrast meets WCAG AA standards
- Form validation errors clearly indicated

### Email Accessibility

- Email templates use semantic HTML
- Color not sole means of conveying information
- Links have descriptive text
- Images have alt text
- Font sizes readable
- Sufficient color contrast

## Configuration

### Environment Variables

```
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=password
SMTP_FROM=noreply@example.com
SMTP_SECURE=true

# Payment Link Configuration
PAYMENT_LINK_EXPIRY_DAYS=30
PAYMENT_LINK_BASE_URL=https://example.com/payment

# Stripe Configuration
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Retry Configuration
EMAIL_MAX_RETRIES=3
EMAIL_RETRY_DELAY_MS=1000
EMAIL_RETRY_BACKOFF_MULTIPLIER=2
```

### Feature Flags

- `hotelStaffBooking` - Enable/disable staff booking modal
- `paymentLinks` - Enable/disable payment link generation
- `staffBookingEmails` - Enable/disable confirmation emails

## Future Enhancements

1. **Bulk Booking Import** - Import bookings from CSV/Excel
2. **Booking Templates** - Save and reuse booking configurations
3. **Guest Management** - Manage guest profiles and preferences
4. **Payment Reminders** - Automated payment reminder emails
5. **Booking Modifications** - Allow staff to modify existing bookings
6. **Cancellation Handling** - Automated refund processing
7. **Multi-language Support** - Email templates in multiple languages
8. **SMS Notifications** - Send SMS payment links and confirmations
9. **Payment Analytics** - Dashboard showing payment metrics
10. **Integration with PMS** - Sync with property management systems


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Email Format Validation

*For any email string entered in the Guest Email field, if the email format is valid (matches standard email validation rules), the system SHALL accept it and clear any validation error messages.*

**Validates: Requirements 2.2, 2.3, 11.1, 11.2, 11.3**

### Property 2: Guest Lookup and Pre-population

*For any valid email address entered, the system SHALL check if a guest account exists with that email and pre-populate available guest information if found, or allow proceeding with a new guest if not found.*

**Validates: Requirements 2.4, 2.5, 2.6**

### Property 3: Name Field Acceptance

*For any string composed of alphabetic characters and common name punctuation (hyphens, apostrophes), the system SHALL accept it in both First Name and Last Name fields.*

**Validates: Requirements 3.2, 3.3**

### Property 4: Required Name Validation

*For any attempt to create a booking with an empty first name or last name field, the system SHALL display a validation error and prevent booking creation.*

**Validates: Requirements 3.4, 3.5**

### Property 5: Check-In Date Validation

*For any date selected in the Check-In Date field, if the date is in the past, the system SHALL display a validation error indicating the check-in date must be today or later.*

**Validates: Requirements 4.3, 4.4**

### Property 6: Check-In Date Storage Format

*For any valid future date selected as check-in, the system SHALL store it in ISO 8601 format (YYYY-MM-DD).*

**Validates: Requirements 4.4**

### Property 7: Check-In Date Change Clears Invalid Check-Out

*For any change to the check-in date, if a previously selected check-out date is before or equal to the new check-in date, the system SHALL clear the check-out date.*

**Validates: Requirements 4.5**

### Property 8: Check-Out Date Validation

*For any check-out date selected that is before or equal to the check-in date, the system SHALL display a validation error indicating the check-out date must be after the check-in date.*

**Validates: Requirements 5.3**

### Property 9: Nights Calculation

*For any valid check-in and check-out date pair, the system SHALL automatically calculate the number of nights as the difference in days and display it in the summary.*

**Validates: Requirements 5.4, 5.5**

### Property 10: Room Type Display

*For any selected room type, the system SHALL display the room type name and base price in the form.*

**Validates: Requirements 6.3**

### Property 11: Room Availability Checking

*For any date range with no available rooms, the system SHALL display a message indicating no rooms are available for those dates.*

**Validates: Requirements 6.4**

### Property 12: Room Type ID Storage

*For any selected room type, the system SHALL store the room type ID with the booking record.*

**Validates: Requirements 6.5**

### Property 13: Guest Count Validation - Positive Integers

*For any number entered in the Number of Guests field, if it is a positive integer, the system SHALL accept it.*

**Validates: Requirements 7.2**

### Property 14: Guest Count Validation - Minimum

*For any zero or negative number entered in the Number of Guests field, the system SHALL display a validation error indicating the number must be at least 1.*

**Validates: Requirements 7.3**

### Property 15: Guest Count Validation - Capacity

*For any guest count that exceeds the selected room type's maximum occupancy, the system SHALL display a validation error indicating the maximum occupancy.*

**Validates: Requirements 7.4**

### Property 16: Guest Count Storage

*For any valid guest count entered, the system SHALL store it with the booking record.*

**Validates: Requirements 7.5**

### Property 17: Booking Summary Display

*For any complete booking with all required fields filled, the system SHALL display a summary section showing guest name, email, check-in date, check-out date, number of nights, room type, number of guests, and total price.*

**Validates: Requirements 8.2**

### Property 18: Summary Real-Time Updates

*For any change to booking details, the summary section SHALL update in real-time to reflect the current values.*

**Validates: Requirements 8.3**

### Property 19: Currency Display

*For any booking, the total price displayed in the summary SHALL be shown in the hotel's configured currency.*

**Validates: Requirements 8.4**

### Property 20: Create Button State - Enabled

*For any form state where all required fields are filled with valid data, the "Create Booking" button SHALL be enabled.*

**Validates: Requirements 9.1**

### Property 21: Create Button State - Disabled

*For any form state where any required field is empty or contains invalid data, the "Create Booking" button SHALL be disabled.*

**Validates: Requirements 9.2**

### Property 22: Booking Validation on Submit

*For any booking submission, the system SHALL validate all booking information before creating the record.*

**Validates: Requirements 9.3**

### Property 23: Booking Creation on Valid Data

*For any valid booking data submitted, the system SHALL create a new booking record with the entered information.*

**Validates: Requirements 9.4**

### Property 24: Validation Error Display

*For any invalid field in a booking submission, the system SHALL display a validation error message for that field.*

**Validates: Requirements 9.5**

### Property 25: Modal Close and List Refresh

*For any successful booking creation, the Booking_Modal SHALL close and the bookings dashboard SHALL refresh to display the newly created booking.*

**Validates: Requirements 9.6**

### Property 26: Success Message Display

*For any successful booking creation, the system SHALL display a success message confirming the booking was created.*

**Validates: Requirements 9.7**

### Property 27: Server Error Handling

*For any server error during booking creation, the system SHALL display an error message indicating the booking could not be created.*

**Validates: Requirements 10.1**

### Property 28: Room Availability Error Handling

*For any booking creation failure due to room unavailability, the system SHALL display a message indicating the room is no longer available and suggest selecting a different room or date.*

**Validates: Requirements 10.2**

### Property 29: Invalid Guest Information Error Handling

*For any booking creation failure due to invalid guest information, the system SHALL display a message indicating which guest information is invalid.*

**Validates: Requirements 10.3**

### Property 30: Modal Remains Open on Error

*For any error during booking creation, the Booking_Modal SHALL remain open so the staff member can correct the information and retry.*

**Validates: Requirements 10.4**

### Property 31: Error Message Dismissal

*For any error message displayed, the system SHALL provide a way to dismiss the error message and continue editing.*

**Validates: Requirements 10.5**

### Property 32: Email Format Validation on Submit

*For any booking submission with an invalid email format, the system SHALL not allow booking creation.*

**Validates: Requirements 11.4**

### Property 33: Duplicate Booking Detection

*For any booking creation attempt, the system SHALL check if a booking already exists for the same guest email, room type, and overlapping date range.*

**Validates: Requirements 12.1**

### Property 34: Duplicate Booking Warning

*For any duplicate booking detected, the system SHALL display a warning message indicating a potential duplicate booking.*

**Validates: Requirements 12.2**

### Property 35: Duplicate Booking User Choice

*For any duplicate booking detected, the system SHALL allow the staff member to either cancel the operation or proceed with creating the booking.*

**Validates: Requirements 12.3**

### Property 36: Staff-Created Booking Metadata

*For any staff-created booking that proceeds despite duplicate detection, the system SHALL create the booking with a note indicating it was created by staff.*

**Validates: Requirements 12.4**

### Property 37: New Booking Appears in Dashboard

*For any booking created using the Booking_Modal, the newly created booking SHALL appear in the bookings dashboard list immediately after creation.*

**Validates: Requirements 13.1**

### Property 38: Dashboard State Preservation

*For any Booking_Modal close, the bookings dashboard SHALL remain on the same page and view as before the modal was opened.*

**Validates: Requirements 13.2**

### Property 39: Modal Does Not Affect Dashboard Filters

*For any bookings dashboard with active filters or sort state, the Booking_Modal SHALL not affect the current filter or sort state.*

**Validates: Requirements 13.3**

### Property 40: Staff-Created Booking Consistency

*For any booking created using the Booking_Modal, the booking SHALL have the same status and properties as bookings created through other methods.*

**Validates: Requirements 13.4**

### Property 41: Keyboard Navigation

*For any open Booking_Modal, the modal SHALL be keyboard navigable using Tab and Shift+Tab keys.*

**Validates: Requirements 14.1**

### Property 42: Focus Management

*For any open Booking_Modal, focus SHALL be trapped within the modal and not escape to the background.*

**Validates: Requirements 14.2**

### Property 43: ARIA Accessibility

*For any open Booking_Modal, the modal SHALL have a proper ARIA role and labels for all form fields.*

**Validates: Requirements 14.3**

### Property 44: Screen Reader Error Announcements

*For any validation error in the Booking_Modal, the error SHALL be announced to screen reader users.*

**Validates: Requirements 14.4**

### Property 45: Focus Restoration on Close

*For any Booking_Modal close, focus SHALL return to the button that opened the modal.*

**Validates: Requirements 14.5**

### Property 46: Booking Confirmation Email Sending

*For any successful booking creation, the system SHALL send a confirmation email to the guest's email address.*

**Validates: Requirements 15.1**

### Property 47: Booking Confirmation Email Content

*For any confirmation email sent, the email SHALL include the guest's name, booking reference number, check-in date, check-out date, room type, and number of nights.*

**Validates: Requirements 15.2**

### Property 48: Booking Confirmation Email Hotel Info

*For any confirmation email sent, the email SHALL include the hotel name, address, and contact information.*

**Validates: Requirements 15.3**

### Property 49: Booking Confirmation Email Price

*For any confirmation email sent, the email SHALL include the total booking price.*

**Validates: Requirements 15.4**

### Property 50: Email Failure Non-Blocking

*For any email sending failure, the system SHALL log the error and display a warning message to the staff member, but SHALL NOT prevent the booking from being created.*

**Validates: Requirements 15.5**

### Property 51: Email Sender Configuration

*For any confirmation email sent, the email SHALL be sent from a hotel-branded email address if configured.*

**Validates: Requirements 15.6**

### Property 52: Booking Details Link in Email

*For any confirmation email sent to a guest with an account, the email SHALL include a link to view the booking details in the guest's account.*

**Validates: Requirements 15.7**

### Property 53: Payment Link Generation

*For any booking created with the "Send Payment Link to Guest" checkbox checked, the system SHALL generate a secure payment link for the booking.*

**Validates: Requirements 16.2**

### Property 54: Payment Link Expiration

*For any generated payment link, the link SHALL be valid for a configurable time period (e.g., 30 days).*

**Validates: Requirements 16.3**

### Property 55: Payment Link Email Content

*For any confirmation email sent with a payment link, the email SHALL include a prominent "Pay Now" button or link that directs the guest to the payment page.*

**Validates: Requirements 16.4**

### Property 56: Payment Page Pre-population

*For any guest click on a payment link, the guest SHALL be directed to a payment page pre-populated with the booking details and amount due.*

**Validates: Requirements 16.5**

### Property 57: Payment Completion Flow

*For any guest completion of payment via the payment link, the booking payment status SHALL be updated to "Paid" and the guest SHALL receive a payment confirmation email.*

**Validates: Requirements 16.6**

### Property 58: Conditional Payment Link in Email

*For any confirmation email sent with the "Send Payment Link to Guest" checkbox unchecked, the email SHALL NOT include a payment link.*

**Validates: Requirements 16.7**

### Property 59: Payment Link Status Tracking

*For any generated payment link, the system SHALL track the payment link status (sent, clicked, expired, completed).*

**Validates: Requirements 16.8**

### Property 60: Payment Link Resend

*For any resend payment link action, the system SHALL generate a new payment link and send it to the guest's email.*

**Validates: Requirements 17.2**

### Property 61: Previous Payment Link Invalidation

*For any new payment link generation, the previous payment link SHALL be invalidated.*

**Validates: Requirements 17.3**

### Property 62: Expired Payment Link Handling

*For any expired payment link, the system SHALL display a message indicating the link has expired and provide an option to generate a new one.*

**Validates: Requirements 17.4**

### Property 63: Resend Payment Link Email

*For any payment link resend, the guest SHALL receive a new confirmation email with the updated payment link.*

**Validates: Requirements 17.5**

### Property 64: Resend Audit Logging

*For any payment link resend, the system SHALL log the resend action with timestamp and staff member information.*

**Validates: Requirements 17.6**

### Property 65: Payment Confirmation Email Sending

*For any guest completion of full payment via the payment link, the system SHALL send a payment confirmation email to the guest's email address.*

**Validates: Requirements 18.1**

### Property 66: Payment Confirmation Email Content - Payment Details

*For any payment confirmation email sent, the email SHALL include the booking reference number, payment amount, payment date and time, and payment method.*

**Validates: Requirements 18.2**

### Property 67: Payment Confirmation Email Content - Booking Details

*For any payment confirmation email sent, the email SHALL include the booking details (check-in date, check-out date, room type, number of nights, hotel name and address).*

**Validates: Requirements 18.3**

### Property 68: Payment Confirmation Email Content - Confirmation Statement

*For any payment confirmation email sent, the email SHALL include a statement confirming the booking is fully paid and the guest is confirmed for their stay.*

**Validates: Requirements 18.4**

### Property 69: Payment Confirmation Email Content - Check-In Info

*For any payment confirmation email sent, the email SHALL include check-in instructions or a link to view check-in details.*

**Validates: Requirements 18.5**

### Property 70: Payment Confirmation Email Content - Contact Info

*For any payment confirmation email sent, the email SHALL include the hotel's contact information for any questions or changes.*

**Validates: Requirements 18.6**

### Property 71: Email Retry with Exponential Backoff

*For any payment confirmation email sending failure, the system SHALL log the error and retry sending the email up to 3 times with exponential backoff.*

**Validates: Requirements 18.7**

### Property 72: Booking Status Update on Payment

*For any payment confirmation email sent, the booking status SHALL be updated to "Confirmed" or "Paid" depending on system configuration.*

**Validates: Requirements 18.8**

### Property 73: Payment Email Audit Logging

*For any payment confirmation email sent, the system SHALL log the email send action with timestamp and payment details for audit purposes.*

**Validates: Requirements 18.9**

## Property Reflection

After reviewing all 73 properties identified as testable in the prework analysis, the following redundancies and consolidations have been identified:

**Consolidated Properties:**

1. **Email Validation Properties (1, 2, 3, 11, 32)** - These properties all test email validation logic. They can be consolidated into a single comprehensive property that tests email validation across all scenarios (valid, invalid, on submit, etc.).

2. **Name Validation Properties (3, 4)** - These test name field acceptance and can be consolidated into a single property testing name validation.

3. **Check-In Date Properties (5, 6, 7)** - These test check-in date validation, storage, and interaction. They can be consolidated into a single property.

4. **Check-Out Date Properties (8, 9)** - These test check-out date validation and nights calculation. They can be consolidated.

5. **Guest Count Properties (13, 14, 15, 16)** - These test guest count validation across multiple scenarios. They can be consolidated into a single comprehensive property.

6. **Booking Summary Properties (17, 18, 19)** - These test summary display and updates. They can be consolidated.

7. **Create Button State Properties (20, 21)** - These test button enable/disable logic. They can be consolidated.

8. **Error Handling Properties (27, 28, 29, 30, 31)** - These test various error scenarios. They can be consolidated into a single error handling property.

9. **Duplicate Booking Properties (33, 34, 35, 36)** - These test duplicate detection and handling. They can be consolidated.

10. **Accessibility Properties (41, 42, 43, 44, 45)** - These test various accessibility features. They can be consolidated into a single comprehensive accessibility property.

11. **Booking Confirmation Email Properties (46, 47, 48, 49, 50, 51, 52)** - These test confirmation email sending and content. They can be consolidated.

12. **Payment Link Properties (53, 54, 55, 56, 57, 58, 59)** - These test payment link generation and usage. They can be consolidated.

13. **Payment Link Resend Properties (60, 61, 62, 63, 64)** - These test resend functionality. They can be consolidated.

14. **Payment Confirmation Email Properties (65, 66, 67, 68, 69, 70, 71, 72, 73)** - These test payment confirmation email sending and content. They can be consolidated.

**Recommended Consolidated Properties:**

After consolidation, the following 14 core properties remain:

1. Email validation (covers all email validation scenarios)
2. Name validation (covers first and last name)
3. Check-in date validation and storage
4. Check-out date validation and nights calculation
5. Room type selection and storage
6. Guest count validation (covers all scenarios)
7. Booking summary display and updates
8. Create button state management
9. Booking creation and validation
10. Error handling and recovery
11. Duplicate booking detection and handling
12. Dashboard integration and state preservation
13. Accessibility features
14. Email sending and retry logic (covers all email types)

These 14 consolidated properties provide comprehensive coverage of the feature while eliminating redundancy and focusing on unique validation value.
