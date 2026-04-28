"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import styles from "./CreateBookingModal.module.css";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  onBookingCreated: (booking: any) => void;
}

interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isLead: boolean;
}

interface RoomType {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  basePrice?: number;
  currency?: string;
  availableRooms?: number;
  image?: string;
}

interface RoomSelection {
  roomTypeId: string;
  quantity: number;
}

interface WizardState {
  step: 1 | 2 | 3 | 4;
  selectedHotel: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  guests: Guest[];
  roomSelections: RoomSelection[];
  sendPaymentLink: boolean;
  isLoading: boolean;
  errors: Record<string, string>;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  hotelId,
  onBookingCreated,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [wizardState, setWizardState] = useState<WizardState>({
    step: 1,
    selectedHotel: hotelId,
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    guests: [{ firstName: "", lastName: "", email: "", phone: "", isLead: true }],
    roomSelections: [],
    sendPaymentLink: false,
    isLoading: false,
    errors: {},
  });

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [guestLookupLoading, setGuestLookupLoading] = useState(false);
  const [duplicateBookingWarning, setDuplicateBookingWarning] = useState<string | null>(null);
  const [userHotels, setUserHotels] = useState<Array<{ id: string; name: string }>>([])

  // Sync selectedHotel with hotelId prop
  useEffect(() => {
    setWizardState((prev) => ({ ...prev, selectedHotel: hotelId }));
  }, [hotelId]);

  // Fetch user's hotels when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserHotels();
    }
  }, [isOpen]);

  // Fetch room types when hotel changes
  useEffect(() => {
    if (wizardState.selectedHotel && isOpen) {
      fetchRoomTypes();
    }
  }, [wizardState.selectedHotel, isOpen]);

  // Derive computed values from state (not stored, recalculated on each render)
  const totalCapacity = wizardState.roomSelections.reduce((sum, sel) => {
    const room = roomTypes.find((r) => r.id === sel.roomTypeId);
    return sum + (room?.capacity || 0) * sel.quantity;
  }, 0);
  const totalRoomsSelected = wizardState.roomSelections.reduce(
    (sum, sel) => sum + sel.quantity,
    0
  );

  // Recompute nights whenever dates change
  useEffect(() => {
    if (wizardState.checkInDate && wizardState.checkOutDate) {
      const checkIn = new Date(wizardState.checkInDate);
      const checkOut = new Date(wizardState.checkOutDate);
      const n = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      setNights(n > 0 ? n : 0);
      checkDuplicateBooking();
    } else {
      setNights(0);
    }
  }, [wizardState.checkInDate, wizardState.checkOutDate]);

  // Recompute total price whenever nights or room selections change
  useEffect(() => {
    if (nights > 0 && wizardState.roomSelections.length > 0) {
      const subtotal = wizardState.roomSelections.reduce((sum, sel) => {
        const room = roomTypes.find((r) => r.id === sel.roomTypeId);
        const price = room?.basePrice || 0;
        return sum + price * nights * sel.quantity;
      }, 0);
      setTotalPrice(Math.round(subtotal * 1.15 * 100) / 100);
    } else {
      setTotalPrice(0);
    }
  }, [nights, wizardState.roomSelections, roomTypes]);

  const fetchRoomTypes = async () => {
    try {
      const response = (await apiClient.get(
        `/broker/hotels/${wizardState.selectedHotel}/rooms`
      )) as { rooms?: RoomType[] };
      setRoomTypes(response.rooms || []);
    } catch (error) {
      console.error("Error fetching room types:", error);
      setWizardState((prev) => ({
        ...prev,
        errors: { ...prev.errors, roomTypes: "Failed to load room types" },
      }));
    }
  };

  const fetchUserHotels = async () => {
    try {
      const response = (await apiClient.get("/hotels/listings")) as {
        hotels?: Array<{ id: string; name: string }>;
      };
      setUserHotels(response.hotels || []);
    } catch (error) {
      console.error("Error fetching user hotels:", error);
      setUserHotels([]);
    }
  };

  const lookupGuestByEmail = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    setGuestLookupLoading(true);
    try {
      const response = (await apiClient.get(`/users/by-email/${email}`)) as {
        user?: { firstName?: string; lastName?: string; phone?: string };
      };
      if (response.user) {
        const guestIndex = wizardState.guests.findIndex((g) => g.email === email);
        if (guestIndex >= 0) {
          setWizardState((prev) => {
            const newGuests = [...prev.guests];
            newGuests[guestIndex] = {
              ...newGuests[guestIndex],
              firstName: response.user?.firstName || newGuests[guestIndex].firstName,
              lastName: response.user?.lastName || newGuests[guestIndex].lastName,
              phone: response.user?.phone || newGuests[guestIndex].phone,
            };
            return { ...prev, guests: newGuests };
          });
        }
      }
    } catch (error) {
      console.error("Error looking up guest:", error);
    } finally {
      setGuestLookupLoading(false);
    }
  };

  const checkDuplicateBooking = async () => {
    if (
      !wizardState.selectedHotel ||
      !wizardState.checkInDate ||
      !wizardState.checkOutDate
    ) {
      return;
    }

    const leadGuest = wizardState.guests.find((g) => g.isLead);
    if (!leadGuest?.email) {
      return;
    }

    try {
      const response = (await apiClient.get(
        `/staff-bookings/check-duplicate?hotelId=${wizardState.selectedHotel}&guestEmail=${leadGuest.email}&checkInDate=${wizardState.checkInDate}&checkOutDate=${wizardState.checkOutDate}`
      )) as { isDuplicate?: boolean; message?: string };

      if (response.isDuplicate) {
        setDuplicateBookingWarning(
          response.message || "A booking already exists for this guest during these dates"
        );
      } else {
        setDuplicateBookingWarning(null);
      }
    } catch (error) {
      console.error("Error checking duplicate booking:", error);
      setDuplicateBookingWarning(null);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!wizardState.selectedHotel) {
      newErrors.selectedHotel = "Hotel is required";
    }
    if (!wizardState.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    } else {
      const checkInDate = new Date(wizardState.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        newErrors.checkInDate = "Check-in date must be today or later";
      }
    }
    if (!wizardState.checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required";
    } else if (wizardState.checkInDate) {
      const checkInDate = new Date(wizardState.checkInDate);
      const checkOutDate = new Date(wizardState.checkOutDate);
      if (checkOutDate <= checkInDate) {
        newErrors.checkOutDate = "Check-out date must be after check-in date";
      }
    }
    if (wizardState.numberOfGuests < 1) {
      newErrors.numberOfGuests = "Number of guests must be at least 1";
    }

    setWizardState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    wizardState.guests.forEach((guest, index) => {
      if (!guest.firstName.trim()) {
        newErrors[`guest_${index}_firstName`] = "First name is required";
      }
      if (!guest.lastName.trim()) {
        newErrors[`guest_${index}_lastName`] = "Last name is required";
      }
      if (!guest.email) {
        newErrors[`guest_${index}_email`] = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
        newErrors[`guest_${index}_email`] = "Invalid email format";
      }
    });

    const hasLead = wizardState.guests.some((g) => g.isLead);
    if (!hasLead) {
      newErrors.noLead = "At least one guest must be marked as lead";
    }

    setWizardState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (totalRoomsSelected === 0) {
      newErrors.rooms = "Please select at least one room";
    } else if (totalCapacity < wizardState.numberOfGuests) {
      newErrors.rooms = `Selected rooms fit ${totalCapacity} guest(s) but ${wizardState.numberOfGuests} are needed. Please add more rooms.`;
    }

    setWizardState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Change = (field: string, value: any) => {
    setWizardState((prev) => {
      const newState = { ...prev, [field]: value, errors: {} };

      // Clear check-out date if check-in date changes and check-out is before new check-in
      if (field === "checkInDate" && prev.checkOutDate) {
        const newCheckIn = new Date(value);
        const checkOut = new Date(prev.checkOutDate);
        if (checkOut <= newCheckIn) {
          newState.checkOutDate = "";
        }
      }

      // Update number of guests and guests array
      if (field === "numberOfGuests") {
        const newGuests = [...prev.guests];
        if (value > newGuests.length) {
          // Add new guests
          for (let i = newGuests.length; i < value; i++) {
            newGuests.push({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              isLead: false,
            });
          }
        } else if (value < newGuests.length) {
          // Remove guests
          newGuests.splice(value);
        }
        newState.guests = newGuests;
      }

      return newState;
    });
  };

  const handleGuestChange = (index: number, field: string, value: any) => {
    setWizardState((prev) => {
      const newGuests = [...prev.guests];
      newGuests[index] = { ...newGuests[index], [field]: value };

      // Ensure only one lead guest
      if (field === "isLead" && value) {
        newGuests.forEach((guest, i) => {
          if (i !== index) {
            guest.isLead = false;
          }
        });
      }

      return { ...prev, guests: newGuests, errors: {} };
    });

    // Trigger guest lookup when email is entered
    if (field === "email" && value) {
      lookupGuestByEmail(value);
    }
  };

  const updateRoomQuantity = (roomTypeId: string, delta: number) => {
    const room = roomTypes.find((r) => r.id === roomTypeId);
    const maxAvailable = room?.availableRooms ?? 0;

    setWizardState((prev) => {
      const existing = prev.roomSelections.find((s) => s.roomTypeId === roomTypeId);
      const currentQty = existing?.quantity ?? 0;
      const newQty = Math.max(0, Math.min(currentQty + delta, maxAvailable));

      let newSelections: RoomSelection[];
      if (newQty === 0) {
        newSelections = prev.roomSelections.filter((s) => s.roomTypeId !== roomTypeId);
      } else if (existing) {
        newSelections = prev.roomSelections.map((s) =>
          s.roomTypeId === roomTypeId ? { ...s, quantity: newQty } : s
        );
      } else {
        newSelections = [...prev.roomSelections, { roomTypeId, quantity: newQty }];
      }
      return { ...prev, roomSelections: newSelections, errors: {} };
    });
  };

  const handleNextStep = () => {
    let isValid = false;

    if (wizardState.step === 1) {
      isValid = validateStep1();
      if (isValid) {
        setWizardState((prev) => ({ ...prev, step: 2 }));
      }
    } else if (wizardState.step === 2) {
      isValid = validateStep2();
      if (isValid) {
        setWizardState((prev) => ({ ...prev, step: 3 }));
      }
    } else if (wizardState.step === 3) {
      isValid = validateStep3();
      if (isValid) {
        setWizardState((prev) => ({ ...prev, step: 4 }));
      }
    }
  };

  const handlePrevStep = () => {
    setWizardState((prev) => ({
      ...prev,
      step: (prev.step - 1) as 1 | 2 | 3 | 4,
      errors: {},
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setWizardState((prev) => ({ ...prev, isLoading: true }));

    try {
      const leadGuest = wizardState.guests.find((g) => g.isLead);

      const response = (await apiClient.post("/staff-bookings/create-on-behalf", {
        hotelId: wizardState.selectedHotel,
        guestEmail: leadGuest?.email,
        firstName: leadGuest?.firstName,
        lastName: leadGuest?.lastName,
        guestPhone: leadGuest?.phone,
        checkInDate: wizardState.checkInDate,
        checkOutDate: wizardState.checkOutDate,
        rooms: wizardState.roomSelections,
        numberOfGuests: wizardState.numberOfGuests,
        sendPaymentLink: wizardState.sendPaymentLink,
        guests: wizardState.guests,
      })) as any;

      if (response.success) {
        onBookingCreated(response.booking);
        setTimeout(() => {
          onClose();
          resetWizard();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage = error.response?.data?.error || "Failed to create booking";
      setWizardState((prev) => ({
        ...prev,
        errors: { submit: errorMessage },
      }));
    } finally {
      setWizardState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const resetWizard = () => {
    setWizardState({
      step: 1,
      selectedHotel: hotelId,
      checkInDate: "",
      checkOutDate: "",
      numberOfGuests: 1,
      guests: [{ firstName: "", lastName: "", email: "", phone: "", isLead: true }],
      roomSelections: [],
      sendPaymentLink: false,
      isLoading: false,
      errors: {},
    });
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  // Focus management on mount
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hotelName = userHotels.find((h) => h.id === wizardState.selectedHotel)?.name || "Hotel";

  return (
    <div
      className={styles.backdrop}
      ref={modalRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 id="modal-title">Create Booking - Step {wizardState.step} of 4</h2>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`${styles.progressStep} ${
                step <= wizardState.step ? styles.active : ""
              }`}
              data-step={step}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Error Messages */}
          {wizardState.errors.submit && (
            <div className={styles.errorBanner} role="alert" aria-live="assertive">
              {wizardState.errors.submit}
            </div>
          )}

          {/* STEP 1: Hotel, Dates, Guests */}
          {wizardState.step === 1 && (
            <fieldset className={styles.section}>
              <legend>Hotel & Dates</legend>

              {duplicateBookingWarning && (
                <div className={styles.warningBanner} role="alert" aria-live="polite">
                  ⚠️ {duplicateBookingWarning}
                </div>
              )}

              {userHotels.length > 1 && (
                <div className={styles.formGroup}>
                  <label htmlFor="hotelSelect">Select Hotel *</label>
                  <select
                    id="hotelSelect"
                    value={wizardState.selectedHotel}
                    onChange={(e) => handleStep1Change("selectedHotel", e.target.value)}
                    disabled={wizardState.isLoading}
                    aria-invalid={!!wizardState.errors.selectedHotel}
                  >
                    <option value="">Select a hotel</option>
                    {userHotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                  {wizardState.errors.selectedHotel && (
                    <span className={styles.error}>{wizardState.errors.selectedHotel}</span>
                  )}
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="checkInDate">Check-In Date *</label>
                  <input
                    id="checkInDate"
                    type="date"
                    value={wizardState.checkInDate}
                    onChange={(e) => handleStep1Change("checkInDate", e.target.value)}
                    disabled={wizardState.isLoading}
                    aria-invalid={!!wizardState.errors.checkInDate}
                  />
                  {wizardState.errors.checkInDate && (
                    <span className={styles.error}>{wizardState.errors.checkInDate}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="checkOutDate">Check-Out Date *</label>
                  <input
                    id="checkOutDate"
                    type="date"
                    value={wizardState.checkOutDate}
                    onChange={(e) => handleStep1Change("checkOutDate", e.target.value)}
                    disabled={wizardState.isLoading}
                    aria-invalid={!!wizardState.errors.checkOutDate}
                  />
                  {wizardState.errors.checkOutDate && (
                    <span className={styles.error}>{wizardState.errors.checkOutDate}</span>
                  )}
                </div>
              </div>

              {nights > 0 && (
                <div className={styles.infoBox}>
                  <strong>{nights}</strong> night{nights !== 1 ? "s" : ""}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="numberOfGuests">Number of Guests *</label>
                <input
                  id="numberOfGuests"
                  type="number"
                  value={wizardState.numberOfGuests}
                  onChange={(e) =>
                    handleStep1Change("numberOfGuests", parseInt(e.target.value) || 1)
                  }
                  min="1"
                  disabled={wizardState.isLoading}
                  aria-invalid={!!wizardState.errors.numberOfGuests}
                />
                {wizardState.errors.numberOfGuests && (
                  <span className={styles.error}>{wizardState.errors.numberOfGuests}</span>
                )}
              </div>
            </fieldset>
          )}

          {/* STEP 2: Guest Information */}
          {wizardState.step === 2 && (
            <fieldset className={styles.section}>
              <legend>Guest Information</legend>

              {wizardState.errors.noLead && (
                <div className={styles.errorBanner} role="alert" aria-live="assertive">
                  {wizardState.errors.noLead}
                </div>
              )}

              {wizardState.guests.map((guest, index) => (
                <div key={index} className={styles.guestCard}>
                  <div className={styles.guestHeader}>
                    <h4>Guest {index + 1}</h4>
                    {wizardState.numberOfGuests > 1 && (
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={guest.isLead}
                          onChange={(e) =>
                            handleGuestChange(index, "isLead", e.target.checked)
                          }
                          disabled={wizardState.isLoading}
                        />
                        Lead Guest
                      </label>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor={`firstName_${index}`}>First Name *</label>
                      <input
                        id={`firstName_${index}`}
                        type="text"
                        value={guest.firstName}
                        onChange={(e) =>
                          handleGuestChange(index, "firstName", e.target.value)
                        }
                        placeholder="John"
                        disabled={wizardState.isLoading}
                        aria-invalid={!!wizardState.errors[`guest_${index}_firstName`]}
                      />
                      {wizardState.errors[`guest_${index}_firstName`] && (
                        <span className={styles.error}>
                          {wizardState.errors[`guest_${index}_firstName`]}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor={`lastName_${index}`}>Last Name *</label>
                      <input
                        id={`lastName_${index}`}
                        type="text"
                        value={guest.lastName}
                        onChange={(e) =>
                          handleGuestChange(index, "lastName", e.target.value)
                        }
                        placeholder="Doe"
                        disabled={wizardState.isLoading}
                        aria-invalid={!!wizardState.errors[`guest_${index}_lastName`]}
                      />
                      {wizardState.errors[`guest_${index}_lastName`] && (
                        <span className={styles.error}>
                          {wizardState.errors[`guest_${index}_lastName`]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`email_${index}`}>Email *</label>
                    <input
                      id={`email_${index}`}
                      type="email"
                      value={guest.email}
                      onChange={(e) => handleGuestChange(index, "email", e.target.value)}
                      placeholder="guest@example.com"
                      disabled={wizardState.isLoading}
                      aria-invalid={!!wizardState.errors[`guest_${index}_email`]}
                    />
                    {wizardState.errors[`guest_${index}_email`] && (
                      <span className={styles.error}>
                        {wizardState.errors[`guest_${index}_email`]}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`phone_${index}`}>Phone (Optional)</label>
                    <input
                      id={`phone_${index}`}
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => handleGuestChange(index, "phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={wizardState.isLoading}
                    />
                  </div>
                </div>
              ))}
            </fieldset>
          )}

          {/* STEP 3: Room Builder */}
          {wizardState.step === 3 && (
            <fieldset className={styles.section}>
              <legend>Select Rooms</legend>

              {/* Capacity tracker */}
              <div style={{
                background: totalCapacity >= wizardState.numberOfGuests ? "#f0fdf4" : "#fff7ed",
                border: `1px solid ${totalCapacity >= wizardState.numberOfGuests ? "#86efac" : "#fed7aa"}`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>
                  {totalCapacity >= wizardState.numberOfGuests ? "✅" : "⚠️"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    {totalRoomsSelected === 0
                      ? `Select rooms for ${wizardState.numberOfGuests} guest(s)`
                      : totalCapacity >= wizardState.numberOfGuests
                      ? `All ${wizardState.numberOfGuests} guest(s) accommodated across ${totalRoomsSelected} room(s)`
                      : `${totalCapacity}/${wizardState.numberOfGuests} guests accommodated — add more rooms`}
                  </div>
                  {totalRoomsSelected > 0 && (
                    <div style={{
                      marginTop: 4,
                      height: 6,
                      background: "#e5e7eb",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${Math.min(100, Math.round((totalCapacity / wizardState.numberOfGuests) * 100))}%`,
                        height: "100%",
                        background: totalCapacity >= wizardState.numberOfGuests ? "#22c55e" : "#f97316",
                        transition: "width 0.2s",
                      }} />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.roomGrid}>
                {roomTypes.map((room) => {
                  const qty = wizardState.roomSelections.find((s) => s.roomTypeId === room.id)?.quantity ?? 0;
                  const available = room.availableRooms ?? 0;
                  return (
                    <div
                      key={room.id}
                      className={`${styles.roomCard} ${qty > 0 ? styles.selected : ""}`}
                    >
                      <div className={styles.roomHeader}>
                        <h4>{room.name}</h4>
                        <span className={styles.price}>${room.basePrice ?? 0}/night</span>
                      </div>

                      {room.description && (
                        <p className={styles.roomDescription}>{room.description}</p>
                      )}

                      <div className={styles.roomDetails}>
                        <div className={styles.detail}>
                          <span>👥 Fits:</span> {room.capacity ?? "?"} guest(s) per room
                        </div>
                        <div className={styles.detail}>
                          <span>🛏 Available:</span> {available} room(s)
                        </div>
                      </div>

                      {/* Quantity stepper */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 12,
                        justifyContent: "flex-end",
                      }}>
                        {qty > 0 && (
                          <span style={{ fontSize: 12, color: "#6b7280" }}>
                            {(room.capacity ?? 0) * qty} guests fit
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => updateRoomQuantity(room.id, -1)}
                          disabled={qty === 0 || wizardState.isLoading}
                          style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: "1px solid #d1d5db", background: qty === 0 ? "#f9fafb" : "#fff",
                            cursor: qty === 0 ? "not-allowed" : "pointer",
                            fontSize: 16, lineHeight: 1, color: "#374151",
                          }}
                          aria-label={`Remove one ${room.name}`}
                        >
                          −
                        </button>
                        <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRoomQuantity(room.id, 1)}
                          disabled={qty >= available || wizardState.isLoading}
                          style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: "1px solid #2563eb",
                            background: qty >= available ? "#f9fafb" : "#2563eb",
                            cursor: qty >= available ? "not-allowed" : "pointer",
                            fontSize: 16, lineHeight: 1, color: qty >= available ? "#9ca3af" : "#fff",
                          }}
                          aria-label={`Add one ${room.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {wizardState.errors.rooms && (
                <span className={styles.error} role="alert" aria-live="assertive">
                  {wizardState.errors.rooms}
                </span>
              )}
            </fieldset>
          )}

          {/* STEP 4: Summary */}
          {wizardState.step === 4 && (
            <>
              <fieldset className={styles.section}>
                <legend>Booking Summary</legend>

                <div className={styles.summaryBox}>
                  <div className={styles.summarySection}>
                    <h4>Hotel & Dates</h4>
                    <div className={styles.summaryRow}>
                      <span>Hotel:</span>
                      <strong>{hotelName}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Check-in:</span>
                      <strong>{wizardState.checkInDate}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Check-out:</span>
                      <strong>{wizardState.checkOutDate}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Nights:</span>
                      <strong>{nights}</strong>
                    </div>
                  </div>

                  <div className={styles.summarySection}>
                    <h4>Guests</h4>
                    {wizardState.guests.map((guest, index) => (
                      <div key={index} className={styles.summaryRow}>
                        <span>
                          {guest.firstName} {guest.lastName}
                          {guest.isLead && <span className={styles.badge}>Lead</span>}
                        </span>
                        <span>{guest.email}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.summarySection}>
                    <h4>Room Breakdown</h4>
                    {wizardState.roomSelections.map((sel) => {
                      const room = roomTypes.find((r) => r.id === sel.roomTypeId);
                      const lineSubtotal = (room?.basePrice ?? 0) * nights * sel.quantity;
                      return (
                        <div key={sel.roomTypeId} className={styles.summaryRow}>
                          <span>
                            {room?.name ?? sel.roomTypeId} × {sel.quantity}
                            <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
                              ({(room?.capacity ?? 0) * sel.quantity} guests)
                            </span>
                          </span>
                          <strong>${(room?.basePrice ?? 0) * sel.quantity}/night</strong>
                        </div>
                      );
                    })}
                    <div className={styles.summaryRow}>
                      <span>Total rooms:</span>
                      <strong>{totalRoomsSelected}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Total capacity:</span>
                      <strong>{totalCapacity} guests</strong>
                    </div>
                  </div>

                  <div className={styles.summarySection} style={{ borderTop: "2px solid #ddd" }}>
                    {(() => {
                      const subtotal = wizardState.roomSelections.reduce((sum, sel) => {
                        const room = roomTypes.find((r) => r.id === sel.roomTypeId);
                        return sum + (room?.basePrice ?? 0) * nights * sel.quantity;
                      }, 0);
                      const tax = Math.round(subtotal * 0.15 * 100) / 100;
                      return (
                        <>
                          <div className={styles.summaryRow} style={{ color: "#6b7280", fontSize: 14 }}>
                            <span>Subtotal ({nights} night{nights !== 1 ? "s" : ""}):</span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          <div className={styles.summaryRow} style={{ color: "#6b7280", fontSize: 14 }}>
                            <span>Tax (15%):</span>
                            <span>${tax.toFixed(2)}</span>
                          </div>
                          <div className={styles.summaryRow} style={{ fontSize: 18 }}>
                            <span>Total:</span>
                            <strong style={{ color: "#2563eb" }}>${totalPrice.toFixed(2)}</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </fieldset>

              <fieldset className={styles.section}>
                <legend>Payment Options</legend>
                <div className={styles.checkboxGroup}>
                  <input
                    id="sendPaymentLink"
                    type="checkbox"
                    checked={wizardState.sendPaymentLink}
                    onChange={(e) =>
                      setWizardState((prev) => ({
                        ...prev,
                        sendPaymentLink: e.target.checked,
                      }))
                    }
                    disabled={wizardState.isLoading}
                  />
                  <label htmlFor="sendPaymentLink">
                    Send Payment Link to Guest (expires in 30 days)
                  </label>
                </div>
              </fieldset>
            </>
          )}

          {/* Navigation Buttons */}
          <div className={styles.actions}>
            {wizardState.step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={wizardState.isLoading}
                className={styles.secondaryButton}
              >
                ← Previous
              </button>
            )}

            {wizardState.step < 4 && (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={wizardState.isLoading}
                className={styles.primaryButton}
              >
                Next →
              </button>
            )}

            {wizardState.step === 4 && (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={wizardState.isLoading}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={wizardState.isLoading}
                  className={styles.submitButton}
                >
                  {wizardState.isLoading ? "Creating..." : "Create Booking"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
