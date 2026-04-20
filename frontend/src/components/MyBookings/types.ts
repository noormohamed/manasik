/**
 * Type definitions for MyBookings components
 */

export interface HaramGate {
  name: string;
  gateNumber: number;
  distance: number; // in kilometers
  walkingTime: number; // in minutes
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  isLeadPassenger: boolean;
}

export interface Booking {
  id: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  paymentStatus?: string;
  bookingSource?: string;

  // Hotel Information
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelCity?: string;
  hotelCountry?: string;
  hotelFullAddress?: string;
  hotelImage?: string;
  hotelPhone?: string;
  starRating?: number;

  // Room Information
  roomTypeId: string;
  roomName: string;

  // Dates and Times
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  checkInTime?: string; // HH:mm format
  checkOutTime?: string; // HH:mm format
  nights: number;

  // Guest Information
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCount: number;
  guests?: Guest[];

  // Gate Information
  closestGate?: HaramGate;
  kaabaGate?: HaramGate;

  // Provider Information
  providerName?: string;
  providerReference?: string;
  providerPhone?: string;

  // Messaging
  conversationId?: string; // Reference to the conversation for this booking

  // Metadata
  customerId?: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilters {
  status: string; // empty string = all
  hotel: string; // empty string = all
  date: Date | null; // null = all
  searchGuest: string; // empty string = all
}

export interface BookingListPanelProps {
  bookings: Booking[];
  selectedBookingId: string | null;
  onSelectBooking: (booking: Booking) => void;
  filters: BookingFilters;
  onFilterChange: (filterKey: keyof BookingFilters, value: any) => void;
  loading: boolean;
  error: string | null;
}

export interface BookingDetailPanelProps {
  booking: Booking | null;
  onEdit: () => void;
  onRefund: () => void;
  onCancel: () => void;
  onPrint: () => void;
  isEditable: boolean;
}
