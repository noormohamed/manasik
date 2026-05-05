"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import CreateBookingModal from "./CreateBookingModal";

interface BrokerBooking {
  id: string;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus?: string;
  bookingSource?: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  createdAt: string;
}

const DashboardBrokerContent: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BrokerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchGuest, setSearchGuest] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BrokerBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BrokerBooking | null>(null);
  const [editForm, setEditForm] = useState({ brokerFee: "", brokerNotes: "", checkInDate: "", checkOutDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = (await apiClient.get("/users/me/broker-bookings", {
        params: { limit: 100 },
      })) as { bookings?: any[] };

      const fetchedBookings = (response.bookings || []).map((b: any) => ({
        id: b.id,
        status: b.status,
        currency: b.currency || "USD",
        subtotal: b.subtotal || 0,
        tax: b.tax || 0,
        total: b.total || 0,
        paymentStatus: b.paymentStatus || "PENDING",
        bookingSource: b.bookingSource || "BROKER",
        hotelName: b.hotelName || b.metadata?.hotelName || "Unknown Hotel",
        guestName: b.guestName || b.metadata?.guestName || "",
        guestEmail: b.guestEmail || b.metadata?.guestEmail || "",
        checkIn: b.checkIn || b.checkInDate || b.metadata?.checkInDate || "",
        checkOut: b.checkOut || b.checkOutDate || b.metadata?.checkOutDate || "",
        nights: b.nights || b.metadata?.nights || 1,
        createdAt: b.createdAt,
      }));

      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error("Error fetching broker bookings:", err);
      setError(err.error || "Failed to fetch broker bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking: BrokerBooking) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    try {
      await apiClient.patch(`/hotels/bookings/${selectedBooking.id}/status`, {
        status: "CANCELLED",
        reason: cancelReason || undefined,
      });
      setShowCancelConfirm(false);
      setSelectedBooking(null);
      setCancelReason("");
      await fetchBookings();
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      alert(err.error || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handleEditClick = (booking: BrokerBooking) => {
    setEditingBooking(booking);
    setEditForm({
      brokerFee: "",
      brokerNotes: "",
      checkInDate: booking.checkIn ? booking.checkIn.split('T')[0] : "",
      checkOutDate: booking.checkOut ? booking.checkOut.split('T')[0] : "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    setSaving(true);
    try {
      const payload: any = {};
      if (editForm.checkInDate && editForm.checkOutDate) {
        payload.checkInDate = editForm.checkInDate;
        payload.checkOutDate = editForm.checkOutDate;
      }
      if (editForm.brokerFee !== "") {
        payload.brokerFee = parseFloat(editForm.brokerFee) || 0;
      }
      if (editForm.brokerNotes !== "") {
        payload.brokerNotes = editForm.brokerNotes;
      }

      await apiClient.patch(`/broker-bookings/${editingBooking.id}`, payload);
      setEditingBooking(null);
      await fetchBookings();
    } catch (err: any) {
      console.error("Error updating booking:", err);
      alert(err.error || "Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  const handleBookingCreated = () => {
    setShowCreateModal(false);
    fetchBookings();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-success";
      case "PENDING":
        return "bg-warning";
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

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-success";
      case "PENDING":
        return "bg-warning";
      case "REFUNDED":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

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

  // Apply client-side filters
  let filteredBookings = bookings;
  if (filterStatus) {
    filteredBookings = filteredBookings.filter((b) => b.status === filterStatus);
  }
  if (searchGuest) {
    const searchLower = searchGuest.toLowerCase();
    filteredBookings = filteredBookings.filter(
      (b) =>
        b.guestName.toLowerCase().includes(searchLower) ||
        b.guestEmail.toLowerCase().includes(searchLower) ||
        b.hotelName.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
            Broker Bookings
          </h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
            Manage bookings created on behalf of customers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="ri-add-line"></i>
          Create Booking
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search guest, email, or hotel..."
          value={searchGuest}
          onChange={(e) => setSearchGuest(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
            minWidth: 250,
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        {(filterStatus || searchGuest) && (
          <button
            onClick={() => {
              setFilterStatus("");
              setSearchGuest("");
            }}
            style={{
              padding: "8px 12px",
              background: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "#6b7280",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e5e7eb",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Loading broker bookings...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            background: "#fef2f2",
            borderRadius: 12,
            border: "1px solid #fecaca",
          }}
        >
          <i
            className="ri-error-warning-line"
            style={{ fontSize: 32, color: "#ef4444", marginBottom: 8 }}
          ></i>
          <p style={{ color: "#991b1b", fontWeight: 500 }}>{error}</p>
          <button
            onClick={fetchBookings}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: "#f9fafb",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <i
            className="ri-calendar-line"
            style={{ fontSize: 48, color: "#9ca3af", marginBottom: 12 }}
          ></i>
          <h3 style={{ color: "#374151", marginBottom: 8 }}>
            {bookings.length === 0
              ? "No broker bookings yet"
              : "No bookings match your filters"}
          </h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            {bookings.length === 0
              ? "Create your first booking on behalf of a customer to get started."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <th style={thStyle}>Hotel</th>
                <th style={thStyle}>Guest</th>
                <th style={thStyle}>Check-in</th>
                <th style={thStyle}>Check-out</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500 }}>{booking.hotelName}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500 }}>{booking.guestName}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {booking.guestEmail}
                    </div>
                  </td>
                  <td style={tdStyle}>{formatDate(booking.checkIn)}</td>
                  <td style={tdStyle}>{formatDate(booking.checkOut)}</td>
                  <td style={tdStyle}>
                    <span
                      className={`badge ${getStatusBadgeClass(booking.status)}`}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#fff",
                      }}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      className={`badge ${getPaymentBadgeClass(
                        booking.paymentStatus || ""
                      )}`}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#fff",
                      }}
                    >
                      {booking.paymentStatus || "N/A"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <strong>
                      {formatCurrency(booking.total, booking.currency)}
                    </strong>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleEditClick(booking)}
                          style={{
                            padding: "6px 12px",
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {booking.status !== "CANCELLED" &&
                        booking.status !== "REFUNDED" && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            style={{
                              padding: "6px 12px",
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedBooking && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCancelConfirm(false);
              setSelectedBooking(null);
            }
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 440,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
              Cancel Booking?
            </h3>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 16px" }}>
              Are you sure you want to cancel the booking for{" "}
              <strong>{selectedBooking.guestName}</strong> at{" "}
              <strong>{selectedBooking.hotelName}</strong>?
            </p>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Cancellation Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 14,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setSelectedBooking(null);
                }}
                disabled={cancelling}
                style={{
                  padding: "8px 16px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                style={{
                  padding: "8px 16px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingBooking(null); }}
        >
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24, maxWidth: 500,
            width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Edit Booking</h3>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>
              {editingBooking.hotelName} — {editingBooking.guestName}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Check-in</label>
                <input type="date" value={editForm.checkInDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, checkInDate: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Check-out</label>
                <input type="date" value={editForm.checkOutDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, checkOutDate: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Broker Fee ($)</label>
              <input type="number" value={editForm.brokerFee} placeholder="0.00" min="0" step="0.01"
                onChange={(e) => setEditForm((p) => ({ ...p, brokerFee: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Broker Notes</label>
              <textarea value={editForm.brokerNotes} rows={3} placeholder="Update notes..."
                onChange={(e) => setEditForm((p) => ({ ...p, brokerNotes: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingBooking(null)} disabled={saving}
                style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        hotelId=""
        onBookingCreated={handleBookingCreated}
        mode="broker"
      />
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 13,
  color: "#374151",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};

export default DashboardBrokerContent;
