# Implementation Plan: Hotel Staff Booking Modal

## Overview

This implementation plan breaks down the hotel staff booking modal feature into discrete, manageable coding tasks. The feature enables hotel staff to create bookings on behalf of guests directly from the dashboard, with integrated payment link generation and email confirmation workflows.

The implementation follows a logical progression: database setup → backend services → API endpoints → frontend components → email templates → comprehensive testing.

## Tasks

- [x] 1. Database Setup and Migrations
  - [ ] 1.1 Create payment_links table migration
    - Create migration file for payment_links table with all required columns
    - Add indexes for booking_id, token, guest_email, status, and expires_at
    - _Requirements: 16.2, 16.3, 17.2, 17.3_
  
  - [ ] 1.2 Create email_audit_log table migration
    - Create migration file for email_audit_log table with all required columns
    - Add indexes for booking_id, recipient_email, email_type, status, and sent_at
    - _Requirements: 15.5, 17.6, 18.7, 18.9_
  
  - [ ] 1.3 Enhance bookings table with new columns
    - Add booking_source, staff_created_by, payment_status, and payment_link_id columns
    - Add foreign key constraints and indexes
    - _Requirements: 9.4, 12.4, 16.2, 18.8_

- [ ] 2. Backend Service Implementation - BookingService
  - [ ] 2.1 Enhance BookingService with staff booking creation method
    - Implement createBookingOnBehalf() method with full parameter validation
    - Implement validateBookingDetails() private method
    - Implement checkDuplicateBooking() private method
    - Implement calculatePrice() private method
    - _Requirements: 2.4, 2.5, 3.4, 3.5, 4.3, 5.3, 6.4, 7.3, 7.4, 9.3, 9.4, 12.1_
  
  - [ ]* 2.2 Write property tests for BookingService staff booking creation
    - **Property 22: Booking Validation on Submit**
    - **Property 23: Booking Creation on Valid Data**
    - **Validates: Requirements 9.3, 9.4**
  
  - [ ]* 2.3 Write unit tests for BookingService validation methods
    - Test email format validation
    - Test date range validation
    - Test guest count validation
    - Test duplicate booking detection
    - _Requirements: 2.2, 3.4, 4.3, 5.3, 7.3, 12.1_

- [ ] 3. Backend Service Implementation - PaymentLinkService
  - [ ] 3.1 Create PaymentLinkService with payment link generation
    - Implement generatePaymentLink() method with secure token generation
    - Implement resendPaymentLink() method
    - Implement validatePaymentLink() method
    - Implement markPaymentLinkClicked() method
    - Implement markPaymentLinkCompleted() method
    - Implement getPaymentLinkStatus() method
    - _Requirements: 16.2, 16.3, 17.2, 17.3, 17.4_
  
  - [ ]* 3.2 Write property tests for PaymentLinkService
    - **Property 53: Payment Link Generation**
    - **Property 54: Payment Link Expiration**
    - **Property 59: Payment Link Status Tracking**
    - **Validates: Requirements 16.2, 16.3, 16.8_
  
  - [ ]* 3.3 Write unit tests for PaymentLinkService
    - Test token generation and validation
    - Test expiration logic
    - Test status transitions
    - Test resend functionality
    - _Requirements: 16.2, 16.3, 17.2, 17.3_

- [ ] 4. Backend Service Implementation - EmailService Enhancement
  - [ ] 4.1 Enhance EmailService with staff booking confirmation email
    - Implement sendStaffBookingConfirmation() method
    - Create email template for staff-created booking confirmation
    - Include payment link in email if applicable
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6, 15.7, 16.4_
  
  - [ ] 4.2 Implement payment link email method
    - Implement sendPaymentLinkEmail() method
    - Create email template for payment link
    - Include prominent "Pay Now" button
    - _Requirements: 16.4, 17.5_
  
  - [ ] 4.3 Implement payment confirmation email method
    - Implement sendPaymentConfirmation() method
    - Create email template for payment confirmation
    - Include check-in instructions
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  
  - [ ] 4.4 Implement email retry logic with exponential backoff
    - Implement retryEmailWithBackoff() private method
    - Configure retry count and backoff multiplier
    - Log retry attempts to email_audit_log
    - _Requirements: 15.5, 18.7_
  
  - [ ]* 4.5 Write property tests for EmailService
    - **Property 46: Booking Confirmation Email Sending**
    - **Property 65: Payment Confirmation Email Sending**
    - **Property 71: Email Retry with Exponential Backoff**
    - **Validates: Requirements 15.1, 18.1, 18.7_
  
  - [ ]* 4.6 Write unit tests for EmailService email methods
    - Test email template rendering
    - Test email sending
    - Test retry logic
    - Test error handling
    - _Requirements: 15.1, 15.5, 18.1, 18.7_

- [ ] 5. API Endpoint Implementation - Create Booking on Behalf
  - [ ] 5.1 Implement POST /api/hotels/bookings/create-on-behalf endpoint
    - Create route handler with authentication middleware
    - Validate request body parameters
    - Call BookingService.createBookingOnBehalf()
    - Handle validation errors and return appropriate responses
    - _Requirements: 9.3, 9.4, 9.5, 10.1, 10.2, 10.3_
  
  - [ ] 5.2 Implement authorization check for staff role
    - Verify staff user has HOTEL_MANAGER or AGENT role
    - Verify staff has access to the specified hotel
    - Return 403 Forbidden if unauthorized
    - _Requirements: 1.1_
  
  - [ ] 5.3 Implement error handling and response formatting
    - Handle validation errors with field-level details
    - Handle room availability errors
    - Handle duplicate booking warnings
    - Return appropriate HTTP status codes
    - _Requirements: 10.1, 10.2, 10.3, 12.2_
  
  - [ ]* 5.4 Write integration tests for create booking endpoint
    - Test successful booking creation
    - Test validation error handling
    - Test authorization checks
    - Test duplicate booking detection
    - _Requirements: 9.3, 9.4, 10.1, 12.1_

- [ ] 6. API Endpoint Implementation - Resend Payment Link
  - [ ] 6.1 Implement POST /api/payment-links/resend endpoint
    - Create route handler with authentication middleware
    - Validate booking ID parameter
    - Call PaymentLinkService.resendPaymentLink()
    - Send payment link email
    - _Requirements: 17.2, 17.5, 17.6_
  
  - [ ] 6.2 Implement authorization and validation
    - Verify staff user has access to the booking's hotel
    - Verify booking exists and has unpaid payment link
    - Return appropriate error responses
    - _Requirements: 17.2_
  
  - [ ]* 6.3 Write integration tests for resend payment link endpoint
    - Test successful payment link resend
    - Test authorization checks
    - Test error handling
    - _Requirements: 17.2, 17.5, 17.6_

- [ ] 7. API Endpoint Enhancement - Stripe Webhook Handler
  - [ ] 7.1 Enhance POST /api/webhooks/stripe endpoint
    - Add handling for checkout.session.completed event
    - Extract booking ID from Stripe session metadata
    - Update booking payment status to PAID
    - Mark payment link as COMPLETED
    - _Requirements: 16.6, 18.8_
  
  - [ ] 7.2 Implement payment confirmation email sending
    - Call EmailService.sendPaymentConfirmation()
    - Log email send to email_audit_log
    - Handle email sending failures gracefully
    - _Requirements: 18.1, 18.9_
  
  - [ ] 7.3 Implement webhook signature verification
    - Verify Stripe webhook signature
    - Prevent replay attacks
    - Log webhook events for audit trail
    - _Requirements: 18.9_
  
  - [ ]* 7.4 Write integration tests for Stripe webhook handler
    - Test successful payment completion flow
    - Test webhook signature verification
    - Test payment confirmation email sending
    - _Requirements: 16.6, 18.1, 18.8_

- [x] 8. Frontend Component Implementation - CreateBookingModal
  - [x] 8.1 Create CreateBookingModal component structure
    - Create component file at frontend/src/components/Dashboard/CreateBookingModal.tsx
    - Define TypeScript interfaces for props and form state
    - Implement modal container with proper ARIA attributes
    - _Requirements: 1.2, 1.3, 14.3_
  
  - [x] 8.2 Implement guest information form section
    - Create email input field with validation
    - Create first name and last name input fields
    - Create optional phone input field
    - Implement real-time email format validation
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 11.1, 11.2, 11.3_
  
  - [x] 8.3 Implement guest lookup functionality
    - Call API to check if guest exists by email
    - Pre-populate guest information if found
    - Display guest lookup status
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [x] 8.4 Implement booking details form section
    - Create check-in date picker (future dates only)
    - Create check-out date picker (after check-in)
    - Implement date validation and error messages
    - Implement automatic nights calculation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 8.5 Implement room type selection
    - Create room type dropdown/selector
    - Fetch available room types for hotel
    - Filter room types by availability for selected dates
    - Display room type name and base price
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 8.6 Implement number of guests input
    - Create number input field with validation
    - Validate minimum (>= 1) and maximum (room capacity)
    - Display validation errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 8.7 Implement booking summary section
    - Display guest name, email, check-in/check-out dates
    - Display number of nights, room type, number of guests
    - Display subtotal, tax, and total price
    - Implement real-time summary updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.8 Implement payment link checkbox option
    - Create "Send Payment Link to Guest" checkbox
    - Display payment link validity period info
    - _Requirements: 16.1_
  
  - [x] 8.9 Implement form validation and submit button
    - Implement comprehensive form validation
    - Enable/disable Create Booking button based on validation state
    - Display field-level validation errors
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 8.10 Implement duplicate booking detection warning
    - Call API to check for duplicate bookings
    - Display warning message if duplicate detected
    - Allow user to proceed or cancel
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 8.11 Implement booking creation submission
    - Call POST /api/hotels/bookings/create-on-behalf endpoint
    - Handle loading state during submission
    - Display success message on successful creation
    - Close modal and refresh bookings list
    - _Requirements: 9.6, 9.7_
  
  - [x] 8.12 Implement error handling and recovery
    - Display error messages for various failure scenarios
    - Provide error dismissal mechanism
    - Keep modal open for error recovery
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 8.13 Implement accessibility features
    - Add proper ARIA labels and roles
    - Implement keyboard navigation (Tab, Shift+Tab, Escape)
    - Implement focus management and trapping
    - Announce validation errors to screen readers
    - Restore focus to trigger button on close
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ]* 8.14 Write property tests for CreateBookingModal
    - **Property 1: Email Format Validation**
    - **Property 5: Check-In Date Validation**
    - **Property 8: Check-Out Date Validation**
    - **Property 13: Guest Count Validation - Positive Integers**
    - **Property 20: Create Button State - Enabled**
    - **Property 21: Create Button State - Disabled**
    - **Validates: Requirements 2.2, 4.3, 5.3, 7.2, 9.1, 9.2_
  
  - [ ]* 8.15 Write unit tests for CreateBookingModal component
    - Test form rendering and initial state
    - Test input field changes and validation
    - Test date picker functionality
    - Test room type selection
    - Test summary updates
    - Test form submission
    - _Requirements: 2.1, 4.1, 6.1, 7.1, 8.1, 9.1_

- [x] 9. Frontend Integration - DashboardBookingsContent
  - [x] 9.1 Add Create Booking button to dashboard header
    - Add button to open CreateBookingModal
    - Style button to match dashboard design
    - _Requirements: 1.1_
  
  - [x] 9.2 Integrate CreateBookingModal with DashboardBookingsContent
    - Manage modal open/close state
    - Pass required props to modal component
    - Implement onBookingCreated callback
    - _Requirements: 1.2, 1.3_
  
  - [x] 9.3 Implement bookings list refresh after booking creation
    - Refresh bookings list after successful creation
    - Maintain current filter and sort state
    - Display success notification
    - _Requirements: 9.6, 13.1, 13.2, 13.3_
  
  - [x] 9.4 Implement modal close and state preservation
    - Close modal after successful booking creation
    - Preserve dashboard view state (filters, sorting, pagination)
    - Return focus to Create Booking button
    - _Requirements: 1.4, 13.2, 13.3, 14.5_
  
  - [ ]* 9.5 Write integration tests for DashboardBookingsContent
    - Test modal opening and closing
    - Test booking creation flow
    - Test bookings list refresh
    - Test state preservation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 13.1, 13.2, 13.3_

- [ ] 10. Email Template Implementation
  - [ ] 10.1 Create booking confirmation email template
    - Create HTML template file for staff-created booking confirmation
    - Include all required booking details
    - Include payment link if applicable
    - Include hotel contact information
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6, 15.7_
  
  - [ ] 10.2 Create payment link email template
    - Create HTML template file for payment link email
    - Include prominent "Pay Now" button
    - Include booking summary
    - Include link expiration date
    - _Requirements: 16.4, 17.5_
  
  - [ ] 10.3 Create payment confirmation email template
    - Create HTML template file for payment confirmation
    - Include payment receipt details
    - Include booking confirmation details
    - Include check-in instructions
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  
  - [ ]* 10.4 Write tests for email template rendering
    - Test template variable substitution
    - Test HTML structure and accessibility
    - Test email rendering in various clients
    - _Requirements: 15.1, 16.4, 18.1_

- [ ] 11. Checkpoint - Core Feature Complete
  - Ensure all tests pass for database, services, API endpoints, and frontend components
  - Verify booking creation flow end-to-end
  - Verify email sending functionality
  - Ask the user if questions arise

- [ ] 12. Integration Testing - Complete Workflows
  - [ ] 12.1 Write integration test for complete booking creation workflow
    - Test staff opens modal
    - Test staff enters guest information
    - Test staff enters booking details
    - Test staff reviews summary
    - Test staff creates booking
    - Verify booking appears in dashboard
    - Verify confirmation email sent
    - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.6, 9.7, 13.1, 15.1_
  
  - [ ] 12.2 Write integration test for payment link workflow
    - Test payment link generation
    - Test payment link email sending
    - Test guest clicks payment link
    - Test payment page pre-population
    - Test payment completion
    - Verify payment confirmation email sent
    - Verify booking status updated to PAID
    - _Requirements: 16.2, 16.4, 16.5, 16.6, 18.1, 18.8_
  
  - [ ] 12.3 Write integration test for payment link resend workflow
    - Test staff resends payment link
    - Test new payment link generated
    - Test previous link invalidated
    - Test new payment link email sent
    - Verify resend action logged
    - _Requirements: 17.2, 17.3, 17.5, 17.6_
  
  - [ ] 12.4 Write integration test for duplicate booking detection
    - Test duplicate booking detection
    - Test warning message displayed
    - Test user can proceed or cancel
    - Test booking created with staff note
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 12.5 Write integration test for error handling
    - Test validation error handling
    - Test room availability error handling
    - Test guest information error handling
    - Test email sending failure handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 15.5_

- [ ] 13. E2E Testing - Complete User Flows
  - [ ] 13.1 Write E2E test for complete booking creation flow
    - Test staff logs in to dashboard
    - Test staff opens Create Booking modal
    - Test staff enters all booking information
    - Test staff creates booking
    - Verify booking appears in dashboard
    - Verify confirmation email received
    - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.6, 9.7, 13.1, 15.1_
  
  - [ ] 13.2 Write E2E test for payment link flow
    - Test guest receives booking confirmation email
    - Test guest clicks payment link
    - Test guest completes payment
    - Verify payment confirmation email received
    - Verify booking status updated to PAID
    - _Requirements: 16.2, 16.4, 16.5, 16.6, 18.1, 18.8_
  
  - [ ] 13.3 Write E2E test for accessibility
    - Test keyboard navigation through modal
    - Test screen reader compatibility
    - Test focus management
    - Test error announcements
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 14. Final Checkpoint - All Tests Pass
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Ensure all E2E tests pass
  - Verify no console errors or warnings
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate workflows across multiple components
- E2E tests validate complete user flows through the UI
- All code should follow existing project patterns and conventions
- Database migrations should be versioned and reversible
- Email templates should be responsive and accessible
- Frontend components should be fully typed with TypeScript
- All API endpoints should have proper error handling and logging
