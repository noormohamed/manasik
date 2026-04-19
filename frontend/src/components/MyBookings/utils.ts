/**
 * Utility functions for MyBookings components
 */

import { Booking, BookingFilters } from './types';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a time string to 12-hour format
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

/**
 * Determine the display status based on booking state
 * Shows user-friendly status like "Pending Arrival" instead of raw booking status
 */
export const getDisplayStatus = (booking: Booking): string => {
  const now = new Date();
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);

  // If booking is cancelled, show cancelled
  if (booking.status === 'CANCELLED') {
    return 'Cancelled';
  }

  // If check-out has passed, show completed
  if (now >= checkOutDate) {
    return 'Completed';
  }

  // If check-in hasn't occurred yet, show pending arrival
  if (now < checkInDate) {
    return 'Pending Arrival';
  }

  // If currently checked in (between check-in and check-out), show active
  if (now >= checkInDate && now < checkOutDate) {
    return 'Active';
  }

  // Default fallback
  return 'Pending Arrival';
};

/**
 * Get status badge styling based on display status
 */
export const getStatusBadgeClass = (booking: Booking | string): string => {
  // Handle both old string-based calls and new booking-based calls
  const status = typeof booking === 'string' ? booking : getDisplayStatus(booking);

  switch (status) {
    case 'Pending Arrival':
      return 'bg-success';
    case 'Active':
      return 'bg-success';
    case 'Completed':
      return 'bg-info';
    case 'Cancelled':
      return 'bg-danger';
    case 'Pending Payment':
      return 'bg-warning text-dark';
    // Legacy status support
    case 'CONFIRMED':
      return 'bg-success';
    case 'PENDING':
      return 'bg-warning text-dark';
    case 'CANCELLED':
      return 'bg-danger';
    case 'COMPLETED':
      return 'bg-info';
    case 'REFUNDED':
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

/**
 * Get status icon class based on display status
 */
export const getStatusIcon = (booking: Booking | string): string => {
  // Handle both old string-based calls and new booking-based calls
  const status = typeof booking === 'string' ? booking : getDisplayStatus(booking);

  switch (status) {
    case 'Pending Arrival':
      return 'ri-time-line';
    case 'Active':
      return 'ri-check-circle-line';
    case 'Completed':
      return 'ri-checkbox-circle-line';
    case 'Cancelled':
      return 'ri-close-line';
    case 'Pending Payment':
      return 'ri-time-line';
    // Legacy status support
    case 'CONFIRMED':
      return 'ri-check-line';
    case 'PENDING':
      return 'ri-time-line';
    case 'CANCELLED':
      return 'ri-close-line';
    case 'COMPLETED':
      return 'ri-checkbox-circle-line';
    case 'REFUNDED':
      return 'ri-refund-line';
    default:
      return 'ri-question-line';
  }
};

/**
 * Check if a booking is editable
 */
export const isBookingEditable = (booking: Booking): boolean => {
  return booking.status === 'CONFIRMED' || booking.status === 'PENDING';
};

/**
 * Check if a booking is refundable
 */
export const isBookingRefundable = (booking: Booking): boolean => {
  return booking.status === 'CONFIRMED' || booking.status === 'PENDING' || booking.status === 'COMPLETED';
};

/**
 * Check if a booking is cancellable
 */
export const isBookingCancellable = (booking: Booking): boolean => {
  return booking.status === 'CONFIRMED' || booking.status === 'PENDING';
};

/**
 * Sort bookings by check-in date (most recent first)
 */
export const sortBookingsByCheckIn = (bookings: Booking[]): Booking[] => {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.checkIn).getTime();
    const dateB = new Date(b.checkIn).getTime();
    return dateB - dateA; // Most recent first
  });
};

/**
 * Apply filters to bookings
 */
export const applyFilters = (bookings: Booking[], filters: BookingFilters): Booking[] => {
  let filtered = [...bookings];

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter((b) => b.status === filters.status);
  }

  // Filter by hotel
  if (filters.hotel) {
    filtered = filtered.filter((b) => b.hotelId === filters.hotel);
  }

  // Filter by date
  if (filters.date) {
    const filterDateStr = filters.date.toISOString().split('T')[0];
    filtered = filtered.filter((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const selectedDate = new Date(filterDateStr);
      return selectedDate >= checkIn && selectedDate < checkOut;
    });
  }

  // Filter by guest name or email
  if (filters.searchGuest) {
    const searchLower = filters.searchGuest.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.guestName.toLowerCase().includes(searchLower) ||
        b.guestEmail.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

/**
 * Get unique hotels from bookings
 */
export const getUniqueHotels = (bookings: Booking[]): Array<{ id: string; name: string }> => {
  const hotelMap = new Map<string, { id: string; name: string }>();
  bookings.forEach((booking) => {
    if (booking.hotelId && !hotelMap.has(booking.hotelId)) {
      hotelMap.set(booking.hotelId, {
        id: booking.hotelId,
        name: booking.hotelName || 'Unknown Hotel',
      });
    }
  });
  return Array.from(hotelMap.values());
};

/**
 * Get full hotel address
 */
export const getFullHotelAddress = (booking: Booking): string => {
  return (
    booking.hotelFullAddress ||
    [booking.hotelAddress, booking.hotelCity, booking.hotelCountry]
      .filter(Boolean)
      .join(', ') ||
    'Address not available'
  );
};
