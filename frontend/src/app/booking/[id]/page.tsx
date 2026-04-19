"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";

interface BookingDetails {
  id: string;
  referenceNumber: string;
  serviceType: string;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  paymentStatus: string;
  hotel: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    fullAddress: string;
    latitude: number | null;
    longitude: number | null;
    checkInTime: string;
    checkOutTime: string;
    starRating: number;
    manasikScore: number | null;
    images: string[];
  };
  proximity: {
    walkingTimeToHaram: number | null;
    closestGate: {
      nameEnglish: string;
      nameArabic: string;
      gateNumber: number;
      distanceMeters: number;
      walkingTimeMinutes: number;
    } | null;
    kaabaGate: {
      nameEnglish: string;
      nameArabic: string;
      gateNumber: number;
      distanceMeters: number;
      walkingTimeMinutes: number;
    } | null;
  };
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  cancellation: {
    isRefundable: boolean;
    canCancel: boolean;
    cancellationDeadline: string | null;
    cancellationFee: number | null;
    cancellationPolicy: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ booking: BookingDetails }>(
        `/users/me/bookings/${bookingId}`
      );
      setBooking(response.booking);
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(err.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      setCancelling(true);
      await apiClient.post(`/users/me/bookings/${bookingId}/cancel`, {
        reason: cancelReason,
      });
      setShowCancelModal(false);
      fetchBooking(); // Refresh booking data
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      alert(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
      case "REFUNDED":
        return "danger";
      case "COMPLETED":
        return "info";
      default:
        return "secondary";
    }
  };

  const getGoogleMapsUrl = () => {
    if (booking?.hotel.latitude && booking?.hotel.longitude) {
      return `https://www.google.com/maps?q=${booking.hotel.latitude},${booking.hotel.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      booking?.hotel.fullAddress || ""
    )}`;
  };

  // Generate ICS calendar file for adding to calendar
  const generateCalendarFile = () => {
    if (!booking) return;

    const formatICSDate = (dateStr: string, time: string) => {
      const date = new Date(dateStr);
      const [hours, minutes] = time.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0);
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const checkInDateTime = formatICSDate(booking.checkInDate, booking.hotel.checkInTime);
    const checkOutDateTime = formatICSDate(booking.checkOutDate, booking.hotel.checkOutTime);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Manasik//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@manasik.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${checkInDateTime}
DTEND:${checkOutDateTime}
SUMMARY:Hotel Stay at ${booking.hotel.name}
DESCRIPTION:Booking Reference: ${booking.referenceNumber}\\nRoom Type: ${booking.roomType}\\nGuests: ${booking.guests}\\nCheck-in: ${formatTime(booking.hotel.checkInTime)}\\nCheck-out: ${formatTime(booking.hotel.checkOutTime)}
LOCATION:${booking.hotel.fullAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manasik-booking-${booking.referenceNumber}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save booking as image using html2canvas
  const saveAsImage = async () => {
    if (!bookingCardRef.current || !booking) return;
    
    setGeneratingImage(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(bookingCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `manasik-booking-${booking.referenceNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  // Share booking using Web Share API
  const shareBooking = async () => {
    if (!booking) return;
    
    const shareData = {
      title: `Booking at ${booking.hotel.name}`,
      text: `Check out my booking at ${booking.hotel.name} in ${booking.hotel.city}!\n\nCheck-in: ${formatDate(booking.checkInDate)}\nCheck-out: ${formatDate(booking.checkOutDate)}\nReference: ${booking.referenceNumber}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        alert('Booking details copied to clipboard!');
      } catch (error) {
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  // Share property
  const shareProperty = async () => {
    if (!booking) return;
    
    const propertyUrl = `${window.location.origin}/stay-details/${booking.hotel.id}`;
    const shareData = {
      title: booking.hotel.name,
      text: `Check out ${booking.hotel.name} in ${booking.hotel.city} on Manasik!`,
      url: propertyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(propertyUrl);
        alert('Property link copied to clipboard!');
      } catch (error) {
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  // Share app
  const shareApp = async () => {
    const appUrl = window.location.origin;
    const shareData = {
      title: 'Manasik - Hajj & Umrah Accommodation',
      text: 'Book your perfect stay for Hajj and Umrah with Manasik!',
      url: appUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(appUrl);
        alert('App link copied to clipboard!');
      } catch (error) {
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  // Save as PDF (uses browser print)
  const saveAsPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="booking-confirmation-page">
          <div className="container py-5">
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading booking details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div className="booking-confirmation-page">
          <div className="container py-5">
            <div className="text-center py-5">
              <i
                className="ri-error-warning-line"
                style={{ fontSize: "64px", color: "#dc3545" }}
              ></i>
              <h2 className="mt-3">Booking Not Found</h2>
              <p className="text-muted">{error || "Unable to load booking details"}</p>
              <Link href="/dashboard/bookings" className="btn btn-primary mt-3">
                View All Bookings
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <style jsx global>{`
        .booking-confirmation-page {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 40px 0 80px;
        }

        .confirmation-header {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .status-badge.success {
          background: #d1fae5;
          color: #047857;
        }

        .status-badge.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge.info {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .reference-number {
          font-family: monospace;
          font-size: 24px;
          font-weight: 700;
          color: #111;
          letter-spacing: 2px;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .info-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-card h3 i {
          color: #ff621f;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #666;
          font-size: 14px;
        }

        .info-value {
          font-weight: 600;
          color: #111;
          text-align: right;
        }

        .hotel-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .hotel-name {
          font-size: 22px;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
        }

        .hotel-address {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .star-rating {
          color: #fbbf24;
          margin-bottom: 12px;
        }

        .proximity-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ecfdf5;
          border-radius: 8px;
          font-size: 13px;
          color: #047857;
          margin-right: 8px;
          margin-bottom: 8px;
        }

        .map-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #f0f0f0;
          border-radius: 8px;
          color: #333;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .map-link:hover {
          background: #e0e0e0;
          color: #111;
        }

        .cancellation-info {
          padding: 16px;
          border-radius: 12px;
          margin-top: 16px;
        }

        .cancellation-info.refundable {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .cancellation-info.non-refundable {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .cancel-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 24px;
          background: white;
          border: 2px solid #dc3545;
          color: #dc3545;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #dc3545;
          color: white;
        }

        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #f0f0f0;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .print-btn:hover {
          background: #e0e0e0;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .booking-confirmation-page {
            background: white;
            padding: 0;
          }
        }

        .action-buttons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .action-btn:hover {
          background: #e9ecef;
          color: #212529;
          border-color: #dee2e6;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-btn i {
          font-size: 16px;
        }

        .action-btn.primary {
          background: #ff621f;
          border-color: #ff621f;
          color: white;
        }

        .action-btn.primary:hover {
          background: #e55a1c;
          border-color: #e55a1c;
          color: white;
        }

        .action-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e9ecef;
        }

        .action-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .invoice-modal {
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #111;
        }

        .invoice-logo {
          font-size: 28px;
          font-weight: 800;
          color: #ff621f;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .invoice-title p {
          color: #666;
          margin: 4px 0 0;
        }

        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }

        .invoice-section h4 {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .invoice-section p {
          margin: 4px 0;
          font-size: 14px;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .invoice-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #666;
          border-bottom: 2px solid #dee2e6;
        }

        .invoice-table td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .invoice-table .text-right {
          text-align: right;
        }

        .invoice-totals {
          margin-left: auto;
          width: 250px;
        }

        .invoice-totals .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .invoice-totals .total-row {
          border-top: 2px solid #111;
          font-weight: 700;
          font-size: 18px;
          padding-top: 12px;
          margin-top: 8px;
        }

        .invoice-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #666;
          font-size: 13px;
        }
      `}</style>

      <div className="booking-confirmation-page">
        <div className="container" ref={bookingCardRef}>
          {/* Header Section */}
          <div className="confirmation-header">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    <i className="ri-checkbox-circle-fill"></i>
                    Booking {booking.status}
                  </span>
                  {booking.paymentStatus === "PAID" && (
                    <span className="status-badge success">
                      <i className="ri-bank-card-fill"></i>
                      Payment Confirmed
                    </span>
                  )}
                </div>
                <p className="text-muted mb-2">Booking Reference</p>
                <div className="reference-number">{booking.referenceNumber}</div>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0 no-print">
                <button className="print-btn" onClick={() => window.print()}>
                  <i className="ri-printer-line"></i>
                  Print Confirmation
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Left Column - Booking Details */}
            <div className="col-lg-8">
              {/* Booking Summary */}
              <div className="info-card">
                <h3>
                  <i className="ri-calendar-check-line"></i>
                  Booking Details
                </h3>
                <div className="info-row">
                  <span className="info-label">Hotel Name</span>
                  <span className="info-value">{booking.hotel.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">City</span>
                  <span className="info-value">{booking.hotel.city}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Check-in Date</span>
                  <span className="info-value">{formatDate(booking.checkInDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Check-out Date</span>
                  <span className="info-value">{formatDate(booking.checkOutDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Number of Nights</span>
                  <span className="info-value">{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Number of Guests</span>
                  <span className="info-value">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Room Type</span>
                  <span className="info-value">{booking.roomType}</span>
                </div>
              </div>

              {/* Hotel Information */}
              <div className="info-card">
                <h3>
                  <i className="ri-hotel-line"></i>
                  Hotel Information
                </h3>
                
                {booking.hotel.images && booking.hotel.images.length > 0 && (
                  <Image
                    src={booking.hotel.images[0]}
                    alt={booking.hotel.name}
                    width={800}
                    height={200}
                    className="hotel-image"
                  />
                )}

                <h4 className="hotel-name">{booking.hotel.name}</h4>
                
                <div className="star-rating">
                  {Array.from({ length: booking.hotel.starRating }, (_, i) => (
                    <i key={i} className="ri-star-fill"></i>
                  ))}
                </div>

                <p className="hotel-address">
                  <i className="ri-map-pin-line me-2"></i>
                  {booking.hotel.fullAddress}
                </p>

                {/* Proximity Info */}
                <div className="mb-3">
                  {booking.proximity.walkingTimeToHaram && (
                    <span className="proximity-badge">
                      <i className="ri-walk-line"></i>
                      {booking.proximity.walkingTimeToHaram} min walk to Haram
                    </span>
                  )}
                  {booking.proximity.closestGate && (
                    <span className="proximity-badge">
                      <i className="ri-door-open-line"></i>
                      Nearest: {booking.proximity.closestGate.nameEnglish} (Gate {booking.proximity.closestGate.gateNumber})
                    </span>
                  )}
                  {booking.hotel.manasikScore && (
                    <span className="proximity-badge">
                      <i className="ri-award-line"></i>
                      Manasik Score: {booking.hotel.manasikScore.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="row mt-4">
                  <div className="col-6">
                    <div className="info-label">Check-in Time</div>
                    <div className="info-value">{formatTime(booking.hotel.checkInTime)}</div>
                  </div>
                  <div className="col-6">
                    <div className="info-label">Check-out Time</div>
                    <div className="info-value">{formatTime(booking.hotel.checkOutTime)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    <i className="ri-map-2-line"></i>
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="info-card">
                <h3>
                  <i className="ri-shield-check-line"></i>
                  Cancellation Policy
                </h3>
                
                <div className={`cancellation-info ${booking.cancellation.isRefundable ? 'refundable' : 'non-refundable'}`}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={`ri-${booking.cancellation.isRefundable ? 'checkbox-circle' : 'close-circle'}-fill`}></i>
                    <strong>
                      {booking.cancellation.isRefundable ? 'Refundable' : 'Non-Refundable'}
                    </strong>
                  </div>
                  <p className="mb-0" style={{ fontSize: '14px' }}>
                    {booking.cancellation.cancellationPolicy}
                  </p>
                </div>

                {booking.cancellation.cancellationDeadline && (
                  <div className="info-row">
                    <span className="info-label">Free Cancellation Until</span>
                    <span className="info-value">
                      {formatDate(booking.cancellation.cancellationDeadline)}
                    </span>
                  </div>
                )}

                {booking.cancellation.cancellationFee && (
                  <div className="info-row">
                    <span className="info-label">Cancellation Fee</span>
                    <span className="info-value text-danger">
                      {booking.currency} {booking.cancellation.cancellationFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {booking.cancellation.canCancel && (
                  <button
                    className="cancel-btn mt-4 no-print"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <i className="ri-close-circle-line"></i>
                    Request Cancellation
                  </button>
                )}

                {booking.status === 'CANCELLED' && (
                  <div className="alert alert-danger mt-3 mb-0">
                    <i className="ri-information-line me-2"></i>
                    This booking has been cancelled.
                    {booking.refundAmount && (
                      <span> Refund amount: {booking.currency} {booking.refundAmount.toFixed(2)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="col-lg-4">
              <div className="info-card" style={{ position: 'sticky', top: '20px' }}>
                <h3>
                  <i className="ri-bank-card-line"></i>
                  Payment Summary
                </h3>
                
                <div className="info-row">
                  <span className="info-label">Room ({booking.nights} night{booking.nights !== 1 ? 's' : ''})</span>
                  <span className="info-value">{booking.currency} {booking.subtotal.toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Taxes & Fees</span>
                  <span className="info-value">{booking.currency} {booking.tax.toFixed(2)}</span>
                </div>
                <div className="info-row" style={{ borderTop: '2px solid #111', paddingTop: '16px', marginTop: '8px' }}>
                  <span className="info-label" style={{ fontWeight: '700', color: '#111' }}>Total Paid</span>
                  <span className="info-value" style={{ fontSize: '20px', color: '#ff621f' }}>
                    {booking.currency} {booking.total.toFixed(2)}
                  </span>
                </div>

                {booking.refundAmount && (
                  <div className="info-row">
                    <span className="info-label text-success">Refunded</span>
                    <span className="info-value text-success">
                      {booking.currency} {booking.refundAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="mt-4 no-print">
                  <Link href="/dashboard/bookings" className="btn btn-outline-secondary w-100 mb-2">
                    <i className="ri-arrow-left-line me-2"></i>
                    Back to My Bookings
                  </Link>
                  <Link href={`/stay-details/${booking.hotel.id}`} className="btn btn-outline-primary w-100">
                    <i className="ri-hotel-line me-2"></i>
                    View Hotel Details
                  </Link>
                </div>

                {/* Action Buttons Section */}
                <div className="action-section no-print">
                  <div className="action-section-title">Quick Actions</div>
                  <div className="action-buttons-grid">
                    <button className="action-btn" onClick={() => setShowInvoiceModal(true)}>
                      <i className="ri-file-text-line"></i>
                      Request Invoice
                    </button>
                    <button className="action-btn" onClick={saveAsPDF}>
                      <i className="ri-file-pdf-line"></i>
                      Save as PDF
                    </button>
                    <button className="action-btn" onClick={generateCalendarFile}>
                      <i className="ri-calendar-event-line"></i>
                      Add to Calendar
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={saveAsImage}
                      disabled={generatingImage}
                    >
                      <i className="ri-image-line"></i>
                      {generatingImage ? 'Generating...' : 'Save as Image'}
                    </button>
                  </div>
                </div>

                {/* Share Section */}
                <div className="action-section no-print">
                  <div className="action-section-title">Share</div>
                  <div className="action-buttons-grid">
                    <button className="action-btn primary" onClick={shareBooking}>
                      <i className="ri-share-line"></i>
                      Share Booking
                    </button>
                    <button className="action-btn" onClick={shareProperty}>
                      <i className="ri-building-line"></i>
                      Share Property
                    </button>
                    <button className="action-btn" onClick={shareApp} style={{ gridColumn: 'span 2' }}>
                      <i className="ri-apps-line"></i>
                      Share Manasik App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="modal-title">Request Cancellation</h4>
            <p className="text-muted">
              Are you sure you want to cancel this booking?
              {booking.cancellation.cancellationFee && (
                <span className="text-danger d-block mt-2">
                  A cancellation fee of {booking.currency} {booking.cancellation.cancellationFee.toFixed(2)} will apply.
                </span>
              )}
            </p>
            <div className="mb-3">
              <label className="form-label">Reason for cancellation (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary flex-fill"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                className="btn btn-danger flex-fill"
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header">
              <div className="invoice-logo">Manasik</div>
              <div className="invoice-title">
                <h2>INVOICE</h2>
                <p>#{booking.referenceNumber}</p>
              </div>
            </div>

            <div className="invoice-details">
              <div className="invoice-section">
                <h4>Bill To</h4>
                <p><strong>{booking.guestName || 'Guest'}</strong></p>
                <p>{booking.guestEmail}</p>
                {booking.guestPhone && <p>{booking.guestPhone}</p>}
              </div>
              <div className="invoice-section" style={{ textAlign: 'right' }}>
                <h4>Invoice Details</h4>
                <p><strong>Date:</strong> {formatDate(booking.createdAt)}</p>
                <p><strong>Status:</strong> {booking.paymentStatus}</p>
                <p><strong>Booking Ref:</strong> {booking.referenceNumber}</p>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{booking.hotel.name}</strong>
                    <br />
                    <span style={{ color: '#666', fontSize: '13px' }}>
                      {booking.roomType} • {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                    </span>
                  </td>
                  <td>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</td>
                  <td className="text-right">{booking.currency} {booking.subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-totals">
              <div className="row">
                <span>Subtotal</span>
                <span>{booking.currency} {booking.subtotal.toFixed(2)}</span>
              </div>
              <div className="row">
                <span>Taxes & Fees</span>
                <span>{booking.currency} {booking.tax.toFixed(2)}</span>
              </div>
              <div className="row total-row">
                <span>Total</span>
                <span>{booking.currency} {booking.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="invoice-footer">
              <p><strong>Thank you for booking with Manasik!</strong></p>
              <p>For questions about this invoice, please contact support@manasik.com</p>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-outline-secondary flex-fill"
                onClick={() => setShowInvoiceModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary flex-fill"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setTimeout(() => window.print(), 100);
                }}
              >
                <i className="ri-printer-line me-2"></i>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
