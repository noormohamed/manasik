"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

const CheckoutContent = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { items, itemCount, totalAmount, currency, removeItem, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lead passenger information
  const [leadFirstName, setLeadFirstName] = useState(user?.firstName || "");
  const [leadLastName, setLeadLastName] = useState(user?.lastName || "");
  const [leadEmail, setLeadEmail] = useState(user?.email || "");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadNationality, setLeadNationality] = useState("");
  const [leadPassport, setLeadPassport] = useState("");
  const [leadDOB, setLeadDOB] = useState("");
  
  // Additional guests
  const [additionalGuests, setAdditionalGuests] = useState<Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    passport: string;
    dob: string;
  }>>([]);
  
  const [specialRequests, setSpecialRequests] = useState("");

  // Get total guest count from cart
  const totalGuestCount = items.reduce((sum, item) => sum + (item.guestCount || 1), 0);

  const taxRate = 0.10; // 10% tax
  const tax = totalAmount * taxRate;
  const grandTotal = totalAmount + tax;

  const handleStripeCheckout = async () => {
    if (!leadFirstName || !leadLastName || !leadEmail || !leadNationality) {
      setError("Please fill in all required lead passenger fields");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Validate guest count matches
    if (additionalGuests.length + 1 !== totalGuestCount) {
      setError(`Please add details for all ${totalGuestCount} guests`);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Prepare guest details array
      const guestDetails = [
        {
          firstName: leadFirstName,
          lastName: leadLastName,
          email: leadEmail,
          phone: leadPhone,
          nationality: leadNationality,
          passport: leadPassport,
          dob: leadDOB,
          isLeadPassenger: true,
        },
        ...additionalGuests.map(guest => ({
          ...guest,
          isLeadPassenger: false,
        })),
      ];

      // First, create bookings for each cart item (with PENDING status)
      const bookingIds: string[] = [];
      
      for (const item of items) {
        if (item.type === 'HOTEL') {
          const response = await apiClient.post<{ id?: string }>(`/hotels/${item.serviceId}/bookings`, {
            roomTypeId: item.roomTypeId,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            guestCount: item.guestCount,
            guestDetails, // Pass all guest details
            specialRequests,
            status: 'PENDING_PAYMENT',
          });
          
          if (response?.id) {
            bookingIds.push(response.id);
          }
        }
      }

      // Create Stripe checkout session
      const checkoutItems = items.map(item => ({
        name: `${item.serviceName} - ${item.roomName}`,
        description: item.type === 'HOTEL' 
          ? `${item.nights} night(s), ${item.guestCount} guest(s)` 
          : item.roomName,
        amount: item.subtotal + (item.subtotal * taxRate),
        quantity: 1,
        currency: item.currency || 'GBP',
      }));

      const response = await apiClient.post<{ url?: string; sessionId?: string }>('/checkout/create-session', {
        items: checkoutItems,
        customerEmail: leadEmail,
        customerId: user?.id,
        bookingIds,
        metadata: {
          leadPassengerName: `${leadFirstName} ${leadLastName}`,
          leadPhone: leadPhone,
          guestCount: totalGuestCount,
          specialRequests,
        },
      });

      if (response?.url) {
        localStorage.setItem('pendingCheckout', JSON.stringify({
          bookingIds,
          sessionId: response.sessionId,
          items,
          guestDetails,
        }));

        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error("Error creating checkout:", err);
      setError(err.error || err.message || "Failed to create checkout. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (items.length === 0) {
    return (
      <div className="checkout-area ptb-175">
        <div className="container">
          <div className="text-center">
            <i className="ri-shopping-cart-line" style={{ fontSize: '80px', color: '#ccc' }}></i>
            <h2 className="mt-4">Your Cart is Empty</h2>
            <p className="text-muted mb-4">Add some hotels or experiences to get started!</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/stay")}
            >
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-area ptb-175">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="checkout-content">
                <h2 className="mb-4">
                  <i className="ri-shopping-cart-line me-2"></i>
                  Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </h2>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {error}
                  </div>
                )}

                {/* Cart Items */}
                <div className="cart-items mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="card mb-3">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-2">
                            {item.serviceImage && (
                              <Image
                                src={item.serviceImage}
                                alt={item.serviceName}
                                width={100}
                                height={80}
                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                              />
                            )}
                          </div>
                          <div className="col-md-6">
                            <h5 className="mb-1">{item.serviceName}</h5>
                            <p className="text-muted mb-1">{item.roomName}</p>
                            {item.type === 'HOTEL' && (
                              <div className="small text-muted">
                                <div>
                                  <i className="ri-calendar-line me-1"></i>
                                  {formatDate(item.checkIn!)} - {formatDate(item.checkOut!)}
                                </div>
                                <div>
                                  <i className="ri-moon-line me-1"></i>
                                  {item.nights} night{item.nights !== 1 ? 's' : ''}
                                  <i className="ri-user-line ms-3 me-1"></i>
                                  {item.guestCount} guest{item.guestCount !== 1 ? 's' : ''}
                                </div>
                                {item.metadata?.hotelAddress && (
                                  <div>
                                    <i className="ri-map-pin-line me-1"></i>
                                    {item.metadata.hotelAddress}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="col-md-3 text-end">
                            <h5 className="text-primary mb-0">
                              ${Number(item.subtotal).toFixed(2)} {item.currency}
                            </h5>
                            <small className="text-muted">
                              ${Number(item.basePrice).toFixed(2)} total
                            </small>
                          </div>
                          <div className="col-md-1 text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.id)}
                              title="Remove from cart"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lead Passenger Information Form */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h4 className="mb-4">
                      <i className="ri-user-line me-2"></i>
                      Lead Passenger Information *
                    </h4>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leadFirstName}
                          onChange={(e) => setLeadFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leadLastName}
                          onChange={(e) => setLeadLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nationality *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leadNationality}
                          onChange={(e) => setLeadNationality(e.target.value)}
                          placeholder="e.g., United Kingdom"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={leadDOB}
                          onChange={(e) => setLeadDOB(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Passport Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leadPassport}
                          onChange={(e) => setLeadPassport(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Guests */}
                {totalGuestCount > 1 && (
                  <div className="card mb-4">
                    <div className="card-body">
                      <h4 className="mb-4">
                        <i className="ri-group-line me-2"></i>
                        Additional Guests ({additionalGuests.length}/{totalGuestCount - 1})
                      </h4>

                      {additionalGuests.map((guest, index) => (
                        <div key={index} className="border-bottom pb-4 mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Guest {index + 2}</h5>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
                              }}
                            >
                              <i className="ri-delete-bin-line me-1"></i>
                              Remove
                            </button>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">First Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={guest.firstName}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].firstName = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Last Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={guest.lastName}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].lastName = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Email Address *</label>
                              <input
                                type="email"
                                className="form-control"
                                value={guest.email}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].email = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Phone Number</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={guest.phone}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].phone = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Nationality *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={guest.nationality}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].nationality = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                                placeholder="e.g., United Kingdom"
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Date of Birth</label>
                              <input
                                type="date"
                                className="form-control"
                                value={guest.dob}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].dob = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Passport Number</label>
                              <input
                                type="text"
                                className="form-control"
                                value={guest.passport}
                                onChange={(e) => {
                                  const updated = [...additionalGuests];
                                  updated[index].passport = e.target.value;
                                  setAdditionalGuests(updated);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {additionalGuests.length < totalGuestCount - 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => {
                            setAdditionalGuests([
                              ...additionalGuests,
                              {
                                firstName: '',
                                lastName: '',
                                email: '',
                                phone: '',
                                nationality: '',
                                passport: '',
                                dob: '',
                              },
                            ]);
                          }}
                        >
                          <i className="ri-add-line me-1"></i>
                          Add Guest
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div className="card">
                  <div className="card-body">
                    <h4 className="mb-4">
                      <i className="ri-message-line me-2"></i>
                      Special Requests
                    </h4>

                    <div className="mb-3">
                      <label className="form-label">Any special requests or requirements?</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Let us know if you have any special requests..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {/* Order Summary */}
              <div className="card sticky-top" style={{ top: '100px' }}>
                <div className="card-body">
                  <h4 className="mb-4">
                    <i className="ri-file-list-line me-2"></i>
                    Order Summary
                  </h4>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                      <span>${Number(totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax (10%)</span>
                      <span>${Number(tax).toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total</strong>
                      <strong className="text-primary">
                        ${Number(grandTotal).toFixed(2)} {currency}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-100 mb-3"
                    onClick={handleStripeCheckout}
                    disabled={processing || !leadFirstName || !leadLastName || !leadEmail || !leadNationality || additionalGuests.length + 1 !== totalGuestCount}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="ri-bank-card-line me-2"></i>
                        Pay with Stripe
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => router.push("/stay")}
                  >
                    <i className="ri-arrow-left-line me-2"></i>
                    Continue Shopping
                  </button>

                  <div className="alert alert-info mt-3" style={{ fontSize: '0.85rem' }}>
                    <i className="ri-information-line me-2"></i>
                    You will be redirected to Stripe's secure checkout page to complete your payment.
                  </div>

                  <div className="mt-3">
                    <h6 className="mb-2">
                      <i className="ri-shield-check-line me-2"></i>
                      Secure Payment
                    </h6>
                    <ul className="list-unstyled small text-muted">
                      <li><i className="ri-check-line me-1 text-success"></i> Powered by Stripe</li>
                      <li><i className="ri-check-line me-1 text-success"></i> 256-bit SSL encryption</li>
                      <li><i className="ri-check-line me-1 text-success"></i> PCI DSS compliant</li>
                      <li><i className="ri-check-line me-1 text-success"></i> Free cancellation</li>
                    </ul>
                  </div>

                  {/* Payment method icons */}
                  <div className="mt-3 text-center">
                    <small className="text-muted d-block mb-2">Accepted payment methods</small>
                    <div className="d-flex justify-content-center gap-2">
                      <span className="badge bg-light text-dark">Visa</span>
                      <span className="badge bg-light text-dark">Mastercard</span>
                      <span className="badge bg-light text-dark">Amex</span>
                      <span className="badge bg-light text-dark">Apple Pay</span>
                      <span className="badge bg-light text-dark">Google Pay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutContent;
