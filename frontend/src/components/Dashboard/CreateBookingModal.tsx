"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import styles from "./CreateBookingModal.module.css";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  onBookingCreated: (booking: any) => void;
  mode?: 'hotel' | 'broker';
}

interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isLead: boolean;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
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
  brokerNotes: string;
  brokerFee: number;
}

interface HotelDetail {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  manasikScore?: number | null;
  scoringBreakdown?: {
    overall: number;
    proximity?: number;
    amenities?: number;
    reviews?: number;
    value?: number;
  } | null;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  images: Array<{ id: string; url: string; displayOrder: number }>;
  amenities: Record<string, boolean>;
  facilities?: string[];
  closestHaramGate?: {
    distanceMeters: number;
    walkingTimeMinutes: number;
    gateNumber: number;
    gateName: string;
    hasDirectKaabaAccess: boolean;
  } | null;
  bestForTags?: string[];
  walkDescription?: string;
  liftSituation?: string;
  distanceExplanation?: string;
}

/** Broker hotel info panel — shows full listing details in the left pane */
const BrokerHotelInfoPanel: React.FC<{ hotel: HotelDetail }> = ({ hotel }) => {
  const score = hotel.scoringBreakdown?.overall ?? hotel.manasikScore;
  const scoreColor = score != null ? (score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626') : undefined;
  const scoreBg = score != null ? (score >= 80 ? '#f0fdf4' : score >= 60 ? '#fefce8' : '#fef2f2') : undefined;
  const scoreLabel = score != null ? (score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair') : undefined;

  return (
    <>
      <div className={styles.hotelInfoHeader}>
        <h3>{hotel.name}</h3>
        {hotel.starRating > 0 && (
          <div className={styles.hotelStars}>
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} className={i < hotel.starRating ? "ri-star-fill" : "ri-star-line"} style={{ color: '#ffc107', fontSize: 16 }} />
            ))}
            {hotel.averageRating > 0 && (
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                {hotel.averageRating.toFixed(1)} ({hotel.totalReviews} reviews)
              </span>
            )}
          </div>
        )}
        {score != null && (
          <div className={styles.manasikBadge} style={{ background: scoreBg, color: scoreColor }}>
            <span>🕌</span>
            <span>Manasik Score: {Math.round(score)}/100</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>({scoreLabel})</span>
          </div>
        )}
      </div>

      {hotel.images && hotel.images.length > 0 && (
        <div className={styles.hotelImageGallery}>
          {hotel.images.slice(0, 3).map((img, idx) => (
            <img key={img.id || idx} src={img.url} alt={`${hotel.name} - ${idx + 1}`} loading="lazy" />
          ))}
        </div>
      )}

      <div className={styles.hotelInfoSection}>
        <h4>📍 Location</h4>
        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
          {[hotel.address, hotel.city, hotel.country].filter(Boolean).join(', ')}
        </p>
      </div>

      {hotel.description && (
        <div className={styles.hotelInfoSection}>
          <h4>About</h4>
          <p className={styles.hotelDescription}>{hotel.description}</p>
        </div>
      )}

      {hotel.closestHaramGate && (
        <div className={styles.hotelInfoSection}>
          <h4>🕌 Haram Proximity</h4>
          <div className={styles.proximityItem}>
            <span style={{ fontSize: 18 }}>🚶</span>
            <div>
              <div style={{ fontWeight: 600 }}>Gate {hotel.closestHaramGate.gateNumber} — {hotel.closestHaramGate.gateName}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {hotel.closestHaramGate.distanceMeters}m · {hotel.closestHaramGate.walkingTimeMinutes} min walk
                {hotel.closestHaramGate.hasDirectKaabaAccess && ' · Direct Kaaba access'}
              </div>
            </div>
          </div>
          {hotel.walkDescription && (
            <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0', fontStyle: 'italic' }}>{hotel.walkDescription}</p>
          )}
        </div>
      )}

      {hotel.facilities && hotel.facilities.length > 0 && (
        <div className={styles.hotelInfoSection}>
          <h4>🏢 Facilities</h4>
          <div className={styles.facilitiesList}>
            {hotel.facilities.map((f, i) => <span key={i} className={styles.facilityTag}>{f}</span>)}
          </div>
        </div>
      )}

      {hotel.amenities && Object.keys(hotel.amenities).length > 0 && (
        <div className={styles.hotelInfoSection}>
          <h4>✨ Amenities</h4>
          <div className={styles.amenitiesList}>
            {Object.entries(hotel.amenities).filter(([, v]) => v).map(([key]) => (
              <span key={key} className={styles.amenityTag}>✓ {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            ))}
          </div>
        </div>
      )}

      {hotel.bestForTags && hotel.bestForTags.length > 0 && (
        <div className={styles.hotelInfoSection}>
          <h4>🏷️ Best For</h4>
          <div className={styles.facilitiesList}>
            {hotel.bestForTags.map((tag, i) => (
              <span key={i} className={styles.facilityTag} style={{ background: '#fef3c7', borderColor: '#fcd34d', color: '#92400e' }}>{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.hotelInfoSection}>
        <h4>ℹ️ Hotel Info</h4>
        <div style={{ fontSize: 13, color: '#374151' }}>
          <div className={styles.proximityItem}><span>🔑</span> Check-in: <strong>{hotel.checkInTime || '14:00'}</strong></div>
          <div className={styles.proximityItem}><span>🚪</span> Check-out: <strong>{hotel.checkOutTime || '11:00'}</strong></div>
          {hotel.cancellationPolicy && <div className={styles.proximityItem}><span>📋</span> Cancellation: <strong>{hotel.cancellationPolicy}</strong></div>}
          {hotel.liftSituation && <div className={styles.proximityItem}><span>🛗</span> Lifts: {hotel.liftSituation}</div>}
        </div>
      </div>
    </>
  );
};

/** Reusable room selection content — used in both broker (right pane) and hotel (full width) modes */
const RoomSelectionContent: React.FC<{
  wizardState: WizardState;
  roomTypes: RoomType[];
  roomAvailabilityLoading: boolean;
  noRoomsAvailable: boolean;
  totalCapacity: number;
  totalRoomsSelected: number;
  updateRoomQuantity: (roomTypeId: string, delta: number) => void;
  styles: Record<string, string>;
}> = ({ wizardState, roomTypes, roomAvailabilityLoading, noRoomsAvailable, totalCapacity, totalRoomsSelected, updateRoomQuantity, styles: s }) => (
  <>
    {wizardState.checkInDate && wizardState.checkOutDate && (
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#1e40af", display: "flex", alignItems: "center", gap: 6 }}>
        <span>ℹ️</span> Rooms available for {wizardState.checkInDate} to {wizardState.checkOutDate}
      </div>
    )}

    {roomAvailabilityLoading && (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#6b7280", fontSize: 14 }}>Checking room availability...</div>
    )}

    {noRoomsAvailable && !roomAvailabilityLoading && (
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "16px", marginBottom: 16, textAlign: "center" }} role="alert" aria-live="polite">
        <div style={{ fontSize: 24, marginBottom: 8 }}>🚫</div>
        <div style={{ fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>No rooms available for the selected dates</div>
        <div style={{ fontSize: 13, color: "#b91c1c" }}>Try a different hotel or go back and change your dates.</div>
      </div>
    )}

    {!noRoomsAvailable && !roomAvailabilityLoading && (
      <div style={{
        background: totalCapacity >= wizardState.numberOfGuests ? "#f0fdf4" : "#fff7ed",
        border: `1px solid ${totalCapacity >= wizardState.numberOfGuests ? "#86efac" : "#fed7aa"}`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>{totalCapacity >= wizardState.numberOfGuests ? "✅" : "⚠️"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            {totalRoomsSelected === 0
              ? `Select rooms for ${wizardState.numberOfGuests} guest(s)`
              : totalCapacity >= wizardState.numberOfGuests
              ? `All ${wizardState.numberOfGuests} guest(s) accommodated across ${totalRoomsSelected} room(s)`
              : `${totalCapacity}/${wizardState.numberOfGuests} guests accommodated — add more rooms`}
          </div>
          {totalRoomsSelected > 0 && (
            <div style={{ marginTop: 4, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(100, Math.round((totalCapacity / wizardState.numberOfGuests) * 100))}%`,
                height: "100%", background: totalCapacity >= wizardState.numberOfGuests ? "#22c55e" : "#f97316", transition: "width 0.2s",
              }} />
            </div>
          )}
        </div>
      </div>
    )}

    {!noRoomsAvailable && !roomAvailabilityLoading && roomTypes.map((room) => {
      const qty = wizardState.roomSelections.find((sel) => sel.roomTypeId === room.id)?.quantity ?? 0;
      const available = room.availableRooms ?? 0;
      return (
        <div key={room.id} className={`${s.roomCard} ${qty > 0 ? s.selected : ""}`} style={{ marginBottom: 12 }}>
          <div className={s.roomHeader}>
            <h4>{room.name}</h4>
            <span className={s.price}>${room.basePrice ?? 0}/night</span>
          </div>
          {room.description && <p className={s.roomDescription}>{room.description}</p>}
          <div className={s.roomDetails}>
            <div className={s.detail}><span>👥 Fits:</span> {room.capacity ?? "?"} guest(s) per room</div>
            <div className={s.detail}><span>🛏 Available:</span> {available} room(s)</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, justifyContent: "flex-end" }}>
            {qty > 0 && <span style={{ fontSize: 12, color: "#6b7280" }}>{(room.capacity ?? 0) * qty} guests fit</span>}
            <button type="button" onClick={() => updateRoomQuantity(room.id, -1)} disabled={qty === 0 || wizardState.isLoading}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #d1d5db", background: qty === 0 ? "#f9fafb" : "#fff", cursor: qty === 0 ? "not-allowed" : "pointer", fontSize: 16, lineHeight: 1, color: "#374151" }}
              aria-label={`Remove one ${room.name}`}>−</button>
            <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{qty}</span>
            <button type="button" onClick={() => updateRoomQuantity(room.id, 1)} disabled={qty >= available || wizardState.isLoading}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #2563eb", background: qty >= available ? "#f9fafb" : "#2563eb", cursor: qty >= available ? "not-allowed" : "pointer", fontSize: 16, lineHeight: 1, color: qty >= available ? "#9ca3af" : "#fff" }}
              aria-label={`Add one ${room.name}`}>+</button>
          </div>
        </div>
      );
    })}

    {wizardState.errors.rooms && (
      <span className={s.error} role="alert" aria-live="assertive">{wizardState.errors.rooms}</span>
    )}
  </>
);

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  hotelId,
  onBookingCreated,
  mode = 'hotel',
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
    brokerNotes: "",
    brokerFee: 0,
  });

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [guestLookupLoading, setGuestLookupLoading] = useState(false);
  const [duplicateBookingWarning, setDuplicateBookingWarning] = useState<string | null>(null);
  const [userHotels, setUserHotels] = useState<Array<{ id: string; name: string }>>([]);
  const [roomAvailabilityLoading, setRoomAvailabilityLoading] = useState(false);
  const [noRoomsAvailable, setNoRoomsAvailable] = useState(false);
  const [selectedHotelDetail, setSelectedHotelDetail] = useState<HotelDetail | null>(null);
  const [hotelDetailLoading, setHotelDetailLoading] = useState(false);

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

  // Fetch room types when hotel changes (fallback without dates)
  useEffect(() => {
    if (wizardState.selectedHotel && isOpen && !wizardState.checkInDate && !wizardState.checkOutDate) {
      fetchRoomTypes();
    }
  }, [wizardState.selectedHotel, isOpen]);

  // Re-fetch room availability when dates or hotel change
  useEffect(() => {
    if (
      wizardState.selectedHotel &&
      wizardState.checkInDate &&
      wizardState.checkOutDate &&
      isOpen
    ) {
      const checkIn = new Date(wizardState.checkInDate);
      const checkOut = new Date(wizardState.checkOutDate);
      if (checkOut > checkIn) {
        fetchRoomAvailability();
        // Clear room selections since availability may have changed
        setWizardState((prev) => ({ ...prev, roomSelections: [] }));
      }
    }
  }, [wizardState.selectedHotel, wizardState.checkInDate, wizardState.checkOutDate, isOpen]);

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
      const brokerFeeAmount = mode === 'broker' ? (wizardState.brokerFee || 0) : 0;
      setTotalPrice(Math.round((subtotal * 1.15 + brokerFeeAmount) * 100) / 100);
    } else {
      setTotalPrice(0);
    }
  }, [nights, wizardState.roomSelections, wizardState.brokerFee, roomTypes, mode]);

  const fetchRoomTypes = async () => {
    try {
      const response = (await apiClient.get(
        `/broker/hotels/${wizardState.selectedHotel}/rooms`
      )) as { rooms?: RoomType[] };
      setRoomTypes(response.rooms || []);
      setNoRoomsAvailable(false);
    } catch (error) {
      console.error("Error fetching room types:", error);
      setWizardState((prev) => ({
        ...prev,
        errors: { ...prev.errors, roomTypes: "Failed to load room types" },
      }));
    }
  };

  const fetchRoomAvailability = async () => {
    setRoomAvailabilityLoading(true);
    setNoRoomsAvailable(false);
    try {
      const response = (await apiClient.get(
        `/hotels/${wizardState.selectedHotel}/rooms/availability?checkIn=${wizardState.checkInDate}&checkOut=${wizardState.checkOutDate}`
      )) as { rooms?: RoomType[] };
      const rooms = response.rooms || [];
      setRoomTypes(rooms);
      setNoRoomsAvailable(rooms.length === 0);
    } catch (error) {
      console.error("Error fetching room availability:", error);
      // Fall back to the regular room types endpoint
      await fetchRoomTypes();
    } finally {
      setRoomAvailabilityLoading(false);
    }
  };

  const fetchUserHotels = async () => {
    try {
      if (mode === 'broker') {
        const response = (await apiClient.get("/broker-bookings/active-hotels")) as {
          hotels?: Array<{ id: string; name: string }>;
        };
        setUserHotels(response.hotels || []);
      } else {
        const response = (await apiClient.get("/hotels/listings")) as {
          hotels?: Array<{ id: string; name: string }>;
        };
        setUserHotels(response.hotels || []);
      }
    } catch (error) {
      console.error("Error fetching user hotels:", error);
      setUserHotels([]);
    }
  };

  // Fetch full hotel details when hotel is selected (broker mode only)
  const fetchHotelDetails = async (hotelId: string) => {
    if (!hotelId) {
      setSelectedHotelDetail(null);
      return;
    }
    setHotelDetailLoading(true);
    try {
      const response = (await apiClient.get(`/hotels/${hotelId}`)) as { hotel?: HotelDetail };
      setSelectedHotelDetail(response.hotel || null);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setSelectedHotelDetail(null);
    } finally {
      setHotelDetailLoading(false);
    }
  };

  // Fetch hotel details when selected hotel changes in broker mode
  useEffect(() => {
    if (mode === 'broker' && wizardState.selectedHotel && isOpen) {
      fetchHotelDetails(wizardState.selectedHotel);
    } else if (!wizardState.selectedHotel) {
      setSelectedHotelDetail(null);
    }
  }, [wizardState.selectedHotel, isOpen, mode]);

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

  // Step 1: Dates + Number of Guests
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

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

  // Step 2: Hotel Selection + Room Selection
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!wizardState.selectedHotel) {
      newErrors.selectedHotel = "Hotel is required";
    }

    if (totalRoomsSelected === 0) {
      newErrors.rooms = "Please select at least one room";
    } else if (totalCapacity < wizardState.numberOfGuests) {
      newErrors.rooms = `Selected rooms fit ${totalCapacity} guest(s) but ${wizardState.numberOfGuests} are needed. Please add more rooms.`;
    }

    setWizardState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Step 3: Guest Details
  const validateStep3 = (): boolean => {
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
      // In broker mode, phone is required for lead guest
      if (mode === 'broker' && guest.isLead && !guest.phone?.trim()) {
        newErrors[`guest_${index}_phone`] = "Phone is required for lead guest";
      }
    });

    const hasLead = wizardState.guests.some((g) => g.isLead);
    if (!hasLead) {
      newErrors.noLead = "At least one guest must be marked as lead";
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

      let response: any;

      if (mode === 'broker') {
        // Broker mode: submit to broker-bookings/create
        response = (await apiClient.post("/broker-bookings/create", {
          hotelId: wizardState.selectedHotel,
          checkInDate: wizardState.checkInDate,
          checkOutDate: wizardState.checkOutDate,
          rooms: wizardState.roomSelections,
          numberOfGuests: wizardState.numberOfGuests,
          guests: wizardState.guests.map((g) => ({
            firstName: g.firstName,
            lastName: g.lastName,
            email: g.email,
            phone: g.phone,
            nationality: g.nationality || undefined,
            passportNumber: g.passportNumber || undefined,
            dateOfBirth: g.dateOfBirth || undefined,
            isLead: g.isLead,
          })),
          brokerNotes: wizardState.brokerNotes || undefined,
          brokerFee: wizardState.brokerFee || 0,
          sendPaymentLink: wizardState.sendPaymentLink,
        })) as any;
      } else {
        // Hotel mode: submit to staff-bookings/create-on-behalf (existing behavior)
        response = (await apiClient.post("/staff-bookings/create-on-behalf", {
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
      }

      if (response.success) {
        onBookingCreated(response.booking);
        setTimeout(() => {
          onClose();
          resetWizard();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage = error.response?.data?.error || error.error || "Failed to create booking";
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
      brokerNotes: "",
      brokerFee: 0,
    });
    setRoomAvailabilityLoading(false);
    setNoRoomsAvailable(false);
    setSelectedHotelDetail(null);
    setHotelDetailLoading(false);
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
        className={mode === 'broker' && wizardState.step === 2 ? styles.modalWide : styles.modal}
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

          {/* STEP 1: Dates & Number of Guests */}
          {wizardState.step === 1 && (
            <fieldset className={styles.section}>
              <legend>Dates & Guests</legend>

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

          {/* STEP 2: Hotel Selection & Room Builder */}
          {wizardState.step === 2 && (
            <fieldset className={styles.section}>
              <legend>Select Hotel & Rooms</legend>

              {duplicateBookingWarning && (
                <div className={styles.warningBanner} role="alert" aria-live="polite">
                  ⚠️ {duplicateBookingWarning}
                </div>
              )}

              {/* Hotel Selection - always show in broker mode, show in hotel mode if multiple hotels */}
              {(mode === 'broker' || userHotels.length > 1) && (
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

              {/* Show hotel name when auto-selected (single hotel in hotel mode) */}
              {mode === 'hotel' && userHotels.length === 1 && wizardState.selectedHotel && (
                <div style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 12,
                  fontSize: 14,
                  color: "#166534",
                  fontWeight: 500,
                }}>
                  🏨 {userHotels[0].name}
                </div>
              )}

              {/* Room selection area - only show when hotel is selected */}
              {wizardState.selectedHotel && mode === 'broker' && (
                <div className={styles.splitPane}>
                  {/* Left: Hotel Information Panel */}
                  <div className={styles.hotelInfoPanel}>
                    {hotelDetailLoading && <div className={styles.hotelInfoLoading}>Loading hotel details...</div>}
                    {!hotelDetailLoading && selectedHotelDetail && (
                      <BrokerHotelInfoPanel hotel={selectedHotelDetail} />
                    )}
                    {!hotelDetailLoading && !selectedHotelDetail && (
                      <div className={styles.hotelInfoLoading}>Unable to load hotel details</div>
                    )}
                  </div>
                  {/* Right: Room Selection */}
                  <div className={styles.roomSelectionPanel}>
                    <RoomSelectionContent
                      wizardState={wizardState}
                      roomTypes={roomTypes}
                      roomAvailabilityLoading={roomAvailabilityLoading}
                      noRoomsAvailable={noRoomsAvailable}
                      totalCapacity={totalCapacity}
                      totalRoomsSelected={totalRoomsSelected}
                      updateRoomQuantity={updateRoomQuantity}
                      styles={styles}
                    />
                  </div>
                </div>
              )}

              {/* HOTEL MODE: Standard single-column room selection */}
              {wizardState.selectedHotel && mode !== 'broker' && (
                <RoomSelectionContent
                  wizardState={wizardState}
                  roomTypes={roomTypes}
                  roomAvailabilityLoading={roomAvailabilityLoading}
                  noRoomsAvailable={noRoomsAvailable}
                  totalCapacity={totalCapacity}
                  totalRoomsSelected={totalRoomsSelected}
                  updateRoomQuantity={updateRoomQuantity}
                  styles={styles}
                />
              )}

              {/* Prompt to select hotel first */}
              {!wizardState.selectedHotel && (mode === 'broker' || userHotels.length > 1) && (
                <div style={{
                  textAlign: "center",
                  padding: "30px 20px",
                  color: "#6b7280",
                  fontSize: 14,
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px dashed #d1d5db",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏨</div>
                  Select a hotel above to see available rooms
                </div>
              )}
            </fieldset>
          )}

          {/* STEP 3: Guest Information */}
          {wizardState.step === 3 && (
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
                    <label htmlFor={`phone_${index}`}>
                      Phone {mode === 'broker' && guest.isLead ? '*' : '(Optional)'}
                    </label>
                    <input
                      id={`phone_${index}`}
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => handleGuestChange(index, "phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={wizardState.isLoading}
                      aria-invalid={!!wizardState.errors[`guest_${index}_phone`]}
                    />
                    {wizardState.errors[`guest_${index}_phone`] && (
                      <span className={styles.error}>
                        {wizardState.errors[`guest_${index}_phone`]}
                      </span>
                    )}
                  </div>

                  {/* Broker-specific fields: nationality, passport, DOB */}
                  {mode === 'broker' && (
                    <>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor={`nationality_${index}`}>Nationality (Optional)</label>
                          <input
                            id={`nationality_${index}`}
                            type="text"
                            value={guest.nationality || ""}
                            onChange={(e) =>
                              handleGuestChange(index, "nationality", e.target.value)
                            }
                            placeholder="e.g. Saudi Arabian"
                            disabled={wizardState.isLoading}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor={`passportNumber_${index}`}>Passport Number (Optional)</label>
                          <input
                            id={`passportNumber_${index}`}
                            type="text"
                            value={guest.passportNumber || ""}
                            onChange={(e) =>
                              handleGuestChange(index, "passportNumber", e.target.value)
                            }
                            placeholder="e.g. AB1234567"
                            disabled={wizardState.isLoading}
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor={`dateOfBirth_${index}`}>Date of Birth (Optional)</label>
                        <input
                          id={`dateOfBirth_${index}`}
                          type="date"
                          value={guest.dateOfBirth || ""}
                          onChange={(e) =>
                            handleGuestChange(index, "dateOfBirth", e.target.value)
                          }
                          disabled={wizardState.isLoading}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Broker Notes & Fee - only in broker mode */}
              {mode === 'broker' && (
                <>
                  <div className={styles.formGroup} style={{ marginTop: 16 }}>
                    <label htmlFor="brokerFee">Broker Fee ($)</label>
                    <input
                      id="brokerFee"
                      type="number"
                      value={wizardState.brokerFee || ""}
                      onChange={(e) =>
                        setWizardState((prev) => ({
                          ...prev,
                          brokerFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={wizardState.isLoading}
                    />
                    <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                      This fee will be itemised on the booking confirmation
                    </span>
                  </div>
                  <div className={styles.formGroup} style={{ marginTop: 16 }}>
                    <label htmlFor="brokerNotes">Broker Notes (Optional)</label>
                    <textarea
                      id="brokerNotes"
                      value={wizardState.brokerNotes}
                      onChange={(e) =>
                        setWizardState((prev) => ({
                          ...prev,
                          brokerNotes: e.target.value,
                        }))
                      }
                      placeholder="Add any special requests or notes for this booking..."
                      rows={3}
                      disabled={wizardState.isLoading}
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
                </>
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

                  {/* Broker Notes in summary */}
                  {mode === 'broker' && wizardState.brokerNotes && (
                    <div className={styles.summarySection}>
                      <h4>Broker Notes</h4>
                      <p style={{ fontSize: 14, color: "#374151", margin: 0, whiteSpace: "pre-wrap" }}>
                        {wizardState.brokerNotes}
                      </p>
                    </div>
                  )}

                  <div className={styles.summarySection} style={{ borderTop: "2px solid #ddd" }}>
                    {(() => {
                      const subtotal = wizardState.roomSelections.reduce((sum, sel) => {
                        const room = roomTypes.find((r) => r.id === sel.roomTypeId);
                        return sum + (room?.basePrice ?? 0) * nights * sel.quantity;
                      }, 0);
                      const tax = Math.round(subtotal * 0.15 * 100) / 100;
                      const brokerFeeAmount = mode === 'broker' ? (wizardState.brokerFee || 0) : 0;
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
                          {mode === 'broker' && brokerFeeAmount > 0 && (
                            <div className={styles.summaryRow} style={{ color: "#92400e", fontSize: 14, background: "#fef3c7", margin: "4px -8px", padding: "8px" , borderRadius: 4 }}>
                              <span>💼 Broker Fee:</span>
                              <strong>${brokerFeeAmount.toFixed(2)}</strong>
                            </div>
                          )}
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
