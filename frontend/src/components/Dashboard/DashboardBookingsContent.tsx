"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CreateBookingModal from "./CreateBookingModal";
import crypto from 'crypto';

interface Booking {
  id: string;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  paymentStatus?: string;
  bookingSource?: string;
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelCity?: string;
  hotelCountry?: string;
  hotelFullAddress?: string;
  hotelImage?: string;
  hotelPhone?: string;
  providerName?: string;
  providerReference?: string;
  providerPhone?: string;
  checkInTime?: string;
  checkOutTime?: string;
  starRating?: number;
  closestGate?: {
    name: string;
    gateNumber: number;
    distance: number;
    walkingTime: number;
  };
  kaabaGate?: {
    name: string;
    gateNumber: number;
    distance: number;
    walkingTime: number;
  };
  roomTypeId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCount: number;
  guests?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nationality?: string;
    passportNumber?: string;
    dateOfBirth?: string;
    isLeadPassenger: boolean;
  }>;
  customerId?: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  brokerFee?: number;
  brokerNotes?: string;
  visibleDates?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Hotel {
  id: string;
  name: string;
}

const DashboardBookingsContent: React.FC = () => {
  const { user } = useAuth();
  const currentRoute = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterHotel, setFilterHotel] = useState<string>('');
  const [searchGuest, setSearchGuest] = useState<string>('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activePageNum, setActivePageNum] = useState(1);
  const [completedPageNum, setCompletedPageNum] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  // Fetch hotels and bookings on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Fetch bookings when filters change or user changes
  useEffect(() => {
    fetchBookings();
  }, [user, filterStatus, filterHotel, searchGuest]);

  // Fetch user's managed hotels
  const fetchHotels = async () => {
    try {
      const response = (await apiClient.get('/hotels/listings')) as { hotels?: any[] };
      const hotelsList = response.hotels || [];
      
      // Filter for active hotels only
      const activeHotels = hotelsList
        .filter((h: any) => h.status === 'ACTIVE')
        .map((h: any) => ({
          id: h.id,
          name: h.name,
        }));
      
      setAllHotels(activeHotels);
    } catch (err: any) {
      console.error('Error fetching user hotels:', err);
      setAllHotels([]);
    }
  };

  // Extract unique hotels from bookings for the filter dropdown
  const getUniqueHotels = (): Hotel[] => {
    const hotelMap = new Map<string, Hotel>();
    bookings.forEach(booking => {
      if (booking.hotelId && !hotelMap.has(booking.hotelId)) {
        hotelMap.set(booking.hotelId, {
          id: booking.hotelId,
          name: booking.hotelName || 'Unknown Hotel',
        });
      }
    });
    return Array.from(hotelMap.values());
  };

  const hotels = getUniqueHotels();

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { limit: 100 };
      if (filterStatus) {
        params.status = filterStatus;
      }

      // Determine which endpoint to use based on current route
      // /dashboard/listings/bookings = hotel manager view (use /hotels/bookings)
      // /dashboard/bookings = customer view (use /users/me/bookings)
      let endpoint = '/users/me/bookings';
      
      // Check if we're on the hotel listings bookings page
      if (currentRoute && currentRoute.includes('/dashboard/listings/bookings')) {
        endpoint = '/hotels/bookings';
      }

      console.log('[Bookings] Route:', currentRoute, 'Using endpoint:', endpoint, 'Params:', params);

      const response = (await apiClient.get(endpoint, { params })) as { bookings?: Booking[] };
      let fetchedBookings = response.bookings || [];
      
      console.log('[Bookings] API Response:', { bookingCount: fetchedBookings.length, endpoint, firstBooking: fetchedBookings[0] });
      
      // Map the response to match our Booking interface
      fetchedBookings = fetchedBookings.map((b: any) => ({
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
        hotelId: b.hotelId || b.metadata?.hotelId || '',
        hotelName: b.hotelName || b.metadata?.hotelName || 'Unknown Hotel',
        hotelAddress: b.hotelAddress || b.metadata?.hotelAddress || '',
        hotelCity: b.hotelCity || b.metadata?.hotelCity || '',
        hotelCountry: b.hotelCountry || b.metadata?.hotelCountry || '',
        hotelFullAddress: b.hotelFullAddress || b.metadata?.hotelFullAddress || '',
        checkInTime: b.checkInTime || '14:00',
        checkOutTime: b.checkOutTime || '11:00',
        starRating: b.starRating,
        closestGate: b.closestGate || null,
        kaabaGate: b.kaabaGate || null,
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || '',
        roomName: b.roomName || b.roomType || b.metadata?.roomType || 'Room',
        checkIn: b.checkIn || b.checkInDate || b.metadata?.checkInDate || '',
        checkOut: b.checkOut || b.checkOutDate || b.metadata?.checkOutDate || '',
        nights: b.nights || b.metadata?.nights || 1,
        guestName: b.guestName || b.metadata?.guestName || '',
        guestEmail: b.guestEmail || b.metadata?.guestEmail || '',
        guestPhone: b.guestPhone || b.metadata?.guestPhone || '',
        guestCount: b.guestCount || b.metadata?.guests || 1,
        guests: Array.isArray(b.guests) ? b.guests : [],
        customerId: b.customerId,
        agentId: b.agentId,
        agentName: b.agentName,
        agentEmail: b.agentEmail,
        brokerFee: b.brokerFee || 0,
        brokerNotes: b.brokerNotes || null,
        visibleDates: b.visibleDates || [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));
      
      // Filter by status on client side if needed
      if (filterStatus) {
        fetchedBookings = fetchedBookings.filter((b: Booking) => b.status === filterStatus);
      }
      
      // Filter by hotel on client side
      if (filterHotel) {
        fetchedBookings = fetchedBookings.filter((b: Booking) => b.hotelId === filterHotel);
      }
      
      // Filter by guest name or email on client side
      if (searchGuest) {
        const searchLower = searchGuest.toLowerCase();
        fetchedBookings = fetchedBookings.filter((b: Booking) => 
          b.guestName.toLowerCase().includes(searchLower) || 
          b.guestEmail.toLowerCase().includes(searchLower)
        );
      }
      
      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setFilterStatus('');
    setFilterHotel('');
    setSearchGuest('');
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting Payment';
      case 'CONFIRMED':
        return 'Confirmed';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success';
      case 'CONFIRMED':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getNetPaid = (booking: Booking) => {
    return booking.total - (booking.refundAmount || 0);
  };

  const getMD5Reference = (bookingId: string) => {
    return crypto.createHash('md5').update(bookingId).digest('hex').substring(0, 8).toUpperCase();
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handleMarkAsCompleted = async () => {
    if (!selectedBooking) return;
    if (!confirm('Mark this booking as completed?')) return;
    try {
      await apiClient.patch(`/hotels/bookings/${selectedBooking.id}/status`, {
        status: 'COMPLETED',
      });
      setShowDetailsModal(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (err: any) {
      alert(err.error || 'Failed to update booking status');
    }
  };

  const handleOpenRefundModal = () => {
    if (selectedBooking) {
      setRefundAmount((selectedBooking.total - (selectedBooking.refundAmount || 0)).toString());
      setRefundReason('');
      setShowRefundModal(true);
    }
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setRefundAmount('');
    setRefundReason('');
  };

  const handleProcessRefund = async () => {
    if (!selectedBooking || !refundAmount || !refundReason) {
      alert('Please fill in all refund details');
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    const maxRefund = selectedBooking.total - (selectedBooking.refundAmount || 0);
    if (amount > maxRefund) {
      alert(`Refund amount cannot exceed ${formatCurrency(maxRefund, selectedBooking.currency)}`);
      return;
    }

    setProcessingRefund(true);
    try {
      await apiClient.post(`/hotels/bookings/${selectedBooking.id}/refund`, {
        amount,
        reason: refundReason,
      });

      alert('Refund processed successfully!');
      handleCloseRefundModal();
      setShowDetailsModal(false);
      setSelectedBooking(null);
      // Force a fresh fetch of bookings
      await fetchBookings();
    } catch (err: any) {
      alert(err.error || 'Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleOpenPaymentModal = () => {
    if (selectedBooking) {
      setShowPaymentModal(true);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBooking) return;

    setProcessingPayment(true);
    try {
      await apiClient.patch(`/hotels/bookings/${selectedBooking.id}/payment-status`, {
        paymentStatus: 'PAID',
      });

      alert('Payment status updated to Paid!');
      handleClosePaymentModal();
      setShowDetailsModal(false);
      setSelectedBooking(null);
      // Force a fresh fetch of bookings
      await fetchBookings();
    } catch (err: any) {
      alert(err.error || 'Failed to update payment status');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCreateBooking = () => {
    // Get the first hotel ID from bookings, or use empty string
    const firstHotelId = bookings.length > 0 ? bookings[0].hotelId : '';
    setSelectedHotelId(firstHotelId);
    setShowCreateBookingModal(true);
  };

  const handleBookingCreated = () => {
    setShowCreateBookingModal(false);
    // Refresh bookings list
    fetchBookings();
  };

  const handlePrintConfirmation = () => {
    if (!selectedBooking) return;

    const hotelAddress = selectedBooking.hotelFullAddress || 
      [selectedBooking.hotelAddress, selectedBooking.hotelCity, selectedBooking.hotelCountry]
        .filter(Boolean).join(', ') || 'Address not available';

    // Format check-in/out times
    const formatTime = (time: string) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Generate star rating display
    const starRating = selectedBooking.starRating 
      ? '⭐'.repeat(selectedBooking.starRating) 
      : '';

    // Provider information section
    const providerHtml = selectedBooking.providerName ? `
      <div class="provider-box">
        <h4>🏢 Provider Information</h4>
        <p style="font-size: 14px; margin: 4px 0;">
          <strong>Company:</strong> ${selectedBooking.providerName}
        </p>
        ${selectedBooking.providerReference ? `
        <p style="font-size: 14px; margin: 4px 0;">
          <strong>Reference:</strong> ${selectedBooking.providerReference}
        </p>
        ` : ''}
        ${selectedBooking.providerPhone ? `
        <p style="font-size: 14px; margin: 4px 0;">
          <strong>Contact:</strong> ${selectedBooking.providerPhone}
        </p>
        ` : ''}
      </div>
    ` : '';

    // Gate information sections
    const closestGateHtml = selectedBooking.closestGate ? `
      <div class="info-box gate-box">
        <h4>🚶 Closest Haram Gate</h4>
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">
          Gate ${selectedBooking.closestGate.gateNumber} - ${selectedBooking.closestGate.name}
        </p>
        <p style="color: #666; margin: 0;">
          ${selectedBooking.closestGate.distance}m • ${selectedBooking.closestGate.walkingTime} min walk
        </p>
      </div>
    ` : '';

    const kaabaGateHtml = selectedBooking.kaabaGate ? `
      <div class="info-box gate-box kaaba">
        <h4>🕋 Kaaba Gate Access</h4>
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">
          Gate ${selectedBooking.kaabaGate.gateNumber} - ${selectedBooking.kaabaGate.name}
        </p>
        <p style="color: #666; margin: 0;">
          ${selectedBooking.kaabaGate.distance}m • ${selectedBooking.kaabaGate.walkingTime} min walk
        </p>
      </div>
    ` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmation - ${selectedBooking.id}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0d6efd;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #0d6efd;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .booking-id {
            font-family: monospace;
            background: #f8f9fa;
            padding: 8px 16px;
            border-radius: 4px;
            display: inline-block;
            font-size: 14px;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
          }
          .status-COMPLETED { background: #d4edda; color: #155724; }
          .status-PENDING { background: #fff3cd; color: #856404; }
          .status-CANCELLED { background: #f8d7da; color: #721c24; }
          .status-COMPLETED { background: #d1ecf1; color: #0c5460; }
          .status-REFUNDED { background: #e2e3e5; color: #383d41; }
          
          .section {
            margin-bottom: 28px;
          }
          .section h3 {
            color: #0d6efd;
            font-size: 18px;
            border-bottom: 2px solid #0d6efd;
            padding-bottom: 10px;
            margin-bottom: 16px;
            font-weight: 600;
          }
          
          .accommodation-section {
            background: #e8f4fd;
            border: 2px solid #0d6efd;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 28px;
          }
          .accommodation-section h3 {
            border: none;
            margin-top: 0;
            margin-bottom: 16px;
            color: #0d6efd;
          }
          .hotel-name {
            font-size: 20px;
            font-weight: bold;
            color: #0d6efd;
            margin-bottom: 4px;
          }
          .star-rating {
            font-size: 14px;
            margin-bottom: 8px;
            color: #666;
          }
          .room-name {
            font-size: 16px;
            color: #495057;
            margin-bottom: 12px;
            font-weight: 500;
          }
          .address {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            color: #666;
            font-size: 14px;
            margin-bottom: 12px;
          }
          .times {
            display: flex;
            gap: 24px;
            padding-top: 12px;
            border-top: 1px solid #cce5ff;
            font-size: 14px;
            flex-wrap: wrap;
          }
          .times span {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .provider-box {
            background: #f0f7ff;
            border-left: 4px solid #0d6efd;
            padding: 12px;
            border-radius: 4px;
            margin-top: 12px;
            font-size: 13px;
          }
          .provider-box h4 {
            margin: 0 0 8px 0;
            color: #0d6efd;
            font-size: 13px;
            font-weight: 600;
          }
          .provider-box p {
            margin: 4px 0;
            font-size: 13px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .info-box {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          .info-box h4 {
            margin: 0 0 12px 0;
            color: #6c757d;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .info-box p {
            margin: 4px 0;
            font-size: 14px;
          }
          .info-box .value {
            font-size: 18px;
            font-weight: bold;
            color: #0d6efd;
            margin-top: 8px;
          }
          
          .gate-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
          }
          .gate-box h4 {
            color: #e65100;
          }
          .gate-box.kaaba {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
          }
          .gate-box.kaaba h4 {
            color: #2e7d32;
          }
          
          .payment-summary {
            background: #e7f1ff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #b3d9ff;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .payment-row.total {
            border-top: 2px solid #0d6efd;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            font-weight: bold;
            color: #0d6efd;
          }
          .refund-section {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 2px dashed #28a745;
          }
          .refund-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #28a745;
            font-weight: 500;
          }
          
          .important-info {
            background: #fff8e1;
            border: 1px solid #ffecb3;
            border-radius: 8px;
            padding: 16px;
          }
          .important-info h4 {
            margin: 0 0 12px 0;
            color: #f57c00;
            font-size: 14px;
            font-weight: 600;
          }
          .important-info ul {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
          }
          .important-info li {
            margin-bottom: 6px;
            line-height: 1.5;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
          }
          .footer p {
            margin: 4px 0;
          }
          
          .print-btn {
            display: block;
            margin: 20px auto;
            padding: 12px 32px;
            background: #0d6efd;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 500;
          }
          .print-btn:hover {
            background: #0b5ed7;
          }
          @media print {
            body { padding: 20px; }
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- 1. HEADER WITH BOOKING ID AND STATUS -->
        <div class="header">
          <h1>🏨 Booking Confirmation</h1>
          <div class="header-content">
            <span class="booking-id">${selectedBooking.id}</span>
            <span class="status-badge status-${selectedBooking.status}">${getStatusDisplayText(selectedBooking.status)}</span>
          </div>
        </div>

        <!-- 2. ACCOMMODATION SECTION -->
        <div class="accommodation-section">
          <h3>🏨 Accommodation</h3>
          <div class="hotel-name">${selectedBooking.hotelName}</div>
          ${starRating ? `<div class="star-rating">${starRating}</div>` : ''}
          <div class="room-name">${selectedBooking.roomName}</div>
          <div class="address">
            <span>📍</span>
            <span>${hotelAddress}</span>
          </div>
          <div class="times">
            <span>🔑 Check-in: <strong>${formatTime(selectedBooking.checkInTime || '14:00')}</strong></span>
            <span>🚪 Check-out: <strong>${formatTime(selectedBooking.checkOutTime || '11:00')}</strong></span>
          </div>
          ${providerHtml}
        </div>

        <!-- 3. GUEST INFORMATION SECTION -->
        <div class="section">
          <h3>👤 Guest Information</h3>
          ${selectedBooking.guests && selectedBooking.guests.length > 0 ? `
            <div style="display: grid; gap: 16px;">
              ${selectedBooking.guests.map((guest: any, idx: number) => `
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid ${guest.isLeadPassenger ? '#0d6efd' : '#6c757d'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: #0d6efd; font-size: 16px; font-weight: 600;">
                      ${guest.firstName} ${guest.lastName}
                      ${guest.isLeadPassenger ? '<span style="background: #0d6efd; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px; font-weight: bold;">LEAD</span>' : ''}
                    </h4>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                    <div>
                      <span style="color: #666; font-weight: 500;">📧 Email:</span>
                      <p style="margin: 4px 0; color: #333;">${guest.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span style="color: #666; font-weight: 500;">📱 Phone:</span>
                      <p style="margin: 4px 0; color: #333;">${guest.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span style="color: #666; font-weight: 500;">🌍 Nationality:</span>
                      <p style="margin: 4px 0; color: #333;">${guest.nationality || 'N/A'}</p>
                    </div>
                    <div>
                      <span style="color: #666; font-weight: 500;">📄 Passport:</span>
                      <p style="margin: 4px 0; color: #333;">${guest.passportNumber || 'N/A'}</p>
                    </div>
                    ${guest.dateOfBirth ? `
                    <div>
                      <span style="color: #666; font-weight: 500;">🎂 Date of Birth:</span>
                      <p style="margin: 4px 0; color: #333;">${new Date(guest.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="info-grid">
              <div class="info-box">
                <h4>Guest Name</h4>
                <p class="value">${selectedBooking.guestName || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h4>Email</h4>
                <p>${selectedBooking.guestEmail || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h4>Phone</h4>
                <p>${selectedBooking.guestPhone || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h4>Guest Count</h4>
                <p class="value">${selectedBooking.guestCount} ${selectedBooking.guestCount === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
          `}
        </div>

        <!-- 4. STAY DETAILS SECTION -->
        <div class="section">
          <h3>📅 Stay Details</h3>
          <div class="info-grid">
            <div class="info-box">
              <h4>Check-in Date</h4>
              <p class="value">${formatDate(selectedBooking.checkIn)}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">From ${formatTime(selectedBooking.checkInTime || '14:00')}</p>
            </div>
            <div class="info-box">
              <h4>Check-out Date</h4>
              <p class="value">${formatDate(selectedBooking.checkOut)}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">By ${formatTime(selectedBooking.checkOutTime || '11:00')}</p>
            </div>
            <div class="info-box">
              <h4>Duration</h4>
              <p class="value">${selectedBooking.nights}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">${selectedBooking.nights === 1 ? 'night' : 'nights'}</p>
            </div>
            <div class="info-box">
              <h4>Booking Date</h4>
              <p style="font-size: 13px;">${new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">${new Date(selectedBooking.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <!-- 5. HARAM GATE ACCESS SECTION (if available) -->
        ${(closestGateHtml || kaabaGateHtml) ? `
        <div class="section">
          <h3>🕌 Haram Gate Access</h3>
          <div class="info-grid">
            ${closestGateHtml}
            ${kaabaGateHtml}
          </div>
        </div>
        ` : ''}

        <!-- 6. PAYMENT SUMMARY SECTION -->
        <div class="section">
          <h3>💳 Payment Summary</h3>
          <div class="payment-summary">
            <div class="payment-row">
              <span>Subtotal</span>
              <span>${formatCurrency(selectedBooking.subtotal, selectedBooking.currency)}</span>
            </div>
            <div class="payment-row">
              <span>Tax</span>
              <span>${formatCurrency(selectedBooking.tax, selectedBooking.currency)}</span>
            </div>
            <div class="payment-row total">
              <span>Total</span>
              <span style="color: ${selectedBooking.status === 'CANCELLED' || selectedBooking.status === 'REFUNDED' ? '#dc3545' : '#0d6efd'}; ${selectedBooking.refundAmount && selectedBooking.refundAmount >= selectedBooking.total ? 'text-decoration: line-through;' : ''}">
                ${formatCurrency(selectedBooking.total, selectedBooking.currency)}
              </span>
            </div>
            ${selectedBooking.refundAmount && selectedBooking.refundAmount > 0 ? `
            <div class="refund-section">
              <div class="refund-row">
                <span>💰 ${selectedBooking.refundAmount >= selectedBooking.total ? 'Full Refund' : 'Partial Refund'}</span>
                <span>-${formatCurrency(selectedBooking.refundAmount, selectedBooking.currency)}</span>
              </div>
              ${selectedBooking.refundAmount < selectedBooking.total ? `
              <div class="payment-row" style="margin-top: 8px; color: #0d6efd; font-weight: bold;">
                <span>Net Amount Paid</span>
                <span>${formatCurrency(selectedBooking.total - selectedBooking.refundAmount, selectedBooking.currency)}</span>
              </div>
              ` : ''}
              ${selectedBooking.refundReason ? `
              <div style="margin-top: 8px; padding: 8px; background: #d4edda; border-radius: 4px; font-size: 12px;">
                <strong>Refund Reason:</strong> ${selectedBooking.refundReason}
              </div>
              ` : ''}
              ${selectedBooking.refundedAt ? `
              <div style="margin-top: 4px; font-size: 11px; color: #666;">
                Refunded on: ${new Date(selectedBooking.refundedAt).toLocaleDateString()}
              </div>
              ` : ''}
            </div>
            ` : ''}
            ${selectedBooking.status === 'CANCELLED' && !selectedBooking.refundAmount ? `
            <div style="margin-top: 16px; padding: 12px; background: #f8d7da; border-radius: 4px; text-align: center;">
              <span style="color: #721c24; font-weight: bold;">⚠️ Booking Cancelled</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- 7. IMPORTANT INFORMATION SECTION -->
        <div class="important-info">
          <h4>📋 Important Information</h4>
          <ul>
            <li>Please present this confirmation and a valid ID at check-in</li>
            <li>Early check-in and late check-out are subject to availability</li>
            <li>Contact the hotel directly for special requests</li>
            ${selectedBooking.closestGate ? `<li>The closest Haram gate is Gate ${selectedBooking.closestGate.gateNumber} (${selectedBooking.closestGate.walkingTime} min walk)</li>` : ''}
            ${selectedBooking.providerName ? `<li>Provider: ${selectedBooking.providerName}${selectedBooking.providerPhone ? ` - Contact: ${selectedBooking.providerPhone}` : ''}</li>` : ''}
          </ul>
        </div>

        <!-- 8. FOOTER -->
        <div class="footer">
          <p>Booking completed on: ${new Date(selectedBooking.createdAt).toLocaleString()}</p>
          <p>Thank you for your booking! We look forward to hosting you.</p>
          <p style="margin-top: 12px; font-size: 10px; color: #999;">Booking Reference: ${selectedBooking.id}</p>
        </div>

        <button class="print-btn" onclick="window.print()">🖨️ Print Confirmation</button>
      </body>
      </html>
    `;

    // Open a clean popup window without browser chrome
    const printWindow = window.open(
      '', 
      'BookingConfirmation',
      'width=850,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes'
    );
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const getBookingSourceBadge = (source: string) => {
    switch (source) {
      case 'AGENT':
        return { class: 'bg-purple', label: 'Agent Booking', icon: 'ri-user-star-line' };
      case 'BROKER':
        return { class: 'bg-warning', label: 'Broker Booking', icon: 'ri-briefcase-line' };
      case 'API':
        return { class: 'bg-info', label: 'API Booking', icon: 'ri-code-line' };
      case 'ADMIN':
        return { class: 'bg-dark', label: 'Admin Booking', icon: 'ri-admin-line' };
      default:
        return { class: 'bg-primary', label: 'Direct Booking', icon: 'ri-user-line' };
    }
  };

  // Sort handler for list view
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort bookings for list view
  const getSortedBookings = () => {
    return [...bookings].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'guestName':
          aVal = a.guestName.toLowerCase();
          bVal = b.guestName.toLowerCase();
          break;
        case 'hotelName':
          aVal = a.hotelName.toLowerCase();
          bVal = b.hotelName.toLowerCase();
          break;
        case 'roomName':
          aVal = a.roomName.toLowerCase();
          bVal = b.roomName.toLowerCase();
          break;
        case 'checkIn':
          aVal = new Date(a.checkIn).getTime();
          bVal = new Date(b.checkIn).getTime();
          break;
        case 'checkOut':
          aVal = new Date(a.checkOut).getTime();
          bVal = new Date(b.checkOut).getTime();
          break;
        case 'nights':
          aVal = a.nights;
          bVal = b.nights;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'total':
          aVal = a.total;
          bVal = b.total;
          break;
        case 'paymentStatus':
          aVal = a.paymentStatus || '';
          bVal = b.paymentStatus || '';
          break;
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getPaymentStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'PAID':
        return 'bg-success';
      case 'UNPAID':
        return 'bg-danger';
      case 'REFUNDED':
        return 'bg-secondary';
      case 'PARTIALLY_REFUNDED':
        return 'bg-warning text-dark';
      default:
        return 'bg-light text-dark';
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>▲</span>;
    return <span style={{ marginLeft: '4px' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <>
      <div className="author-area" style={{ width: '100%' }}>
        <div style={{ width: '100%' }}>
          <div className="row">
            <div className="col-12">
              <div className="author-content-wrap">
                <div className="box-title">
                  <h2>{userName}&apos;s {currentRoute === "/dashboard/listings/bookings" ? "Listing Bookings" : "Bookings"}</h2>
                  <p>
                    {currentRoute === "/dashboard/listings/bookings" 
                      ? "View and manage all bookings for your hotels."
                      : "View and manage your bookings."}
                  </p>
                  
                  {/* Filter Controls */}
                  <div className="d-flex gap-2 mt-3 mb-4 flex-wrap align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by guest name or email..."
                      style={{ maxWidth: '250px' }}
                      value={searchGuest}
                      onChange={(e) => setSearchGuest(e.target.value)}
                    />
                    <select 
                      className="form-select" 
                      style={{ maxWidth: '200px' }}
                      value={filterHotel}
                      onChange={(e) => setFilterHotel(e.target.value)}
                    >
                      <option value="">All Hotels</option>
                      {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                      ))}
                    </select>
                    <select 
                      className="form-select" 
                      style={{ maxWidth: '200px' }}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                    {(filterStatus || filterHotel || searchGuest) && (
                      <button 
                        className="btn btn-outline-danger"
                        onClick={clearAllFilters}
                      >
                        <i className="ri-close-line me-2"></i>
                        Clear Filters
                      </button>
                    )}
                    <div className="ms-auto d-flex gap-2">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={fetchBookings}
                      >
                        <i className="ri-refresh-line me-2"></i>
                        Refresh
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const hotelId = allHotels.length > 0 ? allHotels[0].id : '';
                          if (hotelId) {
                            setSelectedHotelId(hotelId);
                            setShowCreateBookingModal(true);
                          } else {
                            alert('No hotels found. Please create a hotel first.');
                          }
                        }}
                      >
                        <i className="ri-add-line me-2"></i>Create Booking
                      </button>
                    </div>
                  </div>

                  {/* Booking Count */}
                  <div className="mb-3">
                    <small className="text-muted">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</small>
                  </div>                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading bookings...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {error}
                  </div>
                )}

                {/* Bookings List */}
                {!loading && !error && bookings.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    <i className="ri-information-line me-2"></i>
                    No bookings found for your hotels.
                  </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                  <>
                    {/* List View - Split Tables: Active on top, Completed on bottom */}
                    {(() => {
                      const sorted = getSortedBookings();
                      const activeBookings = sorted.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REFUNDED');
                      const completedBookings = sorted.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'REFUNDED');

                      const renderTableHeader = () => (
                        <thead>
                          <tr>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'guestName' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('guestName')}>
                              Guest {renderSortIndicator('guestName')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'hotelName' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('hotelName')}>
                              Hotel {renderSortIndicator('hotelName')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'roomName' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('roomName')}>
                              Room {renderSortIndicator('roomName')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'checkIn' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('checkIn')}>
                              Check-in {renderSortIndicator('checkIn')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'checkOut' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('checkOut')}>
                              Check-out {renderSortIndicator('checkOut')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'nights' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('nights')}>
                              Nights {renderSortIndicator('nights')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'status' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('status')}>
                              Status {renderSortIndicator('status')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('total')}>
                              Total {renderSortIndicator('total')}
                            </th>
                            <th style={{ cursor: 'pointer', fontWeight: sortField === 'paymentStatus' ? 'bold' : 'normal', whiteSpace: 'nowrap' }} onClick={() => handleSort('paymentStatus')}>
                              Payment {renderSortIndicator('paymentStatus')}
                            </th>
                          </tr>
                        </thead>
                      );

                      const renderBookingRow = (booking: Booking) => (
                        <tr
                          key={booking.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => { setSelectedBooking(booking); setShowDetailsModal(true); }}
                        >
                          <td>
                            <div style={{ fontWeight: 500 }}>{booking.guestName || 'N/A'}</div>
                            {booking.guestEmail && (
                              <small className="text-muted">{booking.guestEmail}</small>
                            )}
                          </td>
                          <td>{booking.hotelName}</td>
                          <td>{booking.roomName}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(booking.checkIn)}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(booking.checkOut)}</td>
                          <td className="text-center">{booking.nights}</td>
                          <td>
                            <span className={`badge ${
                              booking.status === 'COMPLETED' ? 'bg-success' :
                              booking.status === 'PENDING' ? 'bg-warning text-dark' :
                              booking.status === 'CANCELLED' ? 'bg-danger' :
                              booking.status === 'CONFIRMED' ? 'bg-info' :
                              booking.status === 'REFUNDED' ? 'bg-danger' :
                              'bg-secondary'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(booking.total, booking.currency)}</td>
                          <td>
                            <span className={`badge ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                              {booking.paymentStatus || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );

                      return (
                        <>
                          {/* Active Bookings */}
                          <div className="mb-4">
                            {(() => {
                              const totalActivePages = Math.ceil(activeBookings.length / PAGE_SIZE);
                              const pagedActive = activeBookings.slice((activePageNum - 1) * PAGE_SIZE, activePageNum * PAGE_SIZE);
                              return (
                                <>
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0" style={{ color: '#333' }}>
                                      <i className="ri-time-line me-2"></i>
                                      Active Bookings
                                      <span className="badge bg-primary ms-2">{activeBookings.length}</span>
                                    </h6>
                                    {totalActivePages > 1 && (
                                      <div className="d-flex align-items-center gap-2">
                                        <small className="text-muted">Page {activePageNum} of {totalActivePages}</small>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          disabled={activePageNum <= 1}
                                          onClick={() => setActivePageNum(activePageNum - 1)}
                                          style={{ padding: '2px 8px' }}
                                        >&lt;</button>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          disabled={activePageNum >= totalActivePages}
                                          onClick={() => setActivePageNum(activePageNum + 1)}
                                          style={{ padding: '2px 8px' }}
                                        >&gt;</button>
                                      </div>
                                    )}
                                  </div>
                                  {pagedActive.length > 0 ? (
                                    <div className="table-responsive">
                                      <table className="table table-hover" style={{ fontSize: '0.9rem' }}>
                                        {renderTableHeader()}
                                        <tbody>
                                          {pagedActive.map(renderBookingRow)}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>No active bookings</p>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          {/* Completed / Past Bookings */}
                          {completedBookings.length > 0 && (
                            <div>
                              {(() => {
                                const totalCompletedPages = Math.ceil(completedBookings.length / PAGE_SIZE);
                                const pagedCompleted = completedBookings.slice((completedPageNum - 1) * PAGE_SIZE, completedPageNum * PAGE_SIZE);
                                return (
                                  <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h6 className="mb-0" style={{ color: '#666' }}>
                                        <i className="ri-check-double-line me-2"></i>
                                        Completed
                                        <span className="badge bg-secondary ms-2">{completedBookings.length}</span>
                                      </h6>
                                      {totalCompletedPages > 1 && (
                                        <div className="d-flex align-items-center gap-2">
                                          <small className="text-muted">Page {completedPageNum} of {totalCompletedPages}</small>
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled={completedPageNum <= 1}
                                            onClick={() => setCompletedPageNum(completedPageNum - 1)}
                                            style={{ padding: '2px 8px' }}
                                          >&lt;</button>
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled={completedPageNum >= totalCompletedPages}
                                            onClick={() => setCompletedPageNum(completedPageNum + 1)}
                                            style={{ padding: '2px 8px' }}
                                          >&gt;</button>
                                        </div>
                                      )}
                                    </div>
                                    <div className="table-responsive">
                                      <table className="table table-hover" style={{ fontSize: '0.9rem', opacity: 0.75 }}>
                                        {renderTableHeader()}
                                        <tbody>
                                          {pagedCompleted.map(renderBookingRow)}
                                        </tbody>
                                      </table>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </>
                      );
                    })()}


                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ri-file-text-line me-2"></i>
                  Booking Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Booking ID and Status */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <small className="text-muted">Booking ID</small>
                    <h6 className="mb-0 font-monospace">{selectedBooking.id}</h6>
                  </div>
                  <div className="d-flex gap-2">
                    <span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`}>
                      {getStatusDisplayText(selectedBooking.status)}
                    </span>
                  </div>
                </div>

                {/* Booking Source */}
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: selectedBooking.bookingSource === 'AGENT' ? '#f3e5f5' : selectedBooking.bookingSource === 'BROKER' ? '#fff8e1' : '#e3f2fd' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`${getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').icon} fs-4`}></i>
                    <div>
                      <span className={`badge ${getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').class}`}>
                        {getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').label}
                      </span>
                      {(selectedBooking.bookingSource === 'AGENT' || selectedBooking.bookingSource === 'BROKER') && selectedBooking.agentName && (
                        <div className="mt-1">
                          <small className="text-muted">{selectedBooking.bookingSource === 'BROKER' ? 'Broker: ' : 'Agent: '}</small>
                          <strong>{selectedBooking.agentName}</strong>
                          {selectedBooking.agentEmail && (
                            <small className="text-muted d-block">{selectedBooking.agentEmail}</small>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Guest Information */}
                  <div className="col-md-12 mb-4">
                    <h6 className="text-muted mb-3">
                      <i className="ri-user-line me-2"></i>
                      Guest Information
                    </h6>
                    {selectedBooking.guests && selectedBooking.guests.length > 0 ? (
                      <div className="row">
                        {selectedBooking.guests.map((guest, index) => (
                          <div key={guest.id || index} className="col-md-6 mb-3">
                            <div className="card">
                              <div className="card-body">
                                {guest.isLeadPassenger && (
                                  <div className="mb-2">
                                    <span className="badge bg-primary">Lead Passenger</span>
                                  </div>
                                )}
                                <p className="mb-2">
                                  <strong>{guest.firstName} {guest.lastName}</strong>
                                </p>
                                {guest.email && (
                                  <p className="mb-2 text-muted small">
                                    <i className="ri-mail-line me-2"></i>
                                    {guest.email}
                                  </p>
                                )}
                                {guest.phone && (
                                  <p className="mb-2 text-muted small">
                                    <i className="ri-phone-line me-2"></i>
                                    {guest.phone}
                                  </p>
                                )}
                                {guest.nationality && (
                                  <p className="mb-2 text-muted small">
                                    <i className="ri-global-line me-2"></i>
                                    {guest.nationality}
                                  </p>
                                )}
                                {guest.passportNumber && (
                                  <p className="mb-2 text-muted small">
                                    <i className="ri-id-card-line me-2"></i>
                                    {guest.passportNumber}
                                  </p>
                                )}
                                {guest.dateOfBirth && (
                                  <p className="mb-0 text-muted small">
                                    <i className="ri-calendar-line me-2"></i>
                                    {new Date(guest.dateOfBirth).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="card">
                        <div className="card-body">
                          <p className="mb-2">
                            <strong>{selectedBooking.guestName || 'N/A'}</strong>
                          </p>
                          {selectedBooking.guestEmail && (
                            <p className="mb-2 text-muted">
                              <i className="ri-mail-line me-2"></i>
                              {selectedBooking.guestEmail}
                            </p>
                          )}
                          {selectedBooking.guestPhone && (
                            <p className="mb-2 text-muted">
                              <i className="ri-phone-line me-2"></i>
                              {selectedBooking.guestPhone}
                            </p>
                          )}
                          <p className="mb-0 text-muted">
                            <i className="ri-group-line me-2"></i>
                            {selectedBooking.guestCount} {selectedBooking.guestCount === 1 ? 'guest' : 'guests'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="row">
                  {/* Stay Details */}
                  <div className="col-md-6 mb-4">
                    <h6 className="text-muted mb-3">
                      <i className="ri-calendar-line me-2"></i>
                      Stay Details
                    </h6>
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Check-in</span>
                          <strong>{formatDate(selectedBooking.checkIn)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Check-out</span>
                          <strong>{formatDate(selectedBooking.checkOut)}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Duration</span>
                          <strong>{selectedBooking.nights} {selectedBooking.nights === 1 ? 'night' : 'nights'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <i className="ri-hotel-line me-2"></i>
                    Accommodation
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      <h6 className="mb-1">{selectedBooking.hotelName}</h6>
                      <p className="text-muted mb-1">{selectedBooking.roomName}</p>
                      {(selectedBooking.hotelFullAddress || selectedBooking.hotelAddress) && (
                        <p className="text-muted mb-0 small">
                          <i className="ri-map-pin-line me-1"></i>
                          {selectedBooking.hotelFullAddress || 
                            [selectedBooking.hotelAddress, selectedBooking.hotelCity, selectedBooking.hotelCountry]
                              .filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <i className="ri-money-dollar-circle-line me-2"></i>
                    Payment Summary
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal</span>
                        <span>{formatCurrency(selectedBooking.subtotal, selectedBooking.currency)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax</span>
                        <span>{formatCurrency(selectedBooking.tax, selectedBooking.currency)}</span>
                      </div>
                      {selectedBooking.bookingSource === 'BROKER' && (selectedBooking as any).brokerFee > 0 && (
                        <div className="d-flex justify-content-between mb-2" style={{ background: '#fef3c7', margin: '0 -12px', padding: '8px 12px', borderRadius: 4 }}>
                          <span style={{ color: '#92400e' }}>💼 Broker Fee</span>
                          <strong style={{ color: '#92400e' }}>{formatCurrency((selectedBooking as any).brokerFee, selectedBooking.currency)}</strong>
                        </div>
                      )}
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total</strong>
                        <strong 
                          className={`fs-5 ${selectedBooking.status === 'CANCELLED' || selectedBooking.status === 'REFUNDED' ? 'text-danger' : 'text-primary'}`}
                          style={selectedBooking.refundAmount && selectedBooking.refundAmount >= selectedBooking.total ? { textDecoration: 'line-through' } : {}}
                        >
                          {formatCurrency(selectedBooking.total, selectedBooking.currency)}
                        </strong>
                      </div>
                      
                      {/* Refund Information */}
                      {(selectedBooking.refundAmount && selectedBooking.refundAmount > 0) || selectedBooking.status === 'REFUNDED' || selectedBooking.paymentStatus === 'REFUNDED' ? (
                        <>
                          <hr style={{ borderStyle: 'dashed', borderColor: '#28a745' }} />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-success">
                              <i className="ri-refund-2-line me-1"></i>
                              {selectedBooking.refundAmount && selectedBooking.refundAmount >= selectedBooking.total ? 'Full Refund' : 'Partial Refund'}
                            </span>
                            <strong className="text-success">
                              -{formatCurrency(selectedBooking.refundAmount || 0, selectedBooking.currency)}
                            </strong>
                          </div>
                          {selectedBooking.refundAmount && selectedBooking.refundAmount < selectedBooking.total && (
                            <div className="d-flex justify-content-between">
                              <strong>Net Amount Paid</strong>
                              <strong className="text-primary fs-5">
                                {formatCurrency(selectedBooking.total - selectedBooking.refundAmount, selectedBooking.currency)}
                              </strong>
                            </div>
                          )}
                          {selectedBooking.refundReason && (
                            <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#d4edda' }}>
                              <small>
                                <strong>Refund Reason:</strong> {selectedBooking.refundReason}
                              </small>
                            </div>
                          )}
                          {selectedBooking.refundedAt && (
                            <small className="text-muted d-block mt-1">
                              Refunded on: {new Date(selectedBooking.refundedAt).toLocaleDateString()}
                            </small>
                          )}
                        </>
                      ) : null}
                      
                      {/* Cancelled without refund */}
                      {selectedBooking.status === 'CANCELLED' && !selectedBooking.refundAmount && (
                        <div className="mt-3 p-2 rounded text-center" style={{ backgroundColor: '#f8d7da' }}>
                          <span className="text-danger">
                            <i className="ri-close-circle-line me-1"></i>
                            <strong>Booking Cancelled</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-muted small">
                  <p className="mb-1">
                    <i className="ri-time-line me-2"></i>
                    Booked on: {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                  {selectedBooking.updatedAt !== selectedBooking.createdAt && (
                    <p className="mb-0">
                      <i className="ri-refresh-line me-2"></i>
                      Last updated: {new Date(selectedBooking.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                {selectedBooking.status === 'PENDING' && selectedBooking.paymentStatus !== 'PAID' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleOpenPaymentModal}
                  >
                    <i className="ri-check-line me-2"></i>
                    Mark as Paid
                  </button>
                )}
                {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleMarkAsCompleted}
                  >
                    <i className="ri-check-double-line me-2"></i>
                    Mark as Completed
                  </button>
                )}
                {(selectedBooking.status === 'COMPLETED' || selectedBooking.status === 'COMPLETED' || selectedBooking.status === 'PENDING') && (
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={handleOpenRefundModal}
                  >
                    <i className="ri-refund-2-line me-2"></i>
                    Process Refund
                  </button>
                )}
                <Link
                  href={`/bookings/${selectedBooking.id}/confirmation`}
                  className="btn btn-outline-primary"
                  target="_blank"
                >
                  <i className="ri-printer-line me-2"></i>
                  Print Confirmation
                </Link>
                <Link
                  href={`/dashboard/stay-details/?hotelId=${selectedBooking.hotelId}`}
                  className="btn btn-primary"
                >
                  <i className="ri-hotel-line me-2"></i>
                  View Hotel
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for purple badge */}
      <style jsx>{`
        :global(.bg-purple) {
          background-color: #9c27b0 !important;
        }
      `}</style>

      {/* Refund Modal */}
      {showRefundModal && selectedBooking && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseRefundModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-warning bg-opacity-10">
                <h5 className="modal-title">
                  <i className="ri-refund-2-line me-2 text-warning"></i>
                  Process Refund
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseRefundModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Booking Summary */}
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Booking ID</span>
                    <strong className="font-monospace">{selectedBooking.id.slice(0, 8)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Guest</span>
                    <strong>{selectedBooking.guestName}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Original Total</span>
                    <strong>{formatCurrency(selectedBooking.total, selectedBooking.currency)}</strong>
                  </div>
                  {selectedBooking.refundAmount && selectedBooking.refundAmount > 0 && (
                    <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                      <span className="text-success">Already Refunded</span>
                      <strong className="text-success">
                        -{formatCurrency(selectedBooking.refundAmount, selectedBooking.currency)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Refund Amount */}
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Refund Amount</strong>
                    <span className="text-muted ms-2">
                      (Max: {formatCurrency(selectedBooking.total - (selectedBooking.refundAmount || 0), selectedBooking.currency)})
                    </span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{selectedBooking.currency}</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      max={selectedBooking.total - (selectedBooking.refundAmount || 0)}
                      disabled={processingRefund}
                    />
                  </div>
                  <small className="text-muted d-block mt-1">
                    Remaining after refund: <strong>{formatCurrency(
                      selectedBooking.total - (selectedBooking.refundAmount || 0) - parseFloat(refundAmount || '0'),
                      selectedBooking.currency
                    )}</strong>
                  </small>
                </div>

                {/* Refund Reason */}
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Refund Reason</strong>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Enter reason for refund (e.g., Guest requested cancellation, Booking error, etc.)"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    disabled={processingRefund}
                  ></textarea>
                </div>

                {/* Refund Type Indicator */}
                {refundAmount && (
                  <div className="alert alert-info mb-0">
                    <i className="ri-information-line me-2"></i>
                    {parseFloat(refundAmount) >= (selectedBooking.total - (selectedBooking.refundAmount || 0))
                      ? 'This will be a <strong>Full Refund</strong>'
                      : 'This will be a <strong>Partial Refund</strong>'}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseRefundModal}
                  disabled={processingRefund}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={handleProcessRefund}
                  disabled={processingRefund || !refundAmount || !refundReason}
                >
                  {processingRefund ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-refund-2-line me-2"></i>
                      Process Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showPaymentModal && selectedBooking && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleClosePaymentModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-success bg-opacity-10">
                <h5 className="modal-title">
                  <i className="ri-check-double-line me-2 text-success"></i>
                  Mark Payment as Paid
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleClosePaymentModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Booking Summary */}
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Booking ID</span>
                    <strong className="font-monospace">REF: {getMD5Reference(selectedBooking.id)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Guest</span>
                    <strong>{selectedBooking.guestName}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Hotel</span>
                    <strong>{selectedBooking.hotelName}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Total Amount</span>
                    <strong className="text-primary fs-5">{formatCurrency(selectedBooking.total, selectedBooking.currency)}</strong>
                  </div>
                </div>

                {/* Confirmation Message */}
                <div className="alert alert-info mb-0">
                  <i className="ri-information-line me-2"></i>
                  <strong>Confirm Payment:</strong> Are you sure you want to mark this booking payment as <strong>Paid</strong>? This action will update the payment status and the booking will no longer show as "Awaiting Payment".
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClosePaymentModal}
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleMarkAsPaid}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line me-2"></i>
                      Mark as Paid
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={showCreateBookingModal}
        onClose={() => setShowCreateBookingModal(false)}
        hotelId={selectedHotelId}
        onBookingCreated={(booking) => {
          // Refresh bookings list
          fetchBookings();
        }}
      />
    </>
  );
};

export default DashboardBookingsContent;
