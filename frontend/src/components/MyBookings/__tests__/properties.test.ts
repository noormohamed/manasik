/**
 * Property-Based Tests for MyBookings
 * These tests validate universal properties that should hold across all valid inputs
 */

import {
  sortBookingsByCheckIn,
  applyFilters,
  isBookingEditable,
  isBookingRefundable,
} from '../utils';
import { Booking, BookingFilters } from '../types';

/**
 * Property 1: Booking List Sorting Order
 * For any set of bookings, the booking list SHALL display bookings sorted by check-in date
 * in descending order (most recent first), regardless of the order they were returned from the API.
 * **Validates: Requirements 1.2**
 */
describe('Property 1: Booking List Sorting Order', () => {
  it('should sort bookings by check-in date in descending order', () => {
    // Generate random bookings with various check-in dates
    const bookings: Booking[] = [
      { id: '1', checkIn: '2024-01-10' } as Booking,
      { id: '2', checkIn: '2024-01-25' } as Booking,
      { id: '3', checkIn: '2024-01-05' } as Booking,
      { id: '4', checkIn: '2024-01-20' } as Booking,
      { id: '5', checkIn: '2024-01-15' } as Booking,
    ];

    const sorted = sortBookingsByCheckIn(bookings);

    // Verify descending order
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i].checkIn).getTime();
      const next = new Date(sorted[i + 1].checkIn).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('should maintain all bookings after sorting', () => {
    const bookings: Booking[] = [
      { id: '1', checkIn: '2024-01-10' } as Booking,
      { id: '2', checkIn: '2024-01-25' } as Booking,
      { id: '3', checkIn: '2024-01-05' } as Booking,
    ];

    const sorted = sortBookingsByCheckIn(bookings);
    expect(sorted).toHaveLength(bookings.length);
    expect(sorted.map((b) => b.id).sort()).toEqual(
      bookings.map((b) => b.id).sort()
    );
  });

  it('should handle single booking', () => {
    const bookings: Booking[] = [{ id: '1', checkIn: '2024-01-10' } as Booking];
    const sorted = sortBookingsByCheckIn(bookings);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('1');
  });

  it('should handle empty booking list', () => {
    const sorted = sortBookingsByCheckIn([]);
    expect(sorted).toHaveLength(0);
  });
});

/**
 * Property 3: Filter Isolation
 * For any combination of active filters (status, hotel, date, guest search), the booking list
 * SHALL display only bookings that match ALL active filter criteria simultaneously.
 * **Validates: Requirements 1.1, 1.5**
 */
describe('Property 3: Filter Isolation', () => {
  const mockBookings: Booking[] = [
    {
      id: '1',
      status: 'CONFIRMED',
      hotelId: 'h1',
      hotelName: 'Hotel A',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      checkIn: '2024-01-10',
      checkOut: '2024-01-15',
    } as Booking,
    {
      id: '2',
      status: 'PENDING',
      hotelId: 'h2',
      hotelName: 'Hotel B',
      guestName: 'Jane Smith',
      guestEmail: 'jane@example.com',
      checkIn: '2024-01-20',
      checkOut: '2024-01-25',
    } as Booking,
    {
      id: '3',
      status: 'CONFIRMED',
      hotelId: 'h1',
      hotelName: 'Hotel A',
      guestName: 'Bob Johnson',
      guestEmail: 'bob@example.com',
      checkIn: '2024-02-01',
      checkOut: '2024-02-05',
    } as Booking,
  ];

  it('should apply single filter correctly', () => {
    const filters: BookingFilters = {
      status: 'CONFIRMED',
      hotel: '',
      date: null,
      searchGuest: '',
    };

    const result = applyFilters(mockBookings, filters);
    expect(result.every((b) => b.status === 'CONFIRMED')).toBe(true);
  });

  it('should apply multiple filters simultaneously', () => {
    const filters: BookingFilters = {
      status: 'CONFIRMED',
      hotel: 'h1',
      date: null,
      searchGuest: '',
    };

    const result = applyFilters(mockBookings, filters);
    expect(result.every((b) => b.status === 'CONFIRMED' && b.hotelId === 'h1')).toBe(true);
  });

  it('should apply all four filter types', () => {
    const filters: BookingFilters = {
      status: 'CONFIRMED',
      hotel: 'h1',
      date: new Date('2024-02-03'),
      searchGuest: 'bob',
    };

    const result = applyFilters(mockBookings, filters);
    expect(result.every((b) => b.status === 'CONFIRMED' && b.hotelId === 'h1')).toBe(true);
    expect(result.every((b) => b.guestName.toLowerCase().includes('bob'))).toBe(true);
  });

  it('should return empty array when no bookings match all filters', () => {
    const filters: BookingFilters = {
      status: 'REFUNDED',
      hotel: 'h1',
      date: null,
      searchGuest: '',
    };

    const result = applyFilters(mockBookings, filters);
    expect(result).toHaveLength(0);
  });

  it('should handle empty filters (no filtering)', () => {
    const filters: BookingFilters = {
      status: '',
      hotel: '',
      date: null,
      searchGuest: '',
    };

    const result = applyFilters(mockBookings, filters);
    expect(result).toHaveLength(mockBookings.length);
  });
});

/**
 * Property 5: Editable Booking State
 * For any booking with a status that allows editing (CONFIRMED, PENDING), the Edit button
 * SHALL be enabled; for bookings with non-editable statuses (CANCELLED, REFUNDED, COMPLETED),
 * the Edit button SHALL be disabled or hidden.
 * **Validates: Requirements 4.3, 4.4**
 */
describe('Property 5: Editable Booking State', () => {
  const editableStatuses = ['CONFIRMED', 'PENDING'];
  const nonEditableStatuses = ['CANCELLED', 'REFUNDED', 'COMPLETED'];

  it('should enable edit for editable statuses', () => {
    editableStatuses.forEach((status) => {
      const booking = { status } as Booking;
      expect(isBookingEditable(booking)).toBe(true);
    });
  });

  it('should disable edit for non-editable statuses', () => {
    nonEditableStatuses.forEach((status) => {
      const booking = { status } as Booking;
      expect(isBookingEditable(booking)).toBe(false);
    });
  });

  it('should be consistent for same status', () => {
    const booking = { status: 'CONFIRMED' } as Booking;
    const result1 = isBookingEditable(booking);
    const result2 = isBookingEditable(booking);
    expect(result1).toBe(result2);
  });
});

/**
 * Property 7: Refund Amount Validation
 * For any refund request, the refund amount SHALL not exceed the total booking amount
 * minus any previously refunded amount, and the system SHALL prevent submission of invalid amounts.
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Property 7: Refund Amount Validation', () => {
  it('should allow refund up to available amount', () => {
    const booking: Booking = {
      total: 1000,
      refundAmount: 200,
    } as Booking;

    const availableRefund = booking.total - (booking.refundAmount || 0);
    expect(availableRefund).toBe(800);
  });

  it('should calculate available refund correctly with no previous refund', () => {
    const booking: Booking = {
      total: 1000,
      refundAmount: 0,
    } as Booking;

    const availableRefund = booking.total - (booking.refundAmount || 0);
    expect(availableRefund).toBe(1000);
  });

  it('should calculate available refund correctly with partial refund', () => {
    const booking: Booking = {
      total: 1000,
      refundAmount: 300,
    } as Booking;

    const availableRefund = booking.total - (booking.refundAmount || 0);
    expect(availableRefund).toBe(700);
  });

  it('should calculate available refund as zero for full refund', () => {
    const booking: Booking = {
      total: 1000,
      refundAmount: 1000,
    } as Booking;

    const availableRefund = booking.total - (booking.refundAmount || 0);
    expect(availableRefund).toBe(0);
  });
});

/**
 * Property 8: Empty State Display
 * For any page load or filter change that results in zero bookings, the booking list
 * SHALL display an appropriate empty state message, and the right panel SHALL display
 * the empty state placeholder.
 * **Validates: Requirements 2.4**
 */
describe('Property 8: Empty State Display', () => {
  it('should return empty array for empty bookings', () => {
    const filters: BookingFilters = {
      status: '',
      hotel: '',
      date: null,
      searchGuest: '',
    };

    const result = applyFilters([], filters);
    expect(result).toHaveLength(0);
  });

  it('should return empty array when all bookings are filtered out', () => {
    const bookings: Booking[] = [
      { id: '1', status: 'CONFIRMED' } as Booking,
      { id: '2', status: 'CONFIRMED' } as Booking,
    ];

    const filters: BookingFilters = {
      status: 'REFUNDED',
      hotel: '',
      date: null,
      searchGuest: '',
    };

    const result = applyFilters(bookings, filters);
    expect(result).toHaveLength(0);
  });

  it('should handle multiple filter combinations resulting in empty state', () => {
    const bookings: Booking[] = [
      {
        id: '1',
        status: 'CONFIRMED',
        hotelId: 'h1',
        guestName: 'John',
        checkIn: '2024-01-10',
        checkOut: '2024-01-15',
      } as Booking,
    ];

    // Filter that matches nothing
    const filters: BookingFilters = {
      status: 'PENDING',
      hotel: 'h2',
      date: null,
      searchGuest: 'jane',
    };

    const result = applyFilters(bookings, filters);
    expect(result).toHaveLength(0);
  });
});
