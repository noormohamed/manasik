"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";

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
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Hotel {
  id: string;
  name: string;
}

const ManagementBookingsContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterHotel, setFilterHotel] = useState<string>("");
  const [searchGuest, setSearchGuest] = useState<string>("");

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const getUniqueHotels = (): Hotel[] => {
    const hotelMap = new Map<string, Hotel>();
    bookings.forEach((booking) => {
      if (booking.hotelId && !hotelMap.has(booking.hotelId)) {
        hotelMap.set(booking.hotelId, {
          id: booking.hotelId,
          name: booking.hotelName || "Unknown Hotel",
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

      // Use hotel bookings endpoint for management view
      const response = (await apiClient.get("/hotels/bookings", {
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
        bookingSource: b.bookingSource || "DIRECT",
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
        agentId: b.agentId,
        agentName: b.agentName,
        agentEmail: b.agentEmail,
        holdExpiresAt: b.holdExpiresAt,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (filterHotel) {
      filtered = filtered.filter((b) => b.hotelId === filterHotel);
    }

    if (searchGuest) {
      const searchLower = searchGuest.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchLower) ||
          b.guestEmail.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

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

  const getStatusBadgeClass = (status: string) => {
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

  const getBookingSourceBadge = (source: string, agentId?: string) => {
    if (agentId) {
      return { class: "bg-purple", label: "Broker", icon: "ri-user-star-line" };
    }
    switch (source) {
      case "AGENT":
        return { class: "bg-purple", label: "Broker", icon: "ri-user-star-line" };
      case "API":
        return { class: "bg-info", label: "API", icon: "ri-code-line" };
      case "ADMIN":
        return { class: "bg-dark", label: "Admin", icon: "ri-admin-line" };
      default:
        return { class: "bg-primary", label: "Direct", icon: "ri-user-line" };
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterHotel("");
    setSearchGuest("");
  };

  const getHoldTimeRemaining = (holdExpiresAt?: string) => {
    if (!holdExpiresAt) return null;
    const expiry = new Date(holdExpiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="ri-lock-line" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
            <h2 className="mt-3">Sign in to manage bookings</h2>
            <p className="text-muted">You need to be logged in to view hotel bookings.</p>
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
        <div className="col-12">
          <h1 className="mb-2">
            <i className="ri-hotel-line me-2"></i>
            Hotel Bookings Management
          </h1>
          <p className="text-muted">
            View and manage all bookings received at your hotels
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search guest name or email..."
                    value={searchGuest}
                    onChange={(e) => setSearchGuest(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterHotel}
                    onChange={(e) => setFilterHotel(e.target.value)}
                  >
                    <option value="">All Hotels</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex gap-2">
                  {(filterStatus || filterHotel || searchGuest) && (
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

      {/* Stats Summary */}
      {!loading && !error && bookings.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body py-3">
                <h4 className="mb-0">{filteredBookings.length}</h4>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-warning">
              <div className="card-body py-3">
                <h4 className="mb-0 text-warning">
                  {filteredBookings.filter((b) => b.status === "PENDING").length}
                </h4>
                <small className="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-success">
              <div className="card-body py-3">
                <h4 className="mb-0 text-success">
                  {filteredBookings.filter((b) => b.status === "CONFIRMED").length}
                </h4>
                <small className="text-muted">Confirmed</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-info">
              <div className="card-body py-3">
                <h4 className="mb-0 text-info">
                  {filteredBookings.filter((b) => b.status === "COMPLETED").length}
                </h4>
                <small className="text-muted">Completed</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-purple">
              <div className="card-body py-3">
                <h4 className="mb-0" style={{ color: "#6f42c1" }}>
                  {filteredBookings.filter((b) => b.agentId).length}
                </h4>
                <small className="text-muted">Via Broker</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-primary">
              <div className="card-body py-3">
                <h4 className="mb-0 text-primary">
                  {filteredBookings.filter((b) => !b.agentId).length}
                </h4>
                <small className="text-muted">Direct</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading bookings...</p>
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
          <h3 className="mt-3">No bookings found</h3>
          <p className="text-muted">
            {bookings.length > 0
              ? "No bookings match your current filters."
              : "You don't have any hotel bookings yet."}
          </p>
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
                  <th>Guest</th>
                  <th>Hotel / Room</th>
                  <th>Dates</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const sourceBadge = getBookingSourceBadge(booking.bookingSource || "", booking.agentId);
                  const isPendingPayment = booking.status === "PENDING" && booking.paymentStatus !== "PAID";
                  const holdTime = getHoldTimeRemaining(booking.holdExpiresAt);
                  
                  return (
                    <tr key={booking.id}>
                      <td>
                        <small className="text-muted d-block">#{booking.id.slice(0, 8)}</small>
                        <small className="text-muted">{formatDate(booking.createdAt)}</small>
                      </td>
                      <td>
                        <div className="fw-medium">{booking.guestName || "N/A"}</div>
                        <small className="text-muted">{booking.guestEmail}</small>
                        {booking.guestCount > 1 && (
                          <small className="text-muted d-block">
                            {booking.guestCount} guests
                          </small>
                        )}
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
                        <span className={`badge ${sourceBadge.class}`}>
                          <i className={`${sourceBadge.icon} me-1`}></i>
                          {sourceBadge.label}
                        </span>
                        {booking.agentName && (
                          <small className="text-muted d-block mt-1">{booking.agentName}</small>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                          {isPendingPayment ? "Awaiting Payment" : booking.status}
                        </span>
                        {isPendingPayment && holdTime && (
                          <small className={`d-block mt-1 ${holdTime === "Expired" ? "text-danger fw-bold" : "text-warning"}`}>
                            <i className="ri-time-line me-1"></i>
                            {holdTime === "Expired" ? "Hold Expired" : `Hold: ${holdTime}`}
                          </small>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="fw-bold">
                          {booking.refundAmount && booking.refundAmount > 0
                            ? formatCurrency(
                                booking.total - booking.refundAmount,
                                booking.currency
                              )
                            : formatCurrency(booking.total, booking.currency)}
                        </div>
                        {booking.refundAmount && booking.refundAmount > 0 && (
                          <small className="text-muted" style={{ textDecoration: 'line-through' }}>
                            {formatCurrency(booking.total, booking.currency)}
                          </small>
                        )}
                        <small className="text-muted d-block">{booking.paymentStatus || "PENDING"}</small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementBookingsContent;
