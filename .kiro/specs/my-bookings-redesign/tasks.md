# Implementation Plan: My Bookings Redesign

## Overview

This implementation plan breaks down the My Bookings redesign into discrete, implementable tasks. The redesign introduces a modern two-column layout with a scrollable booking list on the left and comprehensive booking details on the right, with responsive adaptation for tablet and mobile devices. All tasks are written for TypeScript/React using Next.js and follow the existing project patterns.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - Create directory structure for new components: `frontend/src/components/MyBookings/`
  - Define TypeScript interfaces for Booking, Guest, HaramGate, and BookingFilters
  - Set up testing framework configuration for component tests
  - _Requirements: 1.1, 2.1, 2.2_

- [ ] 2. Implement BookingListPanel component
  - [ ] 2.1 Create BookingListPanel component with filter controls
    - Implement filter bar with status, hotel, date, and search inputs
    - Create filter state management and change handlers
    - Implement clear all filters functionality
    - _Requirements: 1.1, 1.5, 6.1_
  
  - [ ]* 2.2 Write property test for booking list sorting
    - **Property 1: Booking List Sorting Order**
    - **Validates: Requirements 1.2**
  
  - [ ] 2.3 Implement BookingCard component with selection state
    - Create individual booking card with hotel name, room type, dates, and status badge
    - Implement visual selection state (highlighted border, background color)
    - Add click handler for booking selection
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ]* 2.4 Write property test for selection state persistence
    - **Property 2: Selection State Persistence**
    - **Validates: Requirements 1.3_
  
  - [ ] 2.5 Implement booking list sorting and filtering logic
    - Sort bookings by check-in date descending (most recent first)
    - Apply status filter
    - Apply hotel filter
    - Apply date range filter
    - Apply guest name/email search filter
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 2.6 Write property test for filter isolation
    - **Property 3: Filter Isolation**
    - **Validates: Requirements 1.1, 1.5**

- [ ] 3. Implement BookingDetailPanel component structure
  - [ ] 3.1 Create BookingDetailPanel component with section layout
    - Set up component structure with all sections (accommodation, guest, stay details, gate, payment, actions)
    - Implement empty state display when no booking selected
    - Create responsive grid layout for sections
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [ ]* 3.2 Write property test for empty state display
    - **Property 8: Empty State Display**
    - **Validates: Requirements 2.4**

- [ ] 4. Implement accommodation and guest information sections
  - [ ] 4.1 Create AccommodationSection component
    - Display hotel name, star rating, room type, full address
    - Show check-in/check-out times
    - Display provider information if available
    - Apply teal background styling (#e8f4fd)
    - _Requirements: 2.2, 2.3_
  
  - [ ] 4.2 Create GuestInformationSection component
    - Display lead passenger highlighted with blue left border
    - Display all guests with name, email, phone, nationality, passport, DOB
    - Show guest count summary
    - Apply grid layout (2 columns desktop, 1 mobile)
    - _Requirements: 2.2, 2.3_

- [ ] 5. Implement stay details and gate information sections
  - [ ] 5.1 Create StayDetailsSection component
    - Display check-in date and time
    - Display check-out date and time
    - Display duration (number of nights)
    - Display booking creation date
    - Apply grid layout with info boxes
    - _Requirements: 2.2, 2.3_
  
  - [ ] 5.2 Create GateInformationSection component
    - Display closest gate box with teal background (#e0f7fa, border #00bcd4)
    - Display Kaaba gate box with purple background (#f3e5f5, border #9c27b0)
    - Show gate name, number, distance, walking time for each
    - Handle missing gate information with "Not available" placeholder
    - _Requirements: 3.2, 3.3, 3.5_
  
  - [ ]* 5.3 Write property test for gate information display
    - **Property 4: Gate Information Display**
    - **Validates: Requirements 3.2, 3.3, 3.5**

- [ ] 6. Implement payment summary and action buttons
  - [ ] 6.1 Create PaymentSummarySection component
    - Display subtotal, tax, and total with proper formatting
    - Display refund information if applicable (amount, reason, date)
    - Apply light blue background styling (#e7f1ff)
    - _Requirements: 2.2, 2.3_
  
  - [ ] 6.2 Create ActionButtons component
    - Implement Edit button (enabled for CONFIRMED/PENDING, disabled for others)
    - Implement Refund button (enabled for refundable bookings)
    - Implement Cancel button (enabled for cancellable bookings)
    - Implement Print button (always enabled)
    - Stack vertically on mobile, horizontally on desktop
    - _Requirements: 4.3, 4.4, 6.1_
  
  - [ ]* 6.3 Write property test for editable booking state
    - **Property 5: Editable Booking State**
    - **Validates: Requirements 4.3, 4.4**

- [ ] 7. Implement RefundModal component
  - [ ] 7.1 Create RefundModal component with form
    - Pre-fill refund amount with available amount
    - Create text area for refund reason
    - Implement form validation (amount positive, not exceeding available, reason required)
    - Show inline error messages for validation failures
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 7.2 Write property test for refund amount validation
    - **Property 7: Refund Amount Validation**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ] 7.3 Implement refund submission logic
    - Call `/hotels/bookings/{id}/refund` API endpoint
    - Handle success response and update booking state
    - Handle error response with user-friendly message
    - Close modal and refresh booking list on success
    - _Requirements: 4.1, 4.2_

- [ ] 8. Implement responsive layout wrapper
  - [ ] 8.1 Create ResponsiveWrapper component
    - Detect viewport width and apply appropriate layout
    - Desktop (≥1024px): Two-column side-by-side (35% left, 65% right)
    - Tablet (768px-1023px): Adjusted two-column (40% left, 60% right)
    - Mobile (<768px): Stacked vertical layout
    - Implement smooth reflow on viewport resize
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 8.2 Write property test for responsive layout adaptation
    - **Property 6: Responsive Layout Adaptation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 9. Integrate with existing API and state management
  - [ ] 9.1 Create custom hook for booking data fetching
    - Fetch bookings from `/users/me/bookings` endpoint
    - Handle loading and error states
    - Implement refetch functionality
    - _Requirements: 1.1, 2.1_
  
  - [ ] 9.2 Create custom hook for filter state management
    - Manage filter state (status, hotel, date, search)
    - Persist filters to localStorage for session continuity
    - Implement filter application logic
    - _Requirements: 1.1, 1.5_
  
  - [ ] 9.3 Integrate BookingListPanel with API data
    - Connect to booking fetch hook
    - Apply filters to fetched bookings
    - Handle loading and error states in UI
    - _Requirements: 1.1, 1.5_
  
  - [ ] 9.4 Integrate BookingDetailPanel with selected booking
    - Display selected booking data in all sections
    - Update detail panel when selection changes
    - Handle null/undefined booking gracefully
    - _Requirements: 2.1, 2.2_

- [ ] 10. Implement print functionality
  - [ ] 10.1 Create print template for booking confirmation
    - Generate HTML with all booking information
    - Apply print-friendly styling
    - Include accommodation, guest, stay details, gate, and payment sections
    - _Requirements: 6.1_
  
  - [ ] 10.2 Implement print button handler
    - Open print dialog with formatted booking confirmation
    - Handle print cancellation gracefully
    - _Requirements: 6.1_

- [ ] 11. Implement accessibility features
  - [ ] 11.1 Add keyboard navigation support
    - Support Tab key for navigating between bookings
    - Support Enter key for selecting booking
    - Support Escape key for closing modals
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 11.2 Add ARIA labels and semantic HTML
    - Add ARIA labels to all interactive elements
    - Use semantic HTML (button, section, article tags)
    - Add role attributes where needed
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 11.3 Ensure color contrast compliance
    - Verify all text meets WCAG AA standards
    - Test with color contrast checker
    - Adjust colors if needed
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 12. Implement performance optimizations
  - [ ] 12.1 Add virtual scrolling for large booking lists
    - Implement virtualization for 100+ bookings
    - Render only visible cards in viewport
    - Improve scroll performance
    - _Requirements: 1.1_
  
  - [ ] 12.2 Add memoization and debouncing
    - Memoize filter functions to prevent unnecessary re-renders
    - Debounce search input to reduce API calls
    - Memoize component renders where appropriate
    - _Requirements: 1.1, 1.5_

- [x] 13. Write unit tests for components
  - [ ]* 13.1 Write unit tests for BookingListPanel
    - Test rendering of booking cards
    - Test filter application
    - Test sorting by check-in date
    - Test empty state display
    - Test loading and error states
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 13.2 Write unit tests for BookingDetailPanel
    - Test display of all sections with correct data
    - Test empty state when no booking selected
    - Test Edit button enabled/disabled based on status
    - Test date and time formatting
    - Test gate information display with missing data
    - _Requirements: 2.1, 2.2, 3.2, 4.3_
  
  - [ ]* 13.3 Write unit tests for RefundModal
    - Test pre-filling refund amount
    - Test validation of refund amount
    - Test validation of refund reason
    - Test prevention of invalid submissions
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 13.4 Write unit tests for filter logic
    - Test single filter application
    - Test multiple filters simultaneously
    - Test filter clearing
    - Test edge cases (empty strings, null values)
    - _Requirements: 1.1, 1.5_

- [x] 14. Write integration tests
  - [ ]* 14.1 Write integration test for booking selection flow
    - Test selecting booking from list
    - Test booking details appear in right panel
    - Test selecting different booking updates panel
    - Test clearing selection shows empty state
    - _Requirements: 1.1, 1.3, 2.1_
  
  - [ ]* 14.2 Write integration test for refund flow
    - Test opening refund modal
    - Test entering refund amount and reason
    - Test submitting refund
    - Test booking list updates with refund status
    - Test right panel shows refund information
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 14.3 Write integration test for filter application
    - Test applying filters
    - Test booking list updates immediately
    - Test filters persist during session
    - Test clear filters button resets all
    - _Requirements: 1.1, 1.5_
  
  - [ ]* 14.4 Write integration test for responsive behavior
    - Test desktop view two-column layout
    - Test tablet view adjusted layout
    - Test mobile view stacked layout
    - Test viewport resize reflows smoothly
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all integration tests and verify they pass
  - Run all property-based tests and verify they pass
  - Fix any failing tests before proceeding
  - Ensure code coverage meets project standards

- [ ] 16. Create MyBookingsPage component
  - [ ] 16.1 Create main MyBookingsPage component
    - Combine BookingListPanel and BookingDetailPanel
    - Implement ResponsiveWrapper for layout
    - Manage selected booking state
    - Handle booking fetch and filter state
    - _Requirements: 1.1, 2.1, 5.1_
  
  - [ ] 16.2 Integrate with existing Dashboard
    - Replace or update existing bookings view
    - Maintain navigation and routing
    - Ensure consistent styling with rest of app
    - _Requirements: 1.1, 2.1_

- [ ] 17. Style components with CSS modules
  - [ ] 17.1 Create CSS modules for all components
    - BookingListPanel.module.css
    - BookingCard.module.css
    - BookingDetailPanel.module.css
    - AccommodationSection.module.css
    - GuestInformationSection.module.css
    - StayDetailsSection.module.css
    - GateInformationSection.module.css
    - PaymentSummarySection.module.css
    - ActionButtons.module.css
    - RefundModal.module.css
    - ResponsiveWrapper.module.css
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 17.2 Implement responsive breakpoints
    - Desktop styles (≥1024px)
    - Tablet styles (768px-1023px)
    - Mobile styles (<768px)
    - Test at each breakpoint
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 17.3 Apply color scheme and spacing
    - Apply color scheme from design (teal, purple, blue)
    - Implement consistent spacing and padding
    - Apply typography hierarchy
    - _Requirements: 2.2, 3.2, 3.3_

- [ ] 18. Implement error handling
  - [ ] 18.1 Handle API errors gracefully
    - Display error message for booking fetch failure
    - Show retry button for failed requests
    - Log errors to console for debugging
    - _Requirements: 1.1_
  
  - [ ] 18.2 Handle refund processing errors
    - Display error modal with specific error message
    - Preserve form data for retry
    - Log error details
    - _Requirements: 4.1, 4.2_
  
  - [ ] 18.3 Handle missing data gracefully
    - Display "Not available" for missing gate information
    - Handle missing guest details
    - Handle missing hotel information
    - _Requirements: 3.2, 3.3_

- [x] 19. Final checkpoint - Ensure all tests pass
  - Run complete test suite (unit, integration, property-based)
  - Verify all tests pass
  - Check code coverage
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [x] 20. Manual testing and refinement
  - [ ]* 20.1 Test on desktop browser
    - Test two-column layout displays correctly
    - Test all interactions work as expected
    - Test print functionality
    - Test refund flow
    - _Requirements: 1.1, 2.1, 5.1_
  
  - [ ]* 20.2 Test on tablet device
    - Test adjusted two-column layout
    - Test all interactions work as expected
    - Test touch interactions
    - _Requirements: 5.2_
  
  - [ ]* 20.3 Test on mobile device
    - Test stacked vertical layout
    - Test all interactions work as expected
    - Test touch interactions
    - Test scrolling performance
    - _Requirements: 5.3_
  
  - [ ]* 20.4 Test with screen reader
    - Test keyboard navigation
    - Test ARIA labels are read correctly
    - Test focus management
    - _Requirements: 5.1, 5.2, 5.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Integration tests validate complete user workflows
- All components follow existing project patterns and conventions
- TypeScript interfaces are defined in a shared types file for consistency
- CSS modules are used for component styling to avoid global namespace pollution
- API integration uses existing `apiClient` from `frontend/src/lib/api.ts`
- State management uses React hooks and Context API following existing patterns
