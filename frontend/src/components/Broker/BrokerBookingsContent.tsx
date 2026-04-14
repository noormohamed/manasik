"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import BrokerBookingWizard from "./BrokerBookingWizard";
import PaymentConfirmationModal from "./PaymentConfirmationModal";

interface Booking {
  id: string;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus?: string;
  bookingSource?: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCount: number;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BrokerBookingsContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchCustomer, setSearchCustomer] = useState<string>("");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [resendingPayment, setResendingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { limit: 100 };
      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = (await apiClient.get("/users/me/broker-bookings", {
        params,
      })) as { bookings?: any[] };

      let fetchedBookings = (response.bookings || []).map((b: any) => ({
        id: b.id,
        status: b.status,
        currency: b.currency,
        subtotal: b.subtotal,
        tax: b.tax,
        total: b.total,
        paymentStatus: b.paymentStatus,
        bookingSource: b.bookingSource || "AGENT",
        hotelId: b.metadata?.hotelId || b.hotelId || "",
        hotelName: b.hotelName || b.metadata?.hotelName || "Unknown Hotel",
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || "",
        roomName: b.roomType || b.metadata?.roomType || "Room",
        checkIn: b.checkInDate || b.metadata?.checkInDate || "",
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || "",
        nights: b.nights || b.metadata?.nights || 1,
        guestName: b.guestName || b.metadata?.guestName || "",
        guestEmail: b.guestEmail || b.metadata?.guestEmail || "",
        guestPhone: b.guestPhone || b.metadata?.guestPhone || "",
        guestCount: b.guests || b.metadata?.guests || 1,
        customerId: b.customerId,
        customerName: b.customerName || "",
        customerEmail: b.customerEmail || "",
        holdExpiresAt: b.holdExpiresAt || b.metadata?.holdExpiresAt,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error("Error fetching broker bookings:", err);
      setError(err.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPayment = async (bookingId: string) => {
    setResendingPayment(bookingId);
    try {
      await apiClient.post(`/broker/bookings/${bookingId}/resend-payment`);
      alert("Payment link resent successfully!");
      fetchBookings();
    } catch (err: any) {
      alert(err.error || "Failed to resend payment link");
    } finally {
      setResendingPayment(null);
    }
  };

  const handleBookingCreated = (booking: any) => {
    setShowWizard(false);
    fetchBookings();
    // Show the payment confirmation modal for the new booking
    setSelectedBookingId(booking.booking?.bookingId || booking.bookingId);
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchCustomer) {
      const searchLower = searchCustomer.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchLower) ||
          b.guestEmail.toLowerCase().includes(searchLower) ||
          (b.customerName && b.customerName.toLowerCase().includes(searchLower)) ||
          (b.customerEmail && b.customerEmail.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  };

  // Group bookings by status
  const pendingPayment = bookings.filter(
    (b) => b.status === "PENDING" && b.paymentStatus !== "PAID"
  );
  const pendingArrival = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.checkIn) > new Date()
  );
  const completed = bookings.filter(
    (b) => b.status === "COMPLETED" || (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date())
  );

  const filteredBookings = getFilteredBookings();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
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

  const getStatusBadgeClass = (status: string, paymentStatus?: string) => {
    if (status === "PENDING" && paymentStatus !== "PAID") {
      return "bg-warning text-dark";
    }
    switch (status) {
      case "CONFIRMED":
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

  const getHoldTimeRemaining = (holdExpiresAt?: string) => {
    if (!holdExpiresAt) return null;
    const expiry = new Date(holdExpiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m remaining`;
  };

  const clearFilters = () => {
    setFilterStatus("");
    setSearchCustomer("");
  };

  const calculateCommission = (total: number) => total * 0.1;

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.total, 0);
  const totalCommission = filteredBookings.reduce(
    (sum, b) => sum + calculateCommission(b.total),
    0
  );

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="ri-lock-line" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
            <h2 className="mt-3">Sign in to view broker bookings</h2>
            <p className="text-muted">
              You need to be logged in to view bookings made on behalf of customers.
            </p>
            <Link href="/auth" className="btn btn-primary mt-3">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2">
              <i className="ri-user-star-line me-2"></i>
              Broker Bookings
            </h1>
            <p className="text-muted mb-0">
              Manage bookings made on behalf of your customers
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setShowWizard(true)}>
            <i className="ri-add-line me-2"></i>
            Create Booking
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && !error && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-warning">
              <div className="card-body text-center py-3">
                <h3 className="mb-0 text-warning">{pendingPayment.length}</h3>
                <small className="text-muted">Pending Payment</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body text-center py-3">
                <h3 className="mb-0 text-primary">{pendingArrival.length}</h3>
                <small className="text-muted">Pending Arrival</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body text-center py-3">
                <h3 className="mb-0 text-success">{completed.length}</h3>
                <small className="text-muted">Completed</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card" style={{ borderColor: "#6f42c1" }}>
              <div className="card-body text-center py-3">
                <h3 className="mb-0" style={{ color: "#6f42c1" }}>
                  {formatCurrency(totalCommission, "GBP")}
                </h3>
                <small className="text-muted">Est. Commission</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search customer name or email..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending Payment</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-5 d-flex gap-2">
                  {(filterStatus || searchCustomer) && (
                    <button className="btn btn-outline-secondary" onClick={clearFilters}>
                      <i className="ri-close-line me-1"></i>Clear
                    </button>
                  )}
                  <button className="btn btn-outline-primary ms-auto" onClick={fetchBookings}>
                    <i className="ri-refresh-line me-1"></i>Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your broker bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="ri-error-warning-line me-2"></i>
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchBookings}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div className="text-center py-5">
          <i className="ri-calendar-line" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
          <h3 className="mt-3">No broker bookings found</h3>
          <p className="text-muted">
            {bookings.length > 0
              ? "No bookings match your current filters."
              : "Start by creating a booking for your customer."}
          </p>
          <button className="btn btn-primary mt-2" onClick={() => setShowWizard(true)}>
            <i className="ri-add-line me-2"></i>
            Create Your First Booking
          </button>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Hotel / Room</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const holdTime = getHoldTimeRemaining(booking.holdExpiresAt);
                  const isPendingPayment =
                    booking.status === "PENDING" && booking.paymentStatus !== "PAID";

                  return (
                    <tr key={booking.id}>
                      <td>
                        <small className="text-muted d-block">
                          #{booking.id.slice(0, 8).toUpperCase()}
                        </small>
                        <small className="text-muted">{formatDate(booking.createdAt)}</small>
                      </td>
                      <td>
                        <div className="fw-medium">
                          {booking.guestName || booking.customerName || "N/A"}
                        </div>
                        <small className="text-muted">
                          {booking.guestEmail || booking.customerEmail}
                        </small>
                      </td>
                      <td>
                        <div className="fw-medium">{booking.hotelName}</div>
                        <small className="text-muted">{booking.roomName}</small>
                      </td>
                      <td>
                        <div>{formatDate(booking.checkIn)}</div>
                        <small className="text-muted">to {formatDate(booking.checkOut)}</small>
                        <small className="text-muted d-block">{booking.nights} nights</small>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            booking.status,
                            booking.paymentStatus
                          )}`}
                        >
                          {isPendingPayment ? "Awaiting Payment" : booking.status}
                        </span>
                        {isPendingPayment && holdTime && (
                          <small
                            className={`d-block mt-1 ${
                              holdTime === "Expired" ? "text-danger" : "text-warning"
                            }`}
                          >
                            <i className="ri-time-line me-1"></i>
                            {holdTime}
                          </small>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="fw-bold">
                          {formatCurrency(booking.total, booking.currency)}
                        </div>
                        <small className="text-muted" style={{ color: "#6f42c1" }}>
                          +{formatCurrency(calculateCommission(booking.total), booking.currency)}{" "}
                          comm.
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {isPendingPayment && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                title="View QR / Print"
                                onClick={() => setSelectedBookingId(booking.id)}
                              >
                                <i className="ri-qr-code-line"></i>
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                title="Resend Payment Link"
                                onClick={() => handleResendPayment(booking.id)}
                                disabled={resendingPayment === booking.id}
                              >
                                {resendingPayment === booking.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="ri-mail-send-line"></i>
                                )}
                              </button>
                            </>
                          )}
                          {!isPendingPayment && (
                            <button
                              className="btn btn-outline-secondary"
                              title="View Details"
                              onClick={() => setSelectedBookingId(booking.id)}
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Wizard Modal */}
      {showWizard && (
        <BrokerBookingWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleBookingCreated}
        />
      )}

      {/* Payment Confirmation Modal */}
      {selectedBookingId && (
        <PaymentConfirmationModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
        />
      )}
    </div>
  );
};

export default BrokerBookingsContent;
