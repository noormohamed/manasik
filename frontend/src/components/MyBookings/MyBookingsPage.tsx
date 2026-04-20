/**
 * MyBookingsPage Component
 * Main component that combines all sub-components and manages state
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Booking, BookingFilters } from './types';
import BookingListPanel from './BookingListPanel';
import BookingDetailPanel from './BookingDetailPanel';
import ResponsiveWrapper from './ResponsiveWrapper';
import styles from './MyBookingsPage.module.css';

const MyBookingsPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    hotel: '',
    date: null,
    searchGuest: '',
  });
  const [isRefundProcessing, setIsRefundProcessing] = useState(false);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = (await apiClient.get('/users/me/bookings', {
        params: { limit: 100 },
      })) as { bookings?: any[] };

      const fetchedBookings = (response.bookings || []).map((b: any) => ({
        id: b.id,
        status: b.status,
        currency: b.currency,
        subtotal: b.subtotal,
        tax: b.tax,
        total: b.total,
        refundAmount: b.refundAmount || null,
        refundReason: b.refundReason || null,
        refundedAt: b.refundedAt || null,
        paymentStatus: b.paymentStatus,
        bookingSource: b.bookingSource || 'DIRECT',
        hotelId: b.metadata?.hotelId || b.hotelId || '',
        hotelName: b.hotelName || b.metadata?.hotelName || 'Unknown Hotel',
        hotelAddress: b.hotelAddress || b.metadata?.hotelAddress || '',
        hotelCity: b.hotelCity || b.metadata?.hotelCity || '',
        hotelCountry: b.hotelCountry || b.metadata?.hotelCountry || '',
        hotelFullAddress: b.hotelFullAddress || b.metadata?.hotelFullAddress || '',
        hotelImage: b.hotelImage || b.metadata?.hotelImage || null,
        hotelPhone: b.hotelPhone || b.metadata?.hotelPhone || '',
        starRating: b.starRating,
        closestGate: b.closestGate || null,
        kaabaGate: b.kaabaGate || null,
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || '',
        roomName: b.roomType || b.metadata?.roomType || 'Room',
        checkIn: b.checkInDate || b.metadata?.checkInDate || '',
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || '',
        checkInTime: b.checkInTime || '14:00',
        checkOutTime: b.checkOutTime || '11:00',
        nights: b.nights || b.metadata?.nights || 1,
        guestName: b.metadata?.guestName || '',
        guestEmail: b.metadata?.guestEmail || '',
        guestPhone: b.metadata?.guestPhone || '',
        guestCount: b.guests || b.metadata?.guests || 1,
        guests: b.guestDetails || [],
        customerId: b.customerId,
        agentId: b.agentId,
        agentName: b.agentName,
        agentEmail: b.agentEmail,
        providerName: b.providerName,
        providerReference: b.providerReference,
        providerPhone: b.providerPhone,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      setBookings(fetchedBookings);
      // Clear selection if no bookings
      if (fetchedBookings.length === 0) {
        setSelectedBookingId(null);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bookings on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchBookings]);

  // Handle filter changes
  const handleFilterChange = (filterKey: keyof BookingFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Handle booking selection
  const handleSelectBooking = (booking: Booking) => {
    setSelectedBookingId(booking.id);
  };

  // Handle edit
  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit booking:', selectedBookingId);
  };

  // Handle cancel
  const handleCancel = () => {
    // TODO: Implement cancel functionality
    console.log('Cancel booking:', selectedBookingId);
  };

  // Handle print - open confirmation page in new window
  const handlePrint = (booking: Booking) => {
    window.open(`/bookings/${booking.id}/confirmation`, '_blank');
  };

  // Handle message - navigate to messages page with conversation context
  const handleMessage = (booking: Booking, conversationId?: string) => {
    if (conversationId) {
      // If conversation exists, navigate directly to it
      window.location.href = `/dashboard/messages?conversationId=${conversationId}`;
    } else {
      // This shouldn't happen as modal handles first message, but fallback just in case
      window.location.href = `/dashboard/messages?bookingId=${booking.id}&hotelId=${booking.hotelId}`;
    }
  };

  // Handle booking update (e.g., after adding conversation ID)
  const handleUpdateBooking = (updatedBooking: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  // Handle refund
  const handleRefund = async (booking: Booking, amount: number, reason: string) => {
    setIsRefundProcessing(true);
    try {
      await apiClient.post(`/hotels/bookings/${booking.id}/refund`, {
        amount,
        reason,
      });

      // Refresh bookings to show updated refund status
      await fetchBookings();
      alert('Refund processed successfully!');
    } catch (err: any) {
      console.error('Refund error:', err);
      alert(err.error || 'Failed to process refund');
      throw err;
    } finally {
      setIsRefundProcessing(false);
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <i className="ri-lock-line"></i>
          <h2>Sign in to view your bookings</h2>
          <p>You need to be logged in to see your booking history.</p>
          <a href="/auth" className={styles.loginButton}>
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>View and manage all your hotel reservations</p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.contentInner}>
          <div className={styles.content}>
            <ResponsiveWrapper
              leftPanel={
                <BookingListPanel
                  bookings={bookings}
                  selectedBookingId={selectedBookingId}
                  onSelectBooking={handleSelectBooking}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  loading={loading}
                  error={error}
                />
              }
              rightPanel={
                <BookingDetailPanel
                  booking={selectedBooking}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onPrint={handlePrint}
                  onRefund={handleRefund}
                  onMessage={handleMessage}
                  onUpdateBooking={handleUpdateBooking}
                  isRefundProcessing={isRefundProcessing}
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
