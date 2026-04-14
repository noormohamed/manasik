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
  paymentStatus?: string;
  hotelId: string;
  hotelName: string;
  hotelImage?: string;
  roomTypeId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  createdAt: string;
}

const MyBookingsContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

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
        paymentStatus: b.paymentStatus,
        hotelId: b.metadata?.hotelId || b.hotelId || "",
        hotelName: b.hotelName || b.metadata?.hotelName || "Unknown Hotel",
        hotelImage: b.hotelImage || b.metadata?.hotelImage || null,
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || "",
        roomName: b.roomType || b.metadata?.roomType || "Room",
        checkIn: b.checkInDate || b.metadata?.checkInDate || "",
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || "",
        nights: b.nights || b.metadata?.nights || 1,
        guestCount: b.guests || b.metadata?.guests || 1,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
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
              <option value="CONFIRMED">Confirmed</option>
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
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold">
                            {formatCurrency(booking.total, booking.currency)}
                          </span>
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
                      {bookings.filter((b) => b.status === "CONFIRMED").length}
                    </h4>
                    <small className="text-muted">Confirmed</small>
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
    </div>
  );
};

export default MyBookingsContent;
