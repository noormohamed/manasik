"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthorSidebar from "./AuthorSidebar";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterHotel, setFilterHotel] = useState<string>('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [searchGuest, setSearchGuest] = useState<string>('');
  const [calendarView, setCalendarView] = useState<'day' | 'month'>('day');
  const [calendarStartDate, setCalendarStartDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [filterStatus, filterHotel, filterDate, searchGuest]);

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

      // Use user bookings endpoint for customer's own bookings
      const response = (await apiClient.get('/users/me/bookings', { params })) as { bookings?: Booking[] };
      let fetchedBookings = response.bookings || [];
      
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
        roomName: b.roomType || b.metadata?.roomType || 'Room',
        checkIn: b.checkInDate || b.metadata?.checkInDate || '',
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || '',
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
      
      // Filter by date on client side
      if (filterDate) {
        const filterDateStr = filterDate.toISOString().split('T')[0];
        fetchedBookings = fetchedBookings.filter((b: Booking) => {
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          const selectedDate = new Date(filterDateStr);
          return selectedDate >= checkIn && selectedDate < checkOut;
        });
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

  // Generate calendar dates
  const generateCalendarDates = () => {
    const dates = [];
    const start = new Date(calendarStartDate);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(dateStr);
      
      return currentDate >= checkIn && currentDate < checkOut;
    });
  };

  // Calculate current month revenue based on calendar view
  const getCurrentMonthRevenue = () => {
    const startDate = new Date(calendarStartDate);
    const endDate = new Date(calendarStartDate);
    endDate.setDate(endDate.getDate() + 30);
    
    return bookings
      .filter(booking => {
        const checkIn = new Date(booking.checkIn);
        return checkIn >= startDate && checkIn < endDate;
      })
      .reduce((sum, b) => sum + b.total, 0);
  };

  // Calculate average monthly revenue from all bookings
  const getAverageMonthlyRevenue = () => {
    if (bookings.length === 0) return 0;
    
    // Group bookings by month
    const monthlyRevenue: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const checkInDate = new Date(booking.checkIn);
      const monthKey = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += booking.total;
    });
    
    const months = Object.keys(monthlyRevenue);
    if (months.length === 0) return 0;
    
    const totalRevenue = Object.values(monthlyRevenue).reduce((sum, rev) => sum + rev, 0);
    return totalRevenue / months.length;
  };

  // Navigate calendar
  const moveCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarStartDate);
    const daysToMove = calendarView === 'day' ? 7 : 30;
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - daysToMove);
    } else {
      newDate.setDate(newDate.getDate() + daysToMove);
    }
    
    setCalendarStartDate(newDate);
  };

  const resetCalendar = () => {
    setCalendarStartDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    // Toggle date filter - if same date clicked, clear filter
    if (filterDate && filterDate.toDateString() === date.toDateString()) {
      setFilterDate(null);
    } else {
      setFilterDate(date);
    }
  };

  const clearAllFilters = () => {
    setFilterStatus('');
    setFilterHotel('');
    setFilterDate(null);
    setSearchGuest('');
  };

  const handleStatusClick = (status: string) => {
    // Toggle status filter - if same status clicked, clear filter
    if (filterStatus === status) {
      setFilterStatus('');
    } else {
      setFilterStatus(status);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
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

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'CANCELLED':
        return '#dc3545';
      case 'COMPLETED':
        return '#17a2b8';
      case 'REFUNDED':
        return '#6c757d';
      default:
        return '#6c757d';
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

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
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
            <span class="status-badge status-${selectedBooking.status}">${selectedBooking.status}</span>
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
      case 'API':
        return { class: 'bg-info', label: 'API Booking', icon: 'ri-code-line' };
      case 'ADMIN':
        return { class: 'bg-dark', label: 'Admin Booking', icon: 'ri-admin-line' };
      default:
        return { class: 'bg-primary', label: 'Direct Booking', icon: 'ri-user-line' };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return { class: 'bg-success', label: 'Paid' };
      case 'PENDING':
        return { class: 'bg-warning', label: 'Pending' };
      case 'REFUNDED':
        return { class: 'bg-info', label: 'Refunded' };
      case 'FAILED':
        return { class: 'bg-danger', label: 'Failed' };
      default:
        return { class: 'bg-secondary', label: status || 'Unknown' };
    }
  };

  return (
    <>
      <div className="container pt-5 pb-5">
        <div className="row">
          <div className="col-xl-8 col-xxl-9">
            <ul className="nav nav-tabs most-popular-tab">
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/dashboard/bookings"
                    className={`dropdown-item ${
                      currentRoute === "/dashboard/bookings" ? "active" : ""
                    }`}
                  >Your Bookings</Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/dashboard/listings"
                    className={`dropdown-item ${
                      currentRoute === "/dashboard/listings" || currentRoute === "/dashboard/listings/bookings" ? "active" : ""
                    }`}
                  >Your Listings</Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/account/"
                    className={`dropdown-item ${
                      currentRoute === "/account/" ? "active" : ""
                    }`}
                  >Account</Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/payments/"
                    className={`dropdown-item ${
                      currentRoute === "/payments/" ? "active" : ""
                    }`}
                  >Payments</Link>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="author-area">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-xxl-9">
              <div className="author-content-wrap">
                <div className="box-title">
                  <h2>{userName}&apos;s {currentRoute === "/dashboard/listings/bookings" ? "Listing Bookings" : "Bookings"}</h2>
                  <p>
                    {currentRoute === "/dashboard/listings/bookings" 
                      ? "View and manage all bookings for your hotels."
                      : "View and manage your bookings."}
                  </p>
                  
                  {/* Filter Controls */}
                  <div className="d-flex gap-2 mt-3 mb-4 flex-wrap">
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
                    {(filterStatus || filterHotel || filterDate || searchGuest) && (
                      <button 
                        className="btn btn-outline-danger"
                        onClick={clearAllFilters}
                      >
                        <i className="ri-close-line me-2"></i>
                        Clear Filters
                      </button>
                    )}
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={fetchBookings}
                    >
                      <i className="ri-refresh-line me-2"></i>
                      Refresh
                    </button>
                  </div>

                  {/* Active Filters Display */}
                  {(filterDate || searchGuest) && (
                    <div className="mb-3">
                      {filterDate && (
                        <span className="badge bg-info me-2">
                          Date: {filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <i 
                            className="ri-close-line ms-1" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFilterDate(null)}
                          ></i>
                        </span>
                      )}
                      {searchGuest && (
                        <span className="badge bg-info me-2">
                          Guest: {searchGuest}
                          <i 
                            className="ri-close-line ms-1" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSearchGuest('')}
                          ></i>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Calendar View Toggle */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${calendarView === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCalendarView('day')}
                      >
                        Day View
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${calendarView === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCalendarView('month')}
                      >
                        Month View
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => moveCalendar('prev')}>
                        <i className="ri-arrow-left-line"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={resetCalendar}>
                        Today
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => moveCalendar('next')}>
                        <i className="ri-arrow-right-line"></i>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Calendar */}
                  <div className="mb-4" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <div className="d-flex gap-2" style={{ minWidth: 'max-content' }}>
                      {calendarDates.map((date, index) => {
                        const bookingsOnDate = getBookingsForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = filterDate && filterDate.toDateString() === date.toDateString();
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                        
                        return (
                          <div
                            key={index}
                            className="card text-center"
                            onClick={() => handleDateClick(date)}
                            style={{
                              minWidth: calendarView === 'day' ? '80px' : '60px',
                              backgroundColor: isSelected ? '#fff3cd' : (isToday ? '#e3f2fd' : 'white'),
                              border: isSelected ? '2px solid #ffc107' : (isToday ? '2px solid #2196f3' : '1px solid #dee2e6'),
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected && !isToday) {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected && !isToday) {
                                e.currentTarget.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            <div className="card-body p-2">
                              {calendarView === 'day' ? (
                                <>
                                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{dayName}</div>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{dayNum}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#666' }}>{monthName}</div>
                                </>
                              ) : (
                                <>
                                  <div style={{ fontSize: '0.7rem', color: '#666' }}>{monthName}</div>
                                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{dayNum}</div>
                                </>
                              )}
                              {bookingsOnDate.length > 0 && (
                                <div 
                                  className="badge bg-primary mt-1" 
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {bookingsOnDate.length}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

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
                    {/* Summary Stats */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="card text-center">
                          <div className="card-body">
                            <h3 className="mb-0">{bookings.length}</h3>
                            <small className="text-muted">Total Bookings</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div 
                          className="card text-center"
                          onClick={() => handleStatusClick('COMPLETED')}
                          style={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'COMPLETED' ? '2px solid #28a745' : '1px solid #dee2e6',
                            backgroundColor: filterStatus === 'COMPLETED' ? '#d4edda' : 'white',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (filterStatus !== 'COMPLETED') {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filterStatus !== 'COMPLETED') {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div className="card-body">
                            <h3 className="mb-0 text-success">
                              {bookings.filter(b => b.status === 'COMPLETED').length}
                            </h3>
                            <small className="text-muted">Completed</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div 
                          className="card text-center"
                          onClick={() => handleStatusClick('PENDING')}
                          style={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'PENDING' ? '2px solid #ffc107' : '1px solid #dee2e6',
                            backgroundColor: filterStatus === 'PENDING' ? '#fff3cd' : 'white',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (filterStatus !== 'PENDING') {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filterStatus !== 'PENDING') {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div className="card-body">
                            <h3 className="mb-0 text-warning">
                              {bookings.filter(b => b.status === 'PENDING').length}
                            </h3>
                            <small className="text-muted">Pending</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card text-center">
                          <div className="card-body">
                            <h3 className="mb-0 text-primary">
                              {formatCurrency(
                                getCurrentMonthRevenue(),
                                bookings[0]?.currency || 'USD'
                              )}
                            </h3>
                            <small className="text-muted d-block">Current Month</small>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                              Avg: {formatCurrency(
                                getAverageMonthlyRevenue(),
                                bookings[0]?.currency || 'USD'
                              )}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="list-group">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="list-group-item mb-3 p-0 rounded"
                          style={{
                            border: '1px solid #dee2e6',
                            borderLeftWidth: '6px',
                            borderLeftColor: getStatusBorderColor(booking.status),
                          }}
                        >
                          <div className="p-3">
                            {/* Top row: Booked on date (left) and Status badge (right) */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                                Booked on {formatDate(booking.createdAt)}
                              </small>
                              <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>

                            {/* Hotel and Room name */}
                            <div className="mb-2">
                              <h5 className="mb-1">{booking.hotelName}</h5>
                              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                {booking.roomName}
                              </p>
                            </div>

                            {/* Single row with guest info, dates, and price */}
                            <div className="d-flex justify-content-between align-items-end mb-3">
                              <div className="d-flex gap-4">
                                {/* Guest info */}
                                <div>
                                  <small className="text-muted d-block">
                                    <i className="ri-user-line me-1"></i>
                                    {booking.guestName}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-mail-line me-1"></i>
                                    {booking.guestEmail}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-group-line me-1"></i>
                                    {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                                  </small>
                                </div>
                                
                                {/* Date info */}
                                <div>
                                  <small className="text-muted d-block">
                                    <i className="ri-calendar-check-line me-1"></i>
                                    {formatDate(booking.checkIn)}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-calendar-line me-1"></i>
                                    {formatDate(booking.checkOut)}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-moon-line me-1"></i>
                                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                                  </small>
                                </div>
                              </div>

                              {/* Price section */}
                              <div className="text-end">
                                <h5 className="mb-0 text-primary">
                                  {booking.refundAmount && booking.refundAmount > 0
                                    ? formatCurrency(
                                        booking.total - booking.refundAmount,
                                        booking.currency
                                      )
                                    : formatCurrency(booking.total, booking.currency)}
                                </h5>
                                {booking.refundAmount && booking.refundAmount > 0 && (
                                  <small className="text-muted d-block mb-2" style={{ textDecoration: 'line-through' }}>
                                    {formatCurrency(booking.total, booking.currency)}
                                  </small>
                                )}
                                <small className="text-muted d-block mb-2">
                                  {booking.refundAmount && booking.refundAmount > 0 ? (
                                    <>
                                      (Subtotal: {formatCurrency(
                                        booking.subtotal - (booking.refundAmount * booking.subtotal / booking.total),
                                        booking.currency
                                      )} + Tax: {formatCurrency(
                                        booking.tax - (booking.refundAmount * booking.tax / booking.total),
                                        booking.currency
                                      )})
                                    </>
                                  ) : (
                                    <>
                                      (Subtotal: {formatCurrency(booking.subtotal, booking.currency)} + 
                                      Tax: {formatCurrency(booking.tax, booking.currency)})
                                    </>
                                  )}
                                </small>
                                {/* Visual scale for nights */}
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  {Array.from({ length: booking.nights }, (_, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#6c757d',
                                      }}
                                    ></div>
                                  ))}
                                  <small className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>
                                    {booking.nights}n
                                  </small>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="d-flex gap-2">
                              <Link
                                href={`/dashboard/stay-details/?hotelId=${booking.hotelId}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="ri-hotel-line me-1"></i>
                                View Hotel
                              </Link>
                              {(booking.status === 'COMPLETED' || booking.status === 'COMPLETED' || booking.status === 'PENDING') && (
                                <button 
                                  className="btn btn-sm btn-warning"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    handleOpenRefundModal();
                                  }}
                                >
                                  <i className="ri-refund-2-line me-1"></i>
                                  Refund
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleViewDetails(booking)}
                              >
                                <i className="ri-file-text-line me-1"></i>
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-xl-4 col-xxl-3">
              <AuthorSidebar />
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
                      {selectedBooking.status}
                    </span>
                    <span className={`badge ${getPaymentStatusBadge(selectedBooking.paymentStatus || '').class}`}>
                      {getPaymentStatusBadge(selectedBooking.paymentStatus || '').label}
                    </span>
                  </div>
                </div>

                {/* Booking Source */}
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: selectedBooking.bookingSource === 'AGENT' ? '#f3e5f5' : '#e3f2fd' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`${getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').icon} fs-4`}></i>
                    <div>
                      <span className={`badge ${getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').class}`}>
                        {getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').label}
                      </span>
                      {selectedBooking.bookingSource === 'AGENT' && selectedBooking.agentName && (
                        <div className="mt-1">
                          <small className="text-muted">Agent: </small>
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
                      {selectedBooking.refundAmount && selectedBooking.refundAmount > 0 && (
                        <>
                          <hr style={{ borderStyle: 'dashed', borderColor: '#28a745' }} />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-success">
                              <i className="ri-refund-2-line me-1"></i>
                              {selectedBooking.refundAmount >= selectedBooking.total ? 'Full Refund' : 'Partial Refund'}
                            </span>
                            <strong className="text-success">
                              -{formatCurrency(selectedBooking.refundAmount, selectedBooking.currency)}
                            </strong>
                          </div>
                          {selectedBooking.refundAmount < selectedBooking.total && (
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
                      )}
                      
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
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handlePrintConfirmation}
                >
                  <i className="ri-printer-line me-2"></i>
                  Print Confirmation
                </button>
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
    </>
  );
};

export default DashboardBookingsContent;
