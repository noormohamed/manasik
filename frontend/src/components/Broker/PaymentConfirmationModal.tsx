"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import QRCode from "qrcode";

interface PaymentConfirmationProps {
  bookingId: string;
  onClose: () => void;
}

interface ConfirmationData {
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guestName: string;
    guestEmail: string;
  };
  paymentUrl: string;
  qrCodeData: string;
  expiresAt: string;
  isExpired: boolean;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationProps> = ({ bookingId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConfirmation();
  }, [bookingId]);

  useEffect(() => {
    if (!data?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(data.expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data?.expiresAt]);

  useEffect(() => {
    if (data?.qrCodeData) {
      generateQRCode(data.qrCodeData);
    }
  }, [data?.qrCodeData]);

  const fetchConfirmation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await apiClient.get(
        `/broker/bookings/${bookingId}/payment-confirmation`
      )) as ConfirmationData;
      setData(response);
    } catch (err: any) {
      setError(err.error || "Failed to load payment confirmation");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Confirmation - ${data?.booking.id.slice(0, 8).toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .qr-section { text-align: center; margin: 30px 0; }
          .qr-code { width: 200px; height: 200px; }
          .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .row:last-child { border-bottom: none; }
          .total { font-size: 24px; color: #2563eb; font-weight: bold; text-align: center; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Manasik</div>
          <p>Payment Confirmation</p>
        </div>
        
        <div class="qr-section">
          <img src="${qrCodeUrl}" class="qr-code" alt="Payment QR Code" />
          <p><strong>Scan to Pay</strong></p>
        </div>

        <div class="details">
          <div class="row"><span>Booking Reference</span><span><strong>${data?.booking.id.slice(0, 8).toUpperCase()}</strong></span></div>
          <div class="row"><span>Guest Name</span><span>${data?.booking.guestName}</span></div>
          <div class="row"><span>Hotel</span><span>${data?.booking.hotelName}</span></div>
          <div class="row"><span>Room Type</span><span>${data?.booking.roomType}</span></div>
          <div class="row"><span>Check-in</span><span>${data?.booking.checkIn}</span></div>
          <div class="row"><span>Check-out</span><span>${data?.booking.checkOut}</span></div>
          <div class="row"><span>Duration</span><span>${data?.booking.nights} night(s)</span></div>
        </div>

        <div class="total">
          Total: ${data?.booking.currency} ${data?.booking.total.toFixed(2)}
        </div>

        <div class="warning">
          <strong>⏰ Important:</strong> This payment link expires at ${new Date(data?.expiresAt || "").toLocaleString()}. 
          Please complete payment before this time to secure the booking.
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Manasik - Your Travel Partner</p>
          <p>Payment URL: ${data?.paymentUrl}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Loading payment confirmation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Error</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger mb-0">{error || "Failed to load data"}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="ri-qr-code-line me-2"></i>
              Payment Confirmation
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body" ref={printRef}>
            {/* Timer Warning */}
            {!data.isExpired && data.booking.paymentStatus !== "PAID" && (
              <div className="alert alert-warning d-flex align-items-center justify-content-between">
                <div>
                  <i className="ri-time-line me-2"></i>
                  <strong>Payment Hold Expires In:</strong>
                </div>
                <span className="badge bg-warning text-dark fs-5">{timeRemaining}</span>
              </div>
            )}

            {data.isExpired && data.booking.paymentStatus !== "PAID" && (
              <div className="alert alert-danger">
                <i className="ri-error-warning-line me-2"></i>
                <strong>This payment link has expired.</strong> Please resend a new payment link.
              </div>
            )}

            {data.booking.paymentStatus === "PAID" && (
              <div className="alert alert-success">
                <i className="ri-checkbox-circle-line me-2"></i>
                <strong>Payment Completed!</strong> This booking has been confirmed.
              </div>
            )}

            <div className="row">
              {/* QR Code Section */}
              <div className="col-md-5 text-center border-end">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="Payment QR Code" className="img-fluid mb-3" />
                )}
                <p className="fw-bold mb-1">Scan to Pay</p>
                <small className="text-muted">
                  Customer can scan this QR code to complete payment
                </small>
              </div>

              {/* Booking Details */}
              <div className="col-md-7">
                <h6 className="mb-3">Booking Details</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted">Reference</td>
                      <td className="fw-bold">{data.booking.id.slice(0, 8).toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Guest</td>
                      <td>{data.booking.guestName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Email</td>
                      <td>{data.booking.guestEmail}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Hotel</td>
                      <td>{data.booking.hotelName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Room</td>
                      <td>{data.booking.roomType}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Check-in</td>
                      <td>{formatDate(data.booking.checkIn)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Check-out</td>
                      <td>{formatDate(data.booking.checkOut)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Duration</td>
                      <td>{data.booking.nights} night(s)</td>
                    </tr>
                  </tbody>
                </table>

                <div className="card bg-primary text-white mt-3">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Total Amount</span>
                      <span className="fs-4 fw-bold">
                        {data.booking.currency} {data.booking.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-outline-primary" onClick={handlePrint}>
              <i className="ri-printer-line me-1"></i>Print
            </button>
            {data.paymentUrl && !data.isExpired && data.booking.paymentStatus !== "PAID" && (
              <a
                href={data.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="ri-external-link-line me-1"></i>Open Payment Link
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
