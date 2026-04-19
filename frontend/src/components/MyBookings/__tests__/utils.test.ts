/**
 * Unit tests for MyBookings utility functions
 */

import {
  formatDate,
  formatTime,
  formatCurrency,
  isBookingEditable,
  isBookingRefundable,
  isBookingCancellable,
  sortBookingsByCheckIn,
  applyFilters,
  getUniqueHotels,
} from '../utils';
import { Booking, BookingFilters } from '../types';

describe('MyBookings Utils', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should return N/A for empty string', () => {
      expect(formatDate('')).toBe('N/A');
    });
  });

  describe('formatTime', () => {
    it('should format 24-hour time to 12-hour format', () => {
      expect(formatTime('14:00')).toBe('2:00 PM');
      expect(formatTime('09:30')).toBe('9:30 AM');
      expect(formatTime('00:00')).toBe('12:00 AM');
      expect(formatTime('12:00')).toBe('12:00 PM');
    });

    it('should return empty string for empty input', () => {
      expect(formatTime('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1,234.56');
    });

    it('should handle different currencies', () => {
      const result = formatCurrency(1000, 'EUR');
      expect(result).toContain('1,000');
    });
  });

  describe('isBookingEditable', () => {
    it('should return true for CONFIRMED status', () => {
      const booking = { status: 'CONFIRMED' } as Booking;
      expect(isBookingEditable(booking)).toBe(true);
    });

    it('should return true for PENDING status', () => {
      const booking = { status: 'PENDING' } as Booking;
      expect(isBookingEditable(booking)).toBe(true);
    });

    it('should return false for CANCELLED status', () => {
      const booking = { status: 'CANCELLED' } as Booking;
      expect(isBookingEditable(booking)).toBe(false);
    });

    it('should return false for REFUNDED status', () => {
      const booking = { status: 'REFUNDED' } as Booking;
      expect(isBookingEditable(booking)).toBe(false);
    });
  });

  describe('isBookingRefundable', () => {
    it('should return true for refundable statuses', () => {
      expect(isBookingRefundable({ status: 'CONFIRMED' } as Booking)).toBe(true);
      expect(isBookingRefundable({ status: 'PENDING' } as Booking)).toBe(true);
      expect(isBookingRefundable({ status: 'COMPLETED' } as Booking)).toBe(true);
    });

    it('should return false for non-refundable statuses', () => {
      expect(isBookingRefundable({ status: 'CANCELLED' } as Booking)).toBe(false);
      expect(isBookingRefundable({ status: 'REFUNDED' } as Booking)).toBe(false);
    });
  });

  describe('isBookingCancellable', () => {
    it('should return true for cancellable statuses', () => {
      expect(isBookingCancellable({ status: 'CONFIRMED' } as Booking)).toBe(true);
      expect(isBookingCancellable({ status: 'PENDING' } as Booking)).toBe(true);
    });

    it('should return false for non-cancellable statuses', () => {
      expect(isBookingCancellable({ status: 'CANCELLED' } as Booking)).toBe(false);
      expect(isBookingCancellable({ status: 'COMPLETED' } as Booking)).toBe(false);
    });
  });

  describe('sortBookingsByCheckIn', () => {
    it('should sort bookings by check-in date descending', () => {
      const bookings: Booking[] = [
        { id: '1', checkIn: '2024-01-10' } as Booking,
        { id: '2', checkIn: '2024-01-20' } as Booking,
        { id: '3', checkIn: '2024-01-15' } as Booking,
      ];

      const sorted = sortBookingsByCheckIn(bookings);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should not mutate original array', () => {
      const bookings: Booking[] = [
        { id: '1', checkIn: '2024-01-10' } as Booking,
        { id: '2', checkIn: '2024-01-20' } as Booking,
      ];

      const original = [...bookings];
      sortBookingsByCheckIn(bookings);
      expect(bookings).toEqual(original);
    });
  });

  describe('applyFilters', () => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        status: 'CONFIRMED',
        hotelId: 'hotel1',
        hotelName: 'Hotel A',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        checkIn: '2024-01-10',
        checkOut: '2024-01-15',
      } as Booking,
      {
        id: '2',
        status: 'PENDING',
        hotelId: 'hotel2',
        hotelName: 'Hotel B',
        guestName: 'Jane Smith',
        guestEmail: 'jane@example.com',
        checkIn: '2024-01-20',
        checkOut: '2024-01-25',
      } as Booking,
    ];

    it('should filter by status', () => {
      const filters: BookingFilters = {
        status: 'CONFIRMED',
        hotel: '',
        date: null,
        searchGuest: '',
      };

      const result = applyFilters(mockBookings, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by hotel', () => {
      const filters: BookingFilters = {
        status: '',
        hotel: 'hotel2',
        date: null,
        searchGuest: '',
      };

      const result = applyFilters(mockBookings, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by guest name', () => {
      const filters: BookingFilters = {
        status: '',
        hotel: '',
        date: null,
        searchGuest: 'john',
      };

      const result = applyFilters(mockBookings, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should apply multiple filters', () => {
      const filters: BookingFilters = {
        status: 'CONFIRMED',
        hotel: 'hotel1',
        date: null,
        searchGuest: '',
      };

      const result = applyFilters(mockBookings, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array when no matches', () => {
      const filters: BookingFilters = {
        status: 'REFUNDED',
        hotel: '',
        date: null,
        searchGuest: '',
      };

      const result = applyFilters(mockBookings, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUniqueHotels', () => {
    it('should extract unique hotels from bookings', () => {
      const bookings: Booking[] = [
        { id: '1', hotelId: 'h1', hotelName: 'Hotel A' } as Booking,
        { id: '2', hotelId: 'h2', hotelName: 'Hotel B' } as Booking,
        { id: '3', hotelId: 'h1', hotelName: 'Hotel A' } as Booking,
      ];

      const hotels = getUniqueHotels(bookings);
      expect(hotels).toHaveLength(2);
      expect(hotels[0].id).toBe('h1');
      expect(hotels[1].id).toBe('h2');
    });

    it('should handle empty bookings', () => {
      const hotels = getUniqueHotels([]);
      expect(hotels).toHaveLength(0);
    });
  });
});
