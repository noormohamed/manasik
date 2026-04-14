"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/api";

interface PaymentDetails {
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  bookingIds: string[];
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await apiClient.post<{ success: boolean; data?: PaymentDetails; error?: string }>("/checkout/verify-payment", {
        sessionId,
      });

      if (response.success && response.data?.paymentStatus === "paid") {
        setPaymentDetails(response.data);
        
        // Clear the cart after successful payment
        clearCart();
        
        // Clear pending checkout from localStorage
        localStorage.removeItem("pendingCheckout");
      } else {
        setError("Payment verification failed. Please contact support.");
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(err.message || "Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-success-area ptb-175">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2>Verifying your payment...</h2>
            <p className="text-muted">Please wait while we confirm your payment with Stripe.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-success-area ptb-175">
        <div className="container">
          <div className="text-center">
            <div className="mb-4">
              <i className="ri-error-warning-line" style={{ fontSize: '80px', color: '#dc3545' }}></i>
            </div>
            <h2>Payment Verification Failed</h2>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/checkout")}
              >
                <i className="ri-arrow-left-line me-2"></i>
                Return to Checkout
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => router.push("/dashboard/bookings")}
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success-area ptb-175">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <div className="mb-4">
                <i className="ri-checkbox-circle-line" style={{ fontSize: '100px', color: '#28a745' }}></i>
              </div>
              <h1 className="mb-3">Payment Successful!</h1>
              <p className="lead text-muted">
                Thank you for your booking. Your payment has been processed successfully.
              </p>
            </div>

            {paymentDetails && (
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="card-title mb-4">
                    <i className="ri-file-list-line me-2"></i>
                    Payment Details
                  </h4>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Payment Status</label>
                      <div>
                        <span className="badge bg-success">
                          <i className="ri-check-line me-1"></i>
                          {paymentDetails.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Amount Paid</label>
                      <div className="h5 mb-0">
                        {paymentDetails.currency.toUpperCase()} {Number(paymentDetails.amountTotal).toFixed(2)}
                      </div>
                    </div>
                    {paymentDetails.bookingIds && paymentDetails.bookingIds.length > 0 && (
                      <div className="col-12">
                        <label className="text-muted small">Booking Reference(s)</label>
                        <div>
                          {paymentDetails.bookingIds.map((id, index) => (
                            <span key={id} className="badge bg-light text-dark me-2">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="card mb-4">
              <div className="card-body">
                <h4 className="card-title mb-4">
                  <i className="ri-mail-line me-2"></i>
                  What's Next?
                </h4>
                <ul className="list-unstyled mb-0">
                  <li className="mb-3">
                    <i className="ri-check-double-line text-success me-2"></i>
                    A confirmation email has been sent to your email address
                  </li>
                  <li className="mb-3">
                    <i className="ri-check-double-line text-success me-2"></i>
                    Your booking is now confirmed and ready
                  </li>
                  <li className="mb-3">
                    <i className="ri-check-double-line text-success me-2"></i>
                    You can view and manage your bookings in your dashboard
                  </li>
                  <li>
                    <i className="ri-check-double-line text-success me-2"></i>
                    Contact us if you have any questions or need assistance
                  </li>
                </ul>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push("/dashboard/bookings")}
              >
                <i className="ri-calendar-check-line me-2"></i>
                View My Bookings
              </button>
              <button
                className="btn btn-outline-secondary btn-lg"
                onClick={() => router.push("/stay")}
              >
                <i className="ri-search-line me-2"></i>
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
