"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  image?: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  currency: string;
  availableRooms: number;
  image?: string;
}

interface WizardProps {
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

type WizardStep = "customer" | "hotel" | "room" | "dates" | "confirm";

const BrokerBookingWizard: React.FC<WizardProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<WizardStep>("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Hotel selection
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelSearch, setHotelSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loadingHotels, setLoadingHotels] = useState(false);

  // Room selection
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Dates
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [brokerNotes, setBrokerNotes] = useState("");

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const subtotal = selectedRoom ? selectedRoom.basePrice * nights : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Search hotels
  useEffect(() => {
    const searchHotels = async () => {
      if (step !== "hotel") return;
      setLoadingHotels(true);
      try {
        const params: any = { limit: 20 };
        if (hotelSearch) params.search = hotelSearch;
        const response = (await apiClient.get("/broker/hotels", { params })) as { hotels: Hotel[] };
        setHotels(response.hotels || []);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setLoadingHotels(false);
      }
    };

    const debounce = setTimeout(searchHotels, 300);
    return () => clearTimeout(debounce);
  }, [step, hotelSearch]);

  // Load rooms when hotel selected
  useEffect(() => {
    const loadRooms = async () => {
      if (!selectedHotel || step !== "room") return;
      setLoadingRooms(true);
      try {
        const response = (await apiClient.get(`/broker/hotels/${selectedHotel.id}/rooms`)) as {
          rooms: Room[];
        };
        setRooms(response.rooms || []);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [selectedHotel, step]);

  const handleSubmit = async () => {
    if (!selectedHotel || !selectedRoom || !checkIn || !checkOut) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/broker/bookings", {
        customerEmail,
        customerName,
        customerPhone,
        hotelId: selectedHotel.id,
        hotelName: selectedHotel.name,
        roomTypeId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkIn,
        checkOut,
        nights,
        guests,
        basePrice: selectedRoom.basePrice,
        currency: selectedRoom.currency,
        brokerNotes,
      });

      onSuccess(response);
    } catch (err: any) {
      setError(err.error || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "customer":
        return customerName.trim() && customerEmail.trim() && customerEmail.includes("@");
      case "hotel":
        return selectedHotel !== null;
      case "room":
        return selectedRoom !== null;
      case "dates":
        return checkIn && checkOut && nights > 0 && guests > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    const steps: WizardStep[] = ["customer", "hotel", "room", "dates", "confirm"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: WizardStep[] = ["customer", "hotel", "room", "dates", "confirm"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const getMinCheckIn = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinCheckOut = () => {
    if (!checkIn) return getMinCheckIn();
    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="ri-add-circle-line me-2"></i>
              Create Booking for Customer
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 pt-3">
            <div className="d-flex justify-content-between mb-3">
              {["customer", "hotel", "room", "dates", "confirm"].map((s, i) => (
                <div
                  key={s}
                  className={`text-center flex-fill ${i > 0 ? "border-start" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const steps: WizardStep[] = ["customer", "hotel", "room", "dates", "confirm"];
                    const currentIndex = steps.indexOf(step);
                    if (i <= currentIndex) setStep(s as WizardStep);
                  }}
                >
                  <div
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${
                      step === s
                        ? "bg-primary text-white"
                        : ["customer", "hotel", "room", "dates", "confirm"].indexOf(step) > i
                        ? "bg-success text-white"
                        : "bg-light text-muted"
                    }`}
                    style={{ width: 32, height: 32 }}
                  >
                    {["customer", "hotel", "room", "dates", "confirm"].indexOf(step) > i ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <small className="d-block text-capitalize">{s}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <i className="ri-error-warning-line me-2"></i>
                {error}
              </div>
            )}

            {/* Step 1: Customer Details */}
            {step === "customer" && (
              <div>
                <h6 className="mb-3">Customer Information</h6>
                <div className="mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer's full name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                  <small className="text-muted">Payment link will be sent to this email</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+44 123 456 7890"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Hotel Selection */}
            {step === "hotel" && (
              <div>
                <h6 className="mb-3">Select Hotel</h6>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    placeholder="Search hotels by name or city..."
                  />
                </div>

                {loadingHotels ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary"></div>
                  </div>
                ) : (
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {hotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        className={`card mb-2 cursor-pointer ${
                          selectedHotel?.id === hotel.id ? "border-primary" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedHotel(hotel)}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex">
                            {hotel.image && (
                              <img
                                src={hotel.image}
                                alt={hotel.name}
                                className="rounded me-3"
                                style={{ width: 80, height: 60, objectFit: "cover" }}
                              />
                            )}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <h6 className="mb-1">{hotel.name}</h6>
                                {selectedHotel?.id === hotel.id && (
                                  <i className="ri-checkbox-circle-fill text-primary"></i>
                                )}
                              </div>
                              <small className="text-muted">
                                {hotel.city}, {hotel.country}
                              </small>
                              <div>
                                {[...Array(hotel.starRating)].map((_, i) => (
                                  <i key={i} className="ri-star-fill text-warning small"></i>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {hotels.length === 0 && (
                      <p className="text-muted text-center py-4">No hotels found</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Room Selection */}
            {step === "room" && (
              <div>
                <h6 className="mb-3">Select Room at {selectedHotel?.name}</h6>

                {loadingRooms ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary"></div>
                  </div>
                ) : (
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`card mb-2 ${selectedRoom?.id === room.id ? "border-primary" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="d-flex align-items-center">
                                <h6 className="mb-1">{room.name}</h6>
                                {selectedRoom?.id === room.id && (
                                  <i className="ri-checkbox-circle-fill text-primary ms-2"></i>
                                )}
                              </div>
                              <p className="text-muted small mb-1">{room.description}</p>
                              <small className="text-muted">
                                <i className="ri-user-line me-1"></i>
                                Up to {room.capacity} guests
                                <span className="mx-2">•</span>
                                {room.availableRooms} available
                              </small>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-primary">
                                {room.currency} {room.basePrice.toFixed(2)}
                              </div>
                              <small className="text-muted">per night</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {rooms.length === 0 && (
                      <p className="text-muted text-center py-4">No rooms available</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Dates */}
            {step === "dates" && (
              <div>
                <h6 className="mb-3">Select Dates & Guests</h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check-in Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkIn}
                      min={getMinCheckIn()}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut && e.target.value >= checkOut) {
                          setCheckOut("");
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check-out Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkOut}
                      min={getMinCheckOut()}
                      onChange={(e) => setCheckOut(e.target.value)}
                      disabled={!checkIn}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Number of Guests *</label>
                  <select
                    className="form-select"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  >
                    {[...Array(selectedRoom?.capacity || 4)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={brokerNotes}
                    onChange={(e) => setBrokerNotes(e.target.value)}
                    placeholder="Any special requests or notes..."
                  />
                </div>

                {nights > 0 && selectedRoom && (
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>
                          {selectedRoom.currency} {selectedRoom.basePrice.toFixed(2)} × {nights} nights
                        </span>
                        <span>{selectedRoom.currency} {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 text-muted">
                        <span>Tax (10%)</span>
                        <span>{selectedRoom.currency} {tax.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          {selectedRoom.currency} {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === "confirm" && (
              <div>
                <h6 className="mb-3">Review & Confirm Booking</h6>

                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <i className="ri-user-line me-2"></i>Customer Details
                  </div>
                  <div className="card-body">
                    <p className="mb-1">
                      <strong>{customerName}</strong>
                    </p>
                    <p className="mb-1 text-muted">{customerEmail}</p>
                    {customerPhone && <p className="mb-0 text-muted">{customerPhone}</p>}
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <i className="ri-hotel-line me-2"></i>Booking Details
                  </div>
                  <div className="card-body">
                    <p className="mb-1">
                      <strong>{selectedHotel?.name}</strong>
                    </p>
                    <p className="mb-1 text-muted">
                      {selectedHotel?.city}, {selectedHotel?.country}
                    </p>
                    <hr />
                    <p className="mb-1">
                      <strong>{selectedRoom?.name}</strong>
                    </p>
                    <p className="mb-1">
                      <i className="ri-calendar-line me-1"></i>
                      {checkIn} → {checkOut} ({nights} nights)
                    </p>
                    <p className="mb-0">
                      <i className="ri-user-line me-1"></i>
                      {guests} {guests === 1 ? "Guest" : "Guests"}
                    </p>
                  </div>
                </div>

                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small>Total Amount</small>
                        <h3 className="mb-0">
                          {selectedRoom?.currency} {total.toFixed(2)}
                        </h3>
                      </div>
                      <i className="ri-secure-payment-line" style={{ fontSize: "2rem" }}></i>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-3 mb-0">
                  <i className="ri-information-line me-2"></i>
                  A payment link will be sent to <strong>{customerEmail}</strong>. The booking will be
                  held for <strong>1 hour</strong> while awaiting payment.
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            {step !== "customer" && (
              <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
                <i className="ri-arrow-left-line me-1"></i>Back
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {step !== "confirm" ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next<i className="ri-arrow-right-line ms-1"></i>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line me-1"></i>Create Booking & Send Payment Link
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerBookingWizard;
