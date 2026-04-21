"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

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
  hotelId: string;
  hotelName: string;
  hotelImage?: string;
  hotelAddress?: string;
  hotelCity?: string;
  hotelCountry?: string;
  hotelFullAddress?: string;
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
  guestName?: string;
  guestEmail?: string;
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
  guestDetails?: Array<{
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
  createdAt: string;
}

const MyBookingsContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editFormData, setEditFormData] = useState({
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });
  const [editingGuests, setEditingGuests] = useState<any[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { limit: 100 };
      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = (await apiClient.get("/users/me/bookings", {
        params,
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
        hotelId: b.metadata?.hotelId || b.hotelId || "",
        hotelName: b.hotelName || b.metadata?.hotelName || "Unknown Hotel",
        hotelImage: b.hotelImage || b.metadata?.hotelImage || null,
        hotelAddress: b.hotelAddress || b.metadata?.hotelAddress || "",
        hotelCity: b.hotelCity || b.metadata?.hotelCity || "",
        hotelCountry: b.hotelCountry || b.metadata?.hotelCountry || "",
        hotelFullAddress: b.hotelFullAddress || b.metadata?.hotelFullAddress || "",
        checkInTime: b.checkInTime || "14:00",
        checkOutTime: b.checkOutTime || "11:00",
        starRating: b.starRating,
        closestGate: b.closestGate || null,
        kaabaGate: b.kaabaGate || null,
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || "",
        roomName: b.roomType || b.metadata?.roomType || "Room",
        checkIn: b.checkInDate || b.metadata?.checkInDate || "",
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || "",
        nights: b.nights || b.metadata?.nights || 1,
        guestName: b.metadata?.guestName || "",
        guestEmail: b.metadata?.guestEmail || "",
        guestPhone: b.metadata?.guestPhone || "",
        guestCount: b.guests || b.metadata?.guests || 1,
        guests: b.guestDetails || [],
        guestDetails: b.guestDetails || [],
        createdAt: b.createdAt,
      }));

      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const calculateAge = (dateOfBirth: string | undefined): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-success";
      case "PENDING":
        return "bg-warning text-dark";
      case "CANCELLED":
        return "bg-danger";
      case "COMPLETED":
        return "bg-info";
      case "REFUNDED":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "ri-check-line";
      case "PENDING":
        return "ri-time-line";
      case "CANCELLED":
        return "ri-close-line";
      case "COMPLETED":
        return "ri-checkbox-circle-line";
      case "REFUNDED":
        return "ri-refund-line";
      default:
        return "ri-question-line";
    }
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestName: booking.guestName || "",
      guestEmail: booking.guestEmail || "",
      guestPhone: booking.guestPhone || "",
    });
    const guestsToEdit = booking.guestDetails && booking.guestDetails.length > 0 
      ? booking.guestDetails 
      : [];
    console.log("Opening edit modal with guests:", guestsToEdit);
    setEditingGuests(guestsToEdit);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedBooking(null);
    setEditFormData({
      checkIn: "",
      checkOut: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
    });
    setEditingGuests([]);
    setSelectedTransfer(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedBooking) return;

    setSavingEdit(true);
    try {
      // For now, we'll just update the local state
      // In a real app, you'd send this to the backend
      const updatedBooking: Booking = {
        ...selectedBooking,
        checkIn: editFormData.checkIn,
        checkOut: editFormData.checkOut,
        guestName: editFormData.guestName,
        guestEmail: editFormData.guestEmail,
        guestPhone: editFormData.guestPhone,
        guestDetails: editingGuests,
      };

      setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      closeEditModal();
    } catch (err: any) {
      console.error("Error saving booking:", err);
      alert("Failed to save booking changes");
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePrintConfirmation = (booking: Booking, transfer: string | null = null) => {
    const hotelAddress = booking.hotelFullAddress || 
      [booking.hotelAddress, booking.hotelCity, booking.hotelCountry]
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
    const starRating = booking.starRating 
      ? '⭐'.repeat(booking.starRating) 
      : '';

    // Gate information sections
    const closestGateHtml = booking.closestGate ? `
      <div class="info-box gate-box">
        <h4>🚶 Closest Haram Gate</h4>
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">
          Gate ${booking.closestGate.gateNumber} - ${booking.closestGate.name}
        </p>
        <p style="color: #666; margin: 0;">
          ${booking.closestGate.distance}m • ${booking.closestGate.walkingTime} min walk
        </p>
      </div>
    ` : '';

    const kaabaGateHtml = booking.kaabaGate ? `
      <div class="info-box gate-box kaaba">
        <h4>🕋 Kaaba Gate Access</h4>
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">
          Gate ${booking.kaabaGate.gateNumber} - ${booking.kaabaGate.name}
        </p>
        <p style="color: #666; margin: 0;">
          ${booking.kaabaGate.distance}m • ${booking.kaabaGate.walkingTime} min walk
        </p>
      </div>
    ` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmation - ${booking.id}</title>
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
          .guest-highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            text-align: center;
          }
          .guest-highlight h2 {
            margin: 0 0 8px 0;
            font-size: 24px;
          }
          .guest-highlight p {
            margin: 0;
            opacity: 0.9;
          }
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
            <span class="booking-id">${booking.id}</span>
            <span class="status-badge status-${booking.status}">${booking.status}</span>
          </div>
        </div>

        <!-- 2. ACCOMMODATION SECTION -->
        <div class="accommodation-section">
          <h3>🏨 Accommodation</h3>
          <div class="hotel-name">${booking.hotelName}</div>
          ${starRating ? `<div class="star-rating">${starRating}</div>` : ''}
          <div class="room-name">${booking.roomName}</div>
          <div class="address">
            <span>📍</span>
            <span>${hotelAddress}</span>
          </div>
          <div class="times">
            <span>🔑 Check-in: <strong>${formatTime(booking.checkInTime || '14:00')}</strong></span>
            <span>🚪 Check-out: <strong>${formatTime(booking.checkOutTime || '11:00')}</strong></span>
          </div>
        </div>

        <!-- 3. GUEST INFORMATION SECTION -->
        <div class="section">
          <h3>👤 Guest Information</h3>
          ${booking.guestDetails && booking.guestDetails.length > 0 ? `
            <div style="display: grid; gap: 16px;">
              ${booking.guestDetails.map((guest: any, idx: number) => `
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
                <p class="value">${booking.guestName || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h4>Email</h4>
                <p>${booking.guestEmail || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h4>Phone</h4>
                <p>${booking.guestPhone || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h4>Guest Count</h4>
                <p class="value">${booking.guestCount} ${booking.guestCount === 1 ? 'guest' : 'guests'}</p>
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
              <p class="value">${formatDate(booking.checkIn)}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">From ${formatTime(booking.checkInTime || '14:00')}</p>
            </div>
            <div class="info-box">
              <h4>Check-out Date</h4>
              <p class="value">${formatDate(booking.checkOut)}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">By ${formatTime(booking.checkOutTime || '11:00')}</p>
            </div>
            <div class="info-box">
              <h4>Duration</h4>
              <p class="value">${booking.nights}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">${booking.nights === 1 ? 'night' : 'nights'}</p>
            </div>
            <div class="info-box">
              <h4>Booking Date</h4>
              <p style="font-size: 13px;">${new Date(booking.createdAt).toLocaleDateString()}</p>
              <p style="color: #666; font-size: 12px; margin-top: 4px;">${new Date(booking.createdAt).toLocaleTimeString()}</p>
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
              <span>${formatCurrency(booking.subtotal, booking.currency)}</span>
            </div>
            <div class="payment-row">
              <span>Tax</span>
              <span>${formatCurrency(booking.tax, booking.currency)}</span>
            </div>
            <div class="payment-row total">
              <span>Total</span>
              <span style="color: ${booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? '#dc3545' : '#0d6efd'}; ${booking.refundAmount && booking.refundAmount >= booking.total ? 'text-decoration: line-through;' : ''}">
                ${formatCurrency(booking.total, booking.currency)}
              </span>
            </div>
            ${booking.refundAmount && booking.refundAmount > 0 ? `
            <div class="refund-section">
              <div class="refund-row">
                <span>💰 ${booking.refundAmount >= booking.total ? 'Full Refund' : 'Partial Refund'}</span>
                <span>-${formatCurrency(booking.refundAmount, booking.currency)}</span>
              </div>
              ${booking.refundAmount < booking.total ? `
              <div class="payment-row" style="margin-top: 8px; color: #0d6efd; font-weight: bold;">
                <span>Net Amount Paid</span>
                <span>${formatCurrency(booking.total - booking.refundAmount, booking.currency)}</span>
              </div>
              ` : ''}
              ${booking.refundReason ? `
              <div style="margin-top: 8px; padding: 8px; background: #d4edda; border-radius: 4px; font-size: 12px;">
                <strong>Refund Reason:</strong> ${booking.refundReason}
              </div>
              ` : ''}
              ${booking.refundedAt ? `
              <div style="margin-top: 4px; font-size: 11px; color: #666;">
                Refunded on: ${new Date(booking.refundedAt).toLocaleDateString()}
              </div>
              ` : ''}
            </div>
            ` : ''}
            ${booking.status === 'CANCELLED' && !booking.refundAmount ? `
            <div style="margin-top: 16px; padding: 12px; background: #f8d7da; border-radius: 4px; text-align: center;">
              <span style="color: #721c24; font-weight: bold;">⚠️ Booking Cancelled</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- 7. TRANSFER OPTIONS SECTION (if selected) -->
        ${transfer ? `
        <div class="section">
          <h3>🚗 Transfer Service</h3>
          <div class="info-box">
            <h4>Selected Transfer Option</h4>
            <p class="value">${
              transfer === 'airport' ? 'Airport Transfer - $45' :
              transfer === 'shuttle' ? 'Hotel Shuttle - $25' :
              transfer === 'private' ? 'Private Car Service - $75' :
              'Arrange Later - TBD'
            }</p>
            <p style="color: #666; font-size: 12px; margin-top: 8px;">
              <i class="ri-information-line"></i> Transfer service is currently coming soon. You will be able to confirm details closer to your arrival date.
            </p>
          </div>
        </div>
        ` : ''}

        <!-- 8. IMPORTANT INFORMATION SECTION -->
        <div class="important-info">
          <h4>📋 Important Information</h4>
          <ul>
            <li>Please present this confirmation and a valid ID at check-in</li>
            <li>Early check-in and late check-out are subject to availability</li>
            <li>Contact the hotel directly for special requests</li>
            ${booking.closestGate ? `<li>The closest Haram gate is Gate ${booking.closestGate.gateNumber} (${booking.closestGate.walkingTime} min walk)</li>` : ''}
          </ul>
        </div>

        <!-- 8. FOOTER -->
        <div class="footer">
          <p>Booking completed on: ${new Date(booking.createdAt).toLocaleString()}</p>
          <p>Thank you for your booking! We look forward to hosting you.</p>
          <p style="margin-top: 12px; font-size: 10px; color: #999;">Booking Reference: ${booking.id}</p>
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

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i
              className="ri-lock-line"
              style={{ fontSize: "4rem", color: "#6c757d" }}
            ></i>
            <h2 className="mt-3">Sign in to view your bookings</h2>
            <p className="text-muted">
              You need to be logged in to see your booking history.
            </p>
            <Link href="/auth" className="btn btn-primary mt-3">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-2">My Bookings</h1>
          <p className="text-muted">
            View and manage all your hotel reservations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <select
              className="form-select"
              style={{ maxWidth: "200px" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Bookings</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            {filterStatus && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setFilterStatus("")}
              >
                <i className="ri-close-line me-1"></i>
                Clear Filter
              </button>
            )}
            <button
              className="btn btn-outline-primary btn-sm ms-auto"
              onClick={fetchBookings}
            >
              <i className="ri-refresh-line me-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="ri-error-warning-line me-2"></i>
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchBookings}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-5">
          <i
            className="ri-calendar-line"
            style={{ fontSize: "4rem", color: "#6c757d" }}
          ></i>
          <h3 className="mt-3">No bookings yet</h3>
          <p className="text-muted">
            {filterStatus
              ? `No ${filterStatus.toLowerCase()} bookings found.`
              : "You haven't made any bookings yet. Start exploring hotels!"}
          </p>
          <Link href="/stay" className="btn btn-primary mt-2">
            <i className="ri-search-line me-2"></i>
            Browse Hotels
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="row">
          {bookings.map((booking) => (
            <div key={booking.id} className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="row g-0">
                  {/* Hotel Image */}
                  <div className="col-md-3">
                    <div
                      style={{
                        position: "relative",
                        height: "100%",
                        minHeight: "200px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      {booking.hotelImage ? (
                        <Image
                          src={booking.hotelImage}
                          alt={booking.hotelName}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-start"
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center h-100"
                          style={{ backgroundColor: "#e9ecef" }}
                        >
                          <i
                            className="ri-hotel-line"
                            style={{ fontSize: "3rem", color: "#adb5bd" }}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="col-md-9">
                    <div className="card-body">
                      {/* Header: Hotel name and status */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title mb-1">
                            {booking.hotelName}
                          </h5>
                          <p className="text-muted mb-0 small">
                            {booking.roomName}
                          </p>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <span
                            className={`badge ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            <i
                              className={`${getStatusIcon(booking.status)} me-1`}
                            ></i>
                            {booking.status}
                          </span>
                          {booking.status === "REFUNDED" && booking.refundAmount && (
                            <span
                              className={`badge ${
                                booking.refundAmount >= booking.total
                                  ? "bg-success"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              <i className={`${booking.refundAmount >= booking.total ? "ri-checkbox-circle-line" : "ri-pie-chart-line"} me-1`}></i>
                              {booking.refundAmount >= booking.total
                                ? "Full Refund"
                                : `Partial (${formatCurrency(booking.refundAmount, booking.currency)})`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dates and Details */}
                      <div className="row mt-3">
                        <div className="col-sm-4">
                          <small className="text-muted d-block">Check-in</small>
                          <span>{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="col-sm-4">
                          <small className="text-muted d-block">
                            Check-out
                          </small>
                          <span>{formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="col-sm-4">
                          <small className="text-muted d-block">Duration</small>
                          <span>
                            {booking.nights} night{booking.nights !== 1 && "s"}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Guests, Price, Actions */}
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <div className="d-flex gap-3">
                          <span className="text-muted small">
                            <i className="ri-user-line me-1"></i>
                            {booking.guestCount} guest
                            {booking.guestCount !== 1 && "s"}
                          </span>
                          <span className="text-muted small">
                            <i className="ri-calendar-check-line me-1"></i>
                            Booked {formatDate(booking.createdAt)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">
                            {booking.refundAmount && booking.refundAmount > 0
                              ? formatCurrency(
                                  booking.total - booking.refundAmount,
                                  booking.currency
                                )
                              : formatCurrency(booking.total, booking.currency)}
                          </span>
                          {booking.refundAmount && booking.refundAmount > 0 && (
                            <span
                              className="text-muted"
                              style={{
                                fontSize: "0.85rem",
                                textDecoration: "line-through",
                              }}
                            >
                              {formatCurrency(booking.total, booking.currency)}
                            </span>
                          )}
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePrintConfirmation(booking)}
                          >
                            <i className="ri-file-text-line me-1"></i>
                            Confirmation Details
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEditModal(booking)}
                          >
                            <i className="ri-edit-line me-1"></i>
                            Edit
                          </button>
                          <Link
                            href={`/stay-details/${booking.hotelId}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View Hotel
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && bookings.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <h4 className="mb-0">{bookings.length}</h4>
                    <small className="text-muted">Total Bookings</small>
                  </div>
                  <div className="col-md-3">
                    <h4 className="mb-0 text-success">
                      {bookings.filter((b) => b.status === "COMPLETED").length}
                    </h4>
                    <small className="text-muted">Completed</small>
                  </div>
                  <div className="col-md-3">
                    <h4 className="mb-0 text-warning">
                      {bookings.filter((b) => b.status === "PENDING").length}
                    </h4>
                    <small className="text-muted">Pending</small>
                  </div>
                  <div className="col-md-3">
                    <h4 className="mb-0 text-info">
                      {bookings.filter((b) => b.status === "COMPLETED").length}
                    </h4>
                    <small className="text-muted">Completed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          role="dialog"
        >
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ri-edit-line me-2"></i>
                  Edit Booking
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                ></button>
              </div>

              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div className="row">
                  {/* Left Column: Edit Form */}
                  <div className="col-lg-7 pe-4">
                    {/* Dates Section */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Check-in Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editFormData.checkIn}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              checkIn: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Check-out Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editFormData.checkOut}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              checkOut: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Detailed Guests Section */}
                    {editingGuests && editingGuests.length > 0 ? (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="mb-3">
                            <i className="ri-group-line me-2"></i>
                            Guest Details ({editingGuests.length})
                          </h6>
                      {editingGuests.map((guest, idx) => {
                        const age = calculateAge(guest.dateOfBirth);
                        return (
                          <div key={idx} className="card mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                  <h6 className="mb-0">
                                    {guest.firstName} {guest.lastName}
                                    {age !== null && (
                                      <span className="badge bg-info ms-2">
                                        {age} years old
                                      </span>
                                    )}
                                  </h6>
                                  {guest.isLeadPassenger && (
                                    <span className="badge bg-primary">
                                      LEAD
                                    </span>
                                  )}
                                </div>
                                <div className="d-flex gap-2 align-items-center">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`lead-passenger-${idx}`}
                                      checked={guest.isLeadPassenger || false}
                                      onChange={(e) => {
                                        const updated = editingGuests.map((g, i) => ({
                                          ...g,
                                          isLeadPassenger: i === idx ? e.target.checked : false,
                                        }));
                                        setEditingGuests(updated);
                                      }}
                                    />
                                    <label className="form-check-label" htmlFor={`lead-passenger-${idx}`}>
                                      Lead
                                    </label>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      setEditingGuests(
                                        editingGuests.filter((_, i) => i !== idx)
                                      );
                                    }}
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">First Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={guest.firstName}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].firstName = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Last Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={guest.lastName}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].lastName = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Email</label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    value={guest.email}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].email = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Phone</label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    value={guest.phone || ""}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].phone = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Nationality</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={guest.nationality || ""}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].nationality = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Passport Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={guest.passportNumber || ""}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].passportNumber = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Date of Birth</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={guest.dateOfBirth ? guest.dateOfBirth.split('T')[0] : ""}
                                    onChange={(e) => {
                                      const updated = [...editingGuests];
                                      updated[idx].dateOfBirth = e.target.value;
                                      setEditingGuests(updated);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="alert alert-info" role="alert">
                        <i className="ri-information-line me-2"></i>
                        <strong>No guest details available</strong>
                        <p className="mb-0 mt-2">Guest information will be displayed here once added during checkout.</p>
                      </div>
                    </div>
                  </div>
                )}

                    {/* Transfer Options Section */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="mb-3">
                          <i className="ri-car-line me-2"></i>
                          Transfer Options
                          <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.7rem' }}>Coming Soon</span>
                        </h6>
                        <div className="card bg-light">
                          <div className="card-body">
                            <div className="d-flex flex-column gap-3">
                              {[
                                { id: 'airport', label: 'Airport Transfer', price: '$45', icon: 'ri-taxi-line' },
                                { id: 'shuttle', label: 'Hotel Shuttle', price: '$25', icon: 'ri-bus-line' },
                                { id: 'private', label: 'Private Car Service', price: '$75', icon: 'ri-map-pin-line' },
                                { id: 'later', label: 'Arrange Later', price: 'TBD', icon: 'ri-map-line' },
                              ].map((option) => (
                                <div key={option.id} className="form-check d-flex align-items-center p-2 border rounded" style={{ backgroundColor: selectedTransfer === option.id ? '#e7f1ff' : 'transparent' }}>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="transfer-option"
                                    id={`transfer-${option.id}`}
                                    value={option.id}
                                    checked={selectedTransfer === option.id}
                                    onChange={(e) => setSelectedTransfer(e.target.value)}
                                    disabled
                                  />
                                  <label className="form-check-label flex-grow-1 ms-2 mb-0" htmlFor={`transfer-${option.id}`} style={{ cursor: 'not-allowed' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <i className={`${option.icon} me-2`}></i>
                                        <strong>{option.label}</strong>
                                      </div>
                                      <span className="text-muted small">{option.price}</span>
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                            {selectedTransfer && (
                              <div className="alert alert-info mt-3 mb-0">
                                <small>
                                  <i className="ri-information-line me-2"></i>
                                  Selected: <strong>{['Airport Transfer', 'Hotel Shuttle', 'Private Car Service', 'Arrange Later'][['airport', 'shuttle', 'private', 'later'].indexOf(selectedTransfer)]}</strong>
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hotel Information */}
                  <div className="col-lg-5 ps-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title mb-3">
                          <i className="ri-hotel-line me-2"></i>
                          Hotel Information
                        </h6>

                        {/* Hotel Name */}
                        <div className="mb-3">
                          <small className="text-muted d-block">Hotel Name</small>
                          <p className="mb-0 fw-bold">{selectedBooking.hotelName}</p>
                        </div>

                        {/* Star Rating */}
                        {selectedBooking.starRating && (
                          <div className="mb-3">
                            <small className="text-muted d-block">Rating</small>
                            <p className="mb-0">{'⭐'.repeat(selectedBooking.starRating)}</p>
                          </div>
                        )}

                        {/* Room Type */}
                        <div className="mb-3">
                          <small className="text-muted d-block">Room Type</small>
                          <p className="mb-0">{selectedBooking.roomName}</p>
                        </div>

                        {/* Address */}
                        <div className="mb-3">
                          <small className="text-muted d-block">Address</small>
                          <p className="mb-0 small">{selectedBooking.hotelFullAddress || selectedBooking.hotelAddress}</p>
                        </div>

                        {/* Check-in/Check-out Times */}
                        <div className="mb-3">
                          <small className="text-muted d-block">Check-in Time</small>
                          <p className="mb-0">{selectedBooking.checkInTime}</p>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted d-block">Check-out Time</small>
                          <p className="mb-0">{selectedBooking.checkOutTime}</p>
                        </div>

                        {/* Closest Gate */}
                        {selectedBooking.closestGate && (
                          <div className="mb-3 p-2 bg-white rounded">
                            <small className="text-muted d-block">🚶 Closest Haram Gate</small>
                            <p className="mb-0 small">
                              <strong>Gate {selectedBooking.closestGate.gateNumber}</strong> - {selectedBooking.closestGate.name}
                            </p>
                            <p className="mb-0 small text-muted">
                              {selectedBooking.closestGate.distance}m • {selectedBooking.closestGate.walkingTime} min walk
                            </p>
                          </div>
                        )}

                        {/* Kaaba Gate */}
                        {selectedBooking.kaabaGate && (
                          <div className="mb-3 p-2 bg-white rounded">
                            <small className="text-muted d-block">🕋 Kaaba Gate Access</small>
                            <p className="mb-0 small">
                              <strong>Gate {selectedBooking.kaabaGate.gateNumber}</strong> - {selectedBooking.kaabaGate.name}
                            </p>
                            <p className="mb-0 small text-muted">
                              {selectedBooking.kaabaGate.distance}m • {selectedBooking.kaabaGate.walkingTime} min walk
                            </p>
                          </div>
                        )}

                        {/* Booking Summary */}
                        <hr />
                        <div className="mb-2">
                          <small className="text-muted d-block">Subtotal</small>
                          <p className="mb-0">{formatCurrency(selectedBooking.subtotal, selectedBooking.currency)}</p>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted d-block">Tax</small>
                          <p className="mb-0">{formatCurrency(selectedBooking.tax, selectedBooking.currency)}</p>
                        </div>
                        <div className="mb-3 p-2 bg-primary bg-opacity-10 rounded">
                          <small className="text-muted d-block">Total</small>
                          <p className="mb-0 fw-bold text-primary">
                            {selectedBooking.refundAmount && selectedBooking.refundAmount > 0
                              ? formatCurrency(
                                  selectedBooking.total - selectedBooking.refundAmount,
                                  selectedBooking.currency
                                )
                              : formatCurrency(selectedBooking.total, selectedBooking.currency)}
                          </p>
                          {selectedBooking.refundAmount && selectedBooking.refundAmount > 0 && (
                            <small className="text-muted" style={{ textDecoration: 'line-through' }}>
                              {formatCurrency(selectedBooking.total, selectedBooking.currency)}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => handlePrintConfirmation(selectedBooking, selectedTransfer)}
                >
                  <i className="ri-file-text-line me-2"></i>
                  Print Confirmation
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsContent;
