"use client";

import { useRouter } from "next/navigation";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="checkout-cancel-area ptb-175">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="mb-4">
                <i className="ri-close-circle-line" style={{ fontSize: '100px', color: '#ffc107' }}></i>
              </div>
              <h1 className="mb-3">Payment Cancelled</h1>
              <p className="lead text-muted mb-4">
                Your payment was cancelled. Don't worry - no charges have been made to your account.
              </p>

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="ri-information-line me-2"></i>
                    What happened?
                  </h5>
                  <p className="text-muted mb-0">
                    You cancelled the payment process before it was completed. Your cart items are still saved,
                    and you can return to checkout whenever you're ready.
                  </p>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="ri-question-line me-2"></i>
                    Need Help?
                  </h5>
                  <p className="text-muted mb-3">
                    If you experienced any issues during checkout or have questions about your booking,
                    our support team is here to help.
                  </p>
                  <ul className="list-unstyled text-start mb-0">
                    <li className="mb-2">
                      <i className="ri-mail-line me-2 text-primary"></i>
                      Email: support@bookingplatform.com
                    </li>
                    <li className="mb-2">
                      <i className="ri-phone-line me-2 text-primary"></i>
                      Phone: +1 (800) 123-4567
                    </li>
                    <li>
                      <i className="ri-chat-1-line me-2 text-primary"></i>
                      Live Chat: Available 24/7
                    </li>
                  </ul>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => router.push("/checkout")}
                >
                  <i className="ri-arrow-left-line me-2"></i>
                  Return to Checkout
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
    </div>
  );
}
